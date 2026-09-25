"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    if (!cityId) {
        return server_1.NextResponse.json({ error: "cityId is required" }, { status: 400 });
    }
    try {
        const zones = await prisma_1.prisma.zone.findMany({
            where: { cityId },
            orderBy: { name: "asc" },
            select: { id: true, name: true, code: true },
        });
        return server_1.NextResponse.json(zones);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
    }
}
