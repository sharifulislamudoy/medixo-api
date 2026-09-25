"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = PATCH;
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
const prisma_1 = require("../../../../lib/prisma");
async function PATCH(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session?.user?.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { orderId } = await params; // ✅ await here
    // Security: ensure the order belongs to the user
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
    });
    if (!order || order.userId !== session.user.id) {
        return server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Mark review as shown without rating/comment
    await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { reviewShown: true },
    });
    return server_1.NextResponse.json({ success: true });
}
