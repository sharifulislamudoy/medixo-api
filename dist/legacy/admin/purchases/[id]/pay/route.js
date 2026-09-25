"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
const prisma_1 = require("../../../../../lib/prisma");
async function POST(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { amount } = body; // amount to add to paid
    if (!amount || isNaN(amount) || amount <= 0) {
        return server_1.NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    try {
        const purchase = await prisma_1.prisma.purchase.findUnique({ where: { id } });
        if (!purchase)
            return server_1.NextResponse.json({ error: "Not found" }, { status: 404 });
        const newPaid = purchase.paidAmount + parseFloat(amount);
        if (newPaid > purchase.totalAmount) {
            return server_1.NextResponse.json({ error: "Paid amount exceeds total" }, { status: 400 });
        }
        const status = newPaid >= purchase.totalAmount ? "PAID" : "PARTIAL_PAID";
        const updated = await prisma_1.prisma.purchase.update({
            where: { id },
            data: {
                paidAmount: newPaid,
                paymentStatus: status,
            },
        });
        return server_1.NextResponse.json(updated);
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }
}
