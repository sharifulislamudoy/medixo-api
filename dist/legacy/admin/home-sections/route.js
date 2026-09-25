"use strict";
// app/api/admin/home-sections/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
// GET all sections (admin)
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sections = await prisma_1.prisma.homeSection.findMany({
        include: {
            products: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { sortOrder: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(sections);
}
// POST create a new section
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, isVisible, shuffleIntervalMinutes } = body;
    if (!title) {
        return server_1.NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const section = await prisma_1.prisma.homeSection.create({
        data: {
            title,
            description: description || null,
            isVisible: isVisible ?? true,
            shuffleIntervalMinutes: shuffleIntervalMinutes ?? 60,
        },
    });
    return server_1.NextResponse.json(section, { status: 201 });
}
