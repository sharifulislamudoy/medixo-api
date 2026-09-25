"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
// GET all cities
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cities = await prisma_1.prisma.city.findMany({
        orderBy: { createdAt: "desc" },
        include: { zones: true }, // optional, you may want to include zones
    });
    return server_1.NextResponse.json(cities);
}
// CREATE a city
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, code } = await req.json();
    if (!name || !code) {
        return server_1.NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }
    // Check if code already exists
    const existing = await prisma_1.prisma.city.findUnique({ where: { code } });
    if (existing) {
        return server_1.NextResponse.json({ error: "City code must be unique" }, { status: 400 });
    }
    const city = await prisma_1.prisma.city.create({
        data: { name, code },
    });
    return server_1.NextResponse.json(city);
}
