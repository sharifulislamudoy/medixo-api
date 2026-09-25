"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// app/api/generics/route.ts
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function GET() {
    const generics = await prisma_1.prisma.generic.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
    });
    return server_1.NextResponse.json(generics.map(g => g.name));
}
