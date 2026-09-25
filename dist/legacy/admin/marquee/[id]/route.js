"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const prisma_1 = require("../../../../lib/prisma");
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
async function PUT(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const body = await req.json();
    const { text, isVisible } = body;
    if (!text) {
        return server_1.NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    const updated = await prisma_1.prisma.marquee.update({
        where: { id },
        data: { text, isVisible },
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.marquee.delete({
        where: { id },
    });
    return server_1.NextResponse.json({ message: "Deleted" });
}
