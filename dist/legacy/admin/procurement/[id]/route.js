"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
async function GET(request, { params }) {
    try {
        const { id } = await params; // ✅ Await the promise
        const procurement = await prisma_1.prisma.procurement.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        if (!procurement) {
            return server_1.NextResponse.json({ error: 'Procurement not found' }, { status: 404 });
        }
        return server_1.NextResponse.json({ procurement });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: 'Failed to fetch procurement' }, { status: 500 });
    }
}
async function PUT(request, { params }) {
    try {
        const { id } = await params; // ✅ Await
        const body = await request.json();
        const { items, notes, status } = body;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.procurementItem.deleteMany({ where: { procurementId: id } }),
            prisma_1.prisma.procurement.update({
                where: { id },
                data: {
                    notes,
                    status,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            orderQuantity: item.orderQuantity,
                            mrp: item.mrp,
                            costPrice: item.costPrice,
                            sellPrice: item.sellPrice,
                            requiredQuantity: item.requiredQuantity,
                            bidding: item.bidding,
                        })),
                    },
                },
            }),
        ]);
        const updated = await prisma_1.prisma.procurement.findUnique({
            where: { id },
            include: { items: true },
        });
        return server_1.NextResponse.json({ procurement: updated });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: 'Failed to update procurement' }, { status: 500 });
    }
}
async function DELETE(request, { params }) {
    try {
        const { id } = await params; // ✅ Await
        await prisma_1.prisma.procurement.delete({ where: { id } });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Failed to delete procurement' }, { status: 500 });
    }
}
