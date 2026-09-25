"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const prisma_1 = require("../../lib/prisma");
const server_1 = require("next/server");
async function GET() {
    const modal = await prisma_1.prisma.promotionModal.findFirst({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(modal);
}
