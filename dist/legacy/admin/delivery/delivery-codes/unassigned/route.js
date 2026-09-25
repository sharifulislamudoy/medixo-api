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
        // Find delivery codes that are not assigned to any user
        const codes = await prisma_1.prisma.deliveryCode.findMany({
            where: {
                users: {
                    none: {}, // no users linked
                },
            },
            include: {
                areas: {
                    include: {
                        zone: {
                            include: { city: true },
                        },
                    },
                },
            },
            orderBy: { code: "asc" },
        });
        return server_1.NextResponse.json(codes);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch delivery codes" }, { status: 500 });
    }
}
