"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
// app/api/admin/procurement/bulk/route.ts
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
async function POST(request) {
    try {
        const { orderIds } = await request.json();
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return server_1.NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });
        }
        // Fetch orders with items
        const orders = await prisma_1.prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                stock: true,
                                brand: true,
                            },
                        },
                    },
                },
            },
        });
        // Aggregate items by productId
        const productMap = new Map();
        for (const order of orders) {
            for (const item of order.items) {
                const prod = item.product;
                const existing = productMap.get(prod.id);
                const orderQty = item.quantity - (item.returnedQuantity || 0); // only non-returned quantity
                if (existing) {
                    existing.orderQuantity += orderQty;
                }
                else {
                    productMap.set(prod.id, {
                        productId: prod.id,
                        productName: prod.name,
                        productImage: prod.image,
                        sku: prod.sku,
                        brandName: prod.brand?.name || null,
                        mrp: prod.mrp,
                        costPrice: prod.costPrice,
                        sellPrice: prod.sellPrice,
                        currentStock: prod.stock?.quantity ?? 0,
                        orderQuantity: orderQty,
                    });
                }
            }
        }
        const products = Array.from(productMap.values()).map(p => ({
            ...p,
            // default required quantity: order quantity + current stock (if stock positive)
            requiredQuantity: p.orderQuantity + (p.currentStock > 0 ? p.currentStock : 0),
            bidding: false,
        }));
        return server_1.NextResponse.json({ products });
    }
    catch (error) {
        console.error('Bulk procurement error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
