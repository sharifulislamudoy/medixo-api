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
    const { name, code, cityId } = await req.json();
    if (!name || !code || !cityId) {
        return server_1.NextResponse.json({ error: "Name, code, and cityId are required" }, { status: 400 });
    }
    // Check uniqueness (excluding current zone)
    const existing = await prisma_1.prisma.zone.findFirst({
        where: { cityId, code, NOT: { id } },
    });
    if (existing) {
        return server_1.NextResponse.json({ error: "Zone code must be unique within the same city" }, { status: 400 });
    }
    const updated = await prisma_1.prisma.zone.update({
        where: { id },
        data: { name, code, cityId },
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.zone.delete({ where: { id } });
    return server_1.NextResponse.json({ message: "Deleted" });
}
