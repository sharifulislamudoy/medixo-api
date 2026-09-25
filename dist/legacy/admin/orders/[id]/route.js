"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
const prisma_1 = require("../../../../lib/prisma");
// GET single order
async function GET(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
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
                                sku: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return server_1.NextResponse.json({ order });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// PUT – Update order items (edit)
async function PUT(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const { items } = await req.json(); // items: [{ productId, quantity }]
        if (!items || !Array.isArray(items) || items.length === 0) {
            return server_1.NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
        }
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        await prisma_1.prisma.$transaction(async (tx) => {
            const existingItems = order.items;
            // Restore stock for existing items
            for (const existing of existingItems) {
                await tx.stock.update({
                    where: { productId: existing.productId },
                    data: { quantity: { increment: existing.quantity } },
                });
            }
            // Delete all existing order items
            await tx.orderItem.deleteMany({ where: { orderId: id } });
            // Create new items and decrement stock
            let newTotal = 0;
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { sellPrice: true },
                });
                if (!product)
                    throw new Error(`Product ${item.productId} not found`);
                newTotal += product.sellPrice * item.quantity;
                await tx.stock.update({
                    where: { productId: item.productId },
                    data: { quantity: { decrement: item.quantity } },
                });
                await tx.orderItem.create({
                    data: {
                        orderId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: product.sellPrice,
                    },
                });
            }
            // Update order total
            await tx.order.update({
                where: { id },
                data: { totalAmount: newTotal },
            });
        });
        return server_1.NextResponse.json({ message: 'Order updated successfully' });
    }
    catch (error) {
        console.error('Error updating order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// PATCH – Update status and/or payment status
async function PATCH(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const { status, paymentStatus } = await req.json();
        const updateData = {};
        if (status)
            updateData.status = status;
        if (paymentStatus)
            updateData.paymentStatus = paymentStatus;
        await prisma_1.prisma.order.update({
            where: { id },
            data: updateData,
        });
        return server_1.NextResponse.json({ message: 'Order status updated' });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// DELETE – Delete an order and revert stock
async function DELETE(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        await prisma_1.prisma.$transaction(async (tx) => {
            // Get order items to revert stock
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!order)
                throw new Error('Order not found');
            // Revert stock for each item
            for (const item of order.items) {
                await tx.stock.update({
                    where: { productId: item.productId },
                    data: { quantity: { increment: item.quantity } },
                });
            }
            // Delete order (cascades to order items if schema has onDelete: Cascade)
            await tx.order.delete({ where: { id } });
        });
        return server_1.NextResponse.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting order:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
