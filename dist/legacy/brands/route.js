"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// app/api/brands/route.ts
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function GET() {
    const brands = await prisma_1.prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
    });
    return server_1.NextResponse.json(brands.map(b => b.name));
}
