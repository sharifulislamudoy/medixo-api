"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    const marquees = await prisma_1.prisma.marquee.findMany({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(marquees);
}
