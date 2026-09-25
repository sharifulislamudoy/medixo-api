"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
const prisma_1 = require("../../../../../lib/prisma");
async function GET(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { phone } = await params;
        // Get all orders for this phone number
        const orders = await prisma_1.prisma.order.findMany({
            where: { customerPhone: phone },
            orderBy: { orderDate: 'desc' },
            select: {
                id: true,
                invoiceNo: true,
                orderDate: true,
                totalAmount: true,
                paymentStatus: true,
                status: true,
            },
        });
        // Also get the latest customer info from the most recent order (or first)
        const customerInfo = await prisma_1.prisma.order.findFirst({
            where: { customerPhone: phone },
            select: {
                customerName: true,
                customerShopName: true,
                customerAddress: true,
                customerPhone: true,
            },
            orderBy: { orderDate: 'desc' },
        });
        return server_1.NextResponse.json({
            customer: customerInfo,
            orders,
        });
    }
    catch (error) {
        console.error('Error fetching customer orders:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
