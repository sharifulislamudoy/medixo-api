"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const deliveryCodes = await prisma_1.prisma.deliveryCode.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                areas: {
                    include: {
                        zone: {
                            include: { city: true },
                        },
                    },
                },
                users: {
                    select: { id: true, name: true },
                },
            },
        });
        return server_1.NextResponse.json(deliveryCodes);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch delivery codes" }, { status: 500 });
    }
}
// POST create a new delivery code
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { areaIds } = await req.json();
    if (!areaIds || !Array.isArray(areaIds) || areaIds.length === 0) {
        return server_1.NextResponse.json({ error: "At least one area must be selected" }, { status: 400 });
    }
    try {
        // Check if any of the areas are already assigned to another delivery code
        const conflictingAreas = await prisma_1.prisma.area.findMany({
            where: {
                id: { in: areaIds },
                deliveryCodeId: { not: null },
            },
            include: { deliveryCode: true },
        });
        if (conflictingAreas.length > 0) {
            const conflicting = conflictingAreas
                .map((a) => `${a.name} (already in ${a.deliveryCode?.code})`)
                .join(", ");
            return server_1.NextResponse.json({ error: `Some areas are already assigned: ${conflicting}` }, { status: 400 });
        }
        // Generate next delivery code
        const lastCode = await prisma_1.prisma.deliveryCode.findFirst({
            orderBy: { code: "desc" },
            select: { code: true },
        });
        let nextNumber = 1;
        if (lastCode) {
            const lastNumber = parseInt(lastCode.code.replace("DC-", ""));
            nextNumber = lastNumber + 1;
        }
        const newCode = `DC-${String(nextNumber).padStart(4, "0")}`;
        // Create delivery code and assign areas
        const deliveryCode = await prisma_1.prisma.deliveryCode.create({
            data: {
                code: newCode,
                areas: {
                    connect: areaIds.map((id) => ({ id })),
                },
            },
            include: { areas: true },
        });
        return server_1.NextResponse.json(deliveryCode);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to create delivery code" }, { status: 500 });
    }
}
