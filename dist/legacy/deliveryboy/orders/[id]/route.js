"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = PATCH;
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
const prisma_1 = require("../../../../lib/prisma");
async function PATCH(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== "DELIVERY_BOY") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const { paymentStatus } = await req.json(); // "DUE" or "PAID"
        if (!["DUE", "PAID"].includes(paymentStatus)) {
            return server_1.NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
        }
        // Get delivery boy's assigned delivery code
        const deliveryBoy = await prisma_1.prisma.user.findUnique({
            where: { id: session.user.id },
            select: { deliveryCodeId: true },
        });
        if (!deliveryBoy?.deliveryCodeId) {
            return server_1.NextResponse.json({ error: "You are not assigned to any delivery code" }, { status: 403 });
        }
        // Fetch the order to ensure it belongs to this delivery boy and is SHIPPED
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            select: { deliveryCodeId: true, status: true },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.deliveryCodeId !== deliveryBoy.deliveryCodeId) {
            return server_1.NextResponse.json({ error: "This order is not assigned to you" }, { status: 403 });
        }
        if (order.status !== "SHIPPED") {
            return server_1.NextResponse.json({ error: "Only SHIPPED orders can be marked as delivered" }, { status: 400 });
        }
        // Update status to DELIVERED and set payment status
        await prisma_1.prisma.order.update({
            where: { id },
            data: {
                status: "DELIVERED",
                paymentStatus,
            },
        });
        return server_1.NextResponse.json({ message: "Order marked as delivered" });
    }
    catch (error) {
        console.error("Error marking order delivered:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
