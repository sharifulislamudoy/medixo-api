"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = require("../../../../../lib/prisma");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
async function PUT(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const { name, code } = await req.json();
    if (!name || !code) {
        return server_1.NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }
    // Check uniqueness (excluding current city)
    const existing = await prisma_1.prisma.city.findFirst({
        where: { code, NOT: { id } },
    });
    if (existing) {
        return server_1.NextResponse.json({ error: "City code must be unique" }, { status: 400 });
    }
    const updated = await prisma_1.prisma.city.update({
        where: { id },
        data: { name, code },
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.city.delete({ where: { id } });
    return server_1.NextResponse.json({ message: "Deleted" });
}
