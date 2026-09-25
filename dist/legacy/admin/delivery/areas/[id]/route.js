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
    const { name, code, zoneId } = await req.json();
    if (!name || !code || !zoneId) {
        return server_1.NextResponse.json({ error: "Name, code, and zoneId are required" }, { status: 400 });
    }
    // Check uniqueness of code within the same zone (excluding current)
    const existing = await prisma_1.prisma.area.findFirst({
        where: { zoneId, code, NOT: { id } },
    });
    if (existing) {
        return server_1.NextResponse.json({ error: "Area code must be unique within the same zone" }, { status: 400 });
    }
    // Fetch zone with city to regenerate trCode
    const zone = await prisma_1.prisma.zone.findUnique({
        where: { id: zoneId },
        include: { city: true },
    });
    if (!zone) {
        return server_1.NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    const trCode = `${zone.city.code}-${zone.code}-${code}`;
    // Ensure new trCode is unique (excluding current area)
    const trCodeExists = await prisma_1.prisma.area.findFirst({
        where: { trCode, NOT: { id } },
    });
    if (trCodeExists) {
        return server_1.NextResponse.json({ error: "Generated TR code already exists. Please use different codes." }, { status: 400 });
    }
    const updated = await prisma_1.prisma.area.update({
        where: { id },
        data: { name, code, zoneId, trCode },
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.area.delete({ where: { id } });
    return server_1.NextResponse.json({ message: "Deleted" });
}
