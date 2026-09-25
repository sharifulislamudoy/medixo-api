"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get("zoneId");
    if (!zoneId) {
        return server_1.NextResponse.json({ error: "zoneId is required" }, { status: 400 });
    }
    try {
        const areas = await prisma_1.prisma.area.findMany({
            where: { zoneId },
            orderBy: { name: "asc" },
            select: { id: true, name: true, code: true, trCode: true },
        });
        return server_1.NextResponse.json(areas);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
    }
}
