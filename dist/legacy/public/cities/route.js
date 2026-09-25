"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    try {
        const cities = await prisma_1.prisma.city.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, code: true },
        });
        return server_1.NextResponse.json(cities);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
    }
}
