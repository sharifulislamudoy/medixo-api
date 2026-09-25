"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../../../lib/prisma");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const areas = await prisma_1.prisma.area.findMany({
            where: { deliveryCodeId: null },
            orderBy: { name: "asc" },
            include: {
                zone: {
                    include: { city: true },
                },
            },
        });
        return server_1.NextResponse.json(areas);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch unassigned areas" }, { status: 500 });
    }
}
