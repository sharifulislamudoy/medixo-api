"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
const prisma_1 = require("../../../../../lib/prisma");
async function POST(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== "DELIVERY_BOY") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const { items } = await req.json(); // items: { productId, missingQuantity }[]
        if (!items || !Array.isArray(items)) {
            return server_1.NextResponse.json({ error: "Invalid items data" }, { status: 400 });
        }
        // Get delivery boy's assigned delivery code
        const deliveryBoy = await prisma_1.prisma.user.findUnique({
            where: { id: session.user.id },
            select: { deliveryCodeId: true },
        });
        if (!deliveryBoy?.deliveryCodeId) {
            return server_1.NextResponse.json({ error: "You are not assigned to any delivery code" }, { status: 403 });
        }
        // Fetch order with items
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.deliveryCodeId !== deliveryBoy.deliveryCodeId) {
            return server_1.NextResponse.json({ error: "This order is not assigned to you" }, { status: 403 });
        }
        if (order.status !== "SHIPPED") {
            return server_1.NextResponse.json({ error: "Only SHIPPED orders can record missing items" }, { status: 400 });
        }
        // Validate items
        const itemMap = new Map(order.items.map(i => [i.productId, i]));
        for (const reqItem of items) {
            const existing = itemMap.get(reqItem.productId);
            if (!existing) {
                return server_1.NextResponse.json({ error: `Product ${reqItem.productId} is not part of this order` }, { status: 400 });
            }
            const maxMissing = existing.quantity - existing.returnedQuantity - existing.missingQuantity;
            if (reqItem.missingQuantity < 0 || reqItem.missingQuantity > maxMissing) {
                return server_1.NextResponse.json({ error: `Invalid missing quantity for product ${existing.product.name}` }, { status: 400 });
            }
        }
        // Perform updates in transaction
        await prisma_1.prisma.$transaction(async (tx) => {
            for (const reqItem of items) {
                if (reqItem.missingQuantity > 0) {
                    const existing = itemMap.get(reqItem.productId);
                    // Update missing quantity on the order item
                    await tx.orderItem.update({
                        where: { id: existing.id },
                        data: {
                            missingQuantity: { increment: reqItem.missingQuantity },
                        },
                    });
                    // Return the missing quantity to stock (since it wasn't actually shipped)
                    await tx.stock.update({
                        where: { productId: reqItem.productId },
                        data: { quantity: { increment: reqItem.missingQuantity } },
                    });
                }
            }
            // NOTE: Order status remains SHIPPED – delivery boy will deliver later
        });
        return server_1.NextResponse.json({ message: "Missing items recorded" });
    }
    catch (error) {
        console.error("Error recording missing items:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
