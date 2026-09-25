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
    const { areaIds } = await req.json();
    if (!areaIds || !Array.isArray(areaIds)) {
        return server_1.NextResponse.json({ error: "areaIds array is required" }, { status: 400 });
    }
    try {
        // Check if the delivery code exists
        const existing = await prisma_1.prisma.deliveryCode.findUnique({
            where: { id },
            include: { areas: true },
        });
        if (!existing) {
            return server_1.NextResponse.json({ error: "Delivery code not found" }, { status: 404 });
        }
        // Find areas that are already assigned to other delivery codes (excluding current)
        const conflictingAreas = await prisma_1.prisma.area.findMany({
            where: {
                id: { in: areaIds },
                AND: [
                    { deliveryCodeId: { not: null } },
                    { deliveryCodeId: { not: id } }
                ]
            },
            include: { deliveryCode: true },
        });
        if (conflictingAreas.length > 0) {
            const conflicting = conflictingAreas
                .map((a) => `${a.name} (already in ${a.deliveryCode?.code})`)
                .join(", ");
            return server_1.NextResponse.json({ error: `Some areas are already assigned: ${conflicting}` }, { status: 400 });
        }
        // Update: disconnect all, then connect selected
        const updated = await prisma_1.prisma.deliveryCode.update({
            where: { id },
            data: {
                areas: {
                    set: areaIds.map((id) => ({ id })),
                },
            },
            include: { areas: true },
        });
        return server_1.NextResponse.json(updated);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to update delivery code" }, { status: 500 });
    }
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    try {
        // First disconnect all areas (optional, but safer)
        await prisma_1.prisma.deliveryCode.update({
            where: { id },
            data: { areas: { set: [] } },
        });
        // Then delete the delivery code
        await prisma_1.prisma.deliveryCode.delete({ where: { id } });
        return server_1.NextResponse.json({ message: "Deleted" });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to delete delivery code" }, { status: 500 });
    }
}
