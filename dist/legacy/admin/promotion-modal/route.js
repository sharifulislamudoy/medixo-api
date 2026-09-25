"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
// GET all promotion modals (Admin only)
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const modals = await prisma_1.prisma.promotionModal.findMany({
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(modals);
}
// CREATE promotion modal
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, imageUrl, hyperlink } = await req.json();
    if (!title || !imageUrl) {
        return server_1.NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }
    const modal = await prisma_1.prisma.promotionModal.create({
        data: {
            title,
            imageUrl,
            hyperlink,
            isVisible: false, // always false by default
        },
    });
    return server_1.NextResponse.json(modal);
}
