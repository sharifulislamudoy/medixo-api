"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function POST() {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Update all PROCESSING orders that have a deliveryCode assigned to SHIPPED
        const result = await prisma_1.prisma.order.updateMany({
            where: {
                status: "PROCESSING",
                deliveryCodeId: { not: null },
            },
            data: {
                status: "SHIPPED",
            },
        });
        return server_1.NextResponse.json({
            message: "Orders dispatched",
            count: result.count,
        });
    }
    catch (error) {
        console.error("Dispatch error:", error);
        return server_1.NextResponse.json({ error: "Failed to dispatch orders" }, { status: 500 });
    }
}
