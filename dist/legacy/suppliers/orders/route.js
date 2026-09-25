"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== 'SUPPLIER') {
        return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supplierId = session.user.id;
    try {
        const procurements = await prisma_1.prisma.procurement.findMany({
            where: { status: true },
            include: {
                items: {
                    where: {
                        assignments: {
                            some: { supplierId }
                        }
                    },
                    include: {
                        product: {
                            select: { name: true, sku: true, image: true }
                        },
                        assignments: {
                            where: { supplierId },
                            select: { quantity: true, costPrice: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Remove procurements with no items assigned to this supplier
        const filtered = procurements.filter(p => p.items.length > 0);
        return server_1.NextResponse.json({ procurements: filtered });
    }
    catch (error) {
        console.error('Supplier orders error:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch assigned orders' }, { status: 500 });
    }
}
