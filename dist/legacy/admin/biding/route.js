"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Fetch only active procurements that have items with bids
        const procurements = await prisma_1.prisma.procurement.findMany({
            where: {
                status: true,
                items: {
                    some: {
                        assignments: { some: {} }, // has at least one bid
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, sku: true, image: true },
                        },
                        assignments: {
                            include: {
                                supplier: {
                                    select: { id: true, name: true, shopName: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Transform for frontend
        const transformed = procurements.map((proc) => ({
            id: proc.id,
            prNumber: proc.prNumber,
            createdAt: proc.createdAt.toISOString(),
            items: proc.items.map((item) => ({
                id: item.id,
                product: item.product,
                requiredQuantity: item.requiredQuantity,
                assignments: item.assignments.map((a) => ({
                    supplierId: a.supplierId,
                    supplierName: a.supplier.name,
                    supplierShop: a.supplier.shopName,
                    quantity: a.quantity,
                    costPrice: a.costPrice,
                })),
            })),
        }));
        return server_1.NextResponse.json({ procurements: transformed });
    }
    catch (error) {
        console.error('Admin bids GET error:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
    }
}
