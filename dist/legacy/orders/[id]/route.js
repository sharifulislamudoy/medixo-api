"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PATCH = PATCH;
exports.PUT = PUT;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
// GET order details
async function GET(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (order.userId !== session.user.id) {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return server_1.NextResponse.json({ order });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// PATCH: Cancel order (only if PENDING)
async function PATCH(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        // Fetch order with items
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (order.userId !== session.user.id) {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (order.status !== 'PENDING') {
            return server_1.NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
        }
        // Transaction: update order status and restore stock
        await prisma_1.prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
            // Restore stock for each item
            for (const item of order.items) {
                await tx.stock.update({
                    where: { productId: item.productId },
                    data: { quantity: { increment: item.quantity } },
                });
            }
        });
        return server_1.NextResponse.json({ message: 'Order cancelled successfully' });
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// PUT: Edit items in a pending order
async function PUT(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const { items } = await req.json(); // items: [{ productId, quantity }]
        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            return server_1.NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
        }
        // Fetch order with current items
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (order.userId !== session.user.id) {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (order.status !== 'PENDING') {
            return server_1.NextResponse.json({ error: 'Only pending orders can be edited' }, { status: 400 });
        }
        // Build map of existing items by productId
        const existingItemsMap = new Map(order.items.map((item) => [item.productId, item]));
        // Validate that all productIds in request belong to this order
        for (const reqItem of items) {
            if (!existingItemsMap.has(reqItem.productId)) {
                return server_1.NextResponse.json({ error: `Product ${reqItem.productId} is not part of this order` }, { status: 400 });
            }
            if (reqItem.quantity < 0 || !Number.isInteger(reqItem.quantity)) {
                return server_1.NextResponse.json({ error: 'Quantity must be a non‑negative integer' }, { status: 400 });
            }
        }
        // Calculate stock adjustments and new total
        let newTotal = 0;
        const updates = [];
        for (const reqItem of items) {
            const existing = existingItemsMap.get(reqItem.productId);
            const quantityDiff = reqItem.quantity - existing.quantity;
            // Stock update: decrement by difference (negative diff means add back stock)
            if (quantityDiff !== 0) {
                updates.push(prisma_1.prisma.stock.update({
                    where: { productId: reqItem.productId },
                    data: { quantity: { decrement: quantityDiff } }, // if diff positive, stock decreases; if negative, stock increases
                }));
            }
            // Update order item quantity and price (keep original price)
            newTotal += existing.price * reqItem.quantity;
            updates.push(prisma_1.prisma.orderItem.update({
                where: { id: existing.id },
                data: { quantity: reqItem.quantity },
            }));
        }
        // If any item was completely removed (quantity 0), delete it
        const removedItems = order.items.filter((item) => !items.some((ri) => ri.productId === item.productId));
        for (const removed of removedItems) {
            // Restore stock for removed item
            updates.push(prisma_1.prisma.stock.update({
                where: { productId: removed.productId },
                data: { quantity: { increment: removed.quantity } },
            }));
            updates.push(prisma_1.prisma.orderItem.delete({ where: { id: removed.id } }));
        }
        // Update order total
        updates.push(prisma_1.prisma.order.update({
            where: { id },
            data: { totalAmount: newTotal },
        }));
        // Execute all updates in a transaction
        await prisma_1.prisma.$transaction(updates);
        return server_1.NextResponse.json({ message: 'Order updated successfully' });
    }
    catch (error) {
        console.error('Error updating order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
