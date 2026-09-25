"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// app/api/admin/procurement/route.ts
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
// GET /api/admin/procurement – list all procurements
async function GET() {
    try {
        const procurements = await prisma_1.prisma.procurement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        return server_1.NextResponse.json({ procurements });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Failed to fetch procurements' }, { status: 500 });
    }
}
// POST /api/admin/procurement – create a new procurement
async function POST(request) {
    try {
        const body = await request.json();
        const { items, notes } = body;
        // Generate PR number (PQ-0001 style)
        const lastProcurement = await prisma_1.prisma.procurement.findFirst({
            orderBy: { prNumber: 'desc' },
        });
        let nextNumber = 1;
        if (lastProcurement) {
            const match = lastProcurement.prNumber.match(/PQ-(\d+)/);
            if (match)
                nextNumber = parseInt(match[1], 10) + 1;
        }
        const prNumber = `PQ-${nextNumber.toString().padStart(4, '0')}`;
        const procurement = await prisma_1.prisma.procurement.create({
            data: {
                prNumber,
                notes,
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
        });
        return server_1.NextResponse.json({ procurement });
    }
    catch (error) {
        console.error('Create procurement error:', error);
        return server_1.NextResponse.json({ error: 'Failed to create procurement' }, { status: 500 });
    }
}
