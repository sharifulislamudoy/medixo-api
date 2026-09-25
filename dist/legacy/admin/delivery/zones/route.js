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
    const zones = await prisma_1.prisma.zone.findMany({
        orderBy: { createdAt: "desc" },
        include: { city: true, areas: true },
    });
    return server_1.NextResponse.json(zones);
}
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, code, cityId } = await req.json();
    if (!name || !code || !cityId) {
        return server_1.NextResponse.json({ error: "Name, code, and cityId are required" }, { status: 400 });
    }
    // Check uniqueness of code within the same city
    const existing = await prisma_1.prisma.zone.findFirst({
        where: { cityId, code },
    });
    if (existing) {
        return server_1.NextResponse.json({ error: "Zone code must be unique within the same city" }, { status: 400 });
    }
    const zone = await prisma_1.prisma.zone.create({
        data: { name, code, cityId },
    });
    return server_1.NextResponse.json(zone);
}
