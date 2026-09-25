"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
const server_1 = require("next/server");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session?.user?.id) {
        return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orders = await prisma_1.prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { orderDate: 'desc' },
        select: {
            id: true,
            invoiceNo: true,
            orderDate: true,
            totalAmount: true,
            status: true,
        },
    });
    return server_1.NextResponse.json({ orders });
}
