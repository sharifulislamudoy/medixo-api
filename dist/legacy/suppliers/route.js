"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function GET() {
    try {
        const suppliers = await prisma_1.prisma.user.findMany({
            where: { role: "SUPPLIER", status: "APPROVED" },
            select: { id: true, name: true, shopName: true, phone: true, email: true },
            orderBy: { name: "asc" },
        });
        return server_1.NextResponse.json(suppliers);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
    }
}
