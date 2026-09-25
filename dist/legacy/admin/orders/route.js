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
        if (!session?.user || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const orders = await prisma_1.prisma.order.findMany({
            orderBy: { orderDate: 'desc' },
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
                deliveryCode: {
                    // 👈 include delivery code
                    select: { code: true },
                },
            },
        });
        return server_1.NextResponse.json({ orders });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
