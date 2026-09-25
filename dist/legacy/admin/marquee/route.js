"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
// GET all marquees (Admin only)
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const marquees = await prisma_1.prisma.marquee.findMany({
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(marquees);
}
// POST create marquee
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { text, isVisible } = body;
    if (!text) {
        return server_1.NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    const marquee = await prisma_1.prisma.marquee.create({
        data: {
            text,
            isVisible: isVisible ?? true,
        },
    });
    return server_1.NextResponse.json(marquee);
}
