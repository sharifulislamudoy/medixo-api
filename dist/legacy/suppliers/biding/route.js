"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id || session.user.role !== 'SUPPLIER') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const supplierId = session.user.id;
        const procurements = await prisma_1.prisma.procurement.findMany({
            where: {
                status: true,
                items: {
                    some: {
                        bidding: true,
                    },
                },
            },
            include: {
                items: {
                    where: { bidding: true },
                    include: {
                        product: {
                            select: { name: true, sku: true, image: true },
                        },
                        assignments: {
                            where: { supplierId },
                            select: { quantity: true, costPrice: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Transform response
        const transformed = procurements.map((proc) => ({
            id: proc.id,
            prNumber: proc.prNumber,
            createdAt: proc.createdAt.toISOString(),
            status: proc.status,
            items: proc.items.map((item) => ({
                id: item.id,
                product: item.product,
                requiredQuantity: item.requiredQuantity,
                bidding: item.bidding,
                assignments: item.assignments,
            })),
        }));
        return server_1.NextResponse.json({ procurements: transformed });
    }
    catch (error) {
        console.error('Supplier bidding GET error:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch bidding items' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id || session.user.role !== 'SUPPLIER') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const supplierId = session.user.id;
        const body = await request.json();
        const { procurementItemId, quantity, costPrice } = body;
        if (!procurementItemId || typeof quantity !== 'number' || typeof costPrice !== 'number') {
            return server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (quantity <= 0 || costPrice <= 0) {
            return server_1.NextResponse.json({ error: 'Quantity and cost price must be positive' }, { status: 400 });
        }
        // Verify procurement item exists, procurement is active, and bidding is true
        const procurementItem = await prisma_1.prisma.procurementItem.findUnique({
            where: { id: procurementItemId },
            include: { procurement: true },
        });
        if (!procurementItem) {
            return server_1.NextResponse.json({ error: 'Procurement item not found' }, { status: 404 });
        }
        if (!procurementItem.procurement.status) {
            return server_1.NextResponse.json({ error: 'Procurement is not active' }, { status: 400 });
        }
        if (!procurementItem.bidding) {
            return server_1.NextResponse.json({ error: 'Bidding is closed for this item' }, { status: 400 });
        }
        const assignment = await prisma_1.prisma.procurementAssignment.upsert({
            where: {
                procurementItemId_supplierId: {
                    procurementItemId,
                    supplierId,
                },
            },
            update: {
                quantity,
                costPrice,
            },
            create: {
                procurementItemId,
                supplierId,
                quantity,
                costPrice,
            },
        });
        return server_1.NextResponse.json({ success: true, assignment });
    }
    catch (error) {
        console.error('Supplier bidding POST error:', error);
        return server_1.NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 });
    }
}
