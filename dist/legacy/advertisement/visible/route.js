"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// /app/api/advertisement/visible/route.ts
const prisma_1 = require("../../../lib/prisma");
const server_1 = require("next/server");
async function GET() {
    const ads = await prisma_1.prisma.advertisement.findMany({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            category: true,
            hyperlink: true,
        },
    });
    return server_1.NextResponse.json(ads);
}
