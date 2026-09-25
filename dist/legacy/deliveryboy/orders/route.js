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
        if (!session?.user || session.user.role !== "DELIVERY_BOY") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const deliveryBoy = await prisma_1.prisma.user.findUnique({
            where: { id: session.user.id },
            select: { deliveryCodeId: true },
        });
        if (!deliveryBoy?.deliveryCodeId) {
            return server_1.NextResponse.json({ orders: [] });
        }
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                deliveryCodeId: deliveryBoy.deliveryCodeId,
                status: "SHIPPED",
            },
            orderBy: { orderDate: "desc" },
            select: {
                id: true,
                invoiceNo: true,
                orderDate: true,
                customerName: true,
                customerPhone: true,
                customerAddress: true,
                totalAmount: true,
                status: true,
            },
        });
        return server_1.NextResponse.json({ orders });
    }
    catch (error) {
        console.error("Error fetching delivery orders:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
