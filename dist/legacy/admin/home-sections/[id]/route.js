"use strict";
// app/api/admin/home-sections/[id]/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
// ✅ GET – fetch a single section with its products
async function GET(req, { params } // params is now a Promise
) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params; // ✅ await params
    const section = await prisma_1.prisma.homeSection.findUnique({
        where: { id },
        include: {
            products: {
                select: {
                    id: true,
                    productId: true,
                    sortOrder: true,
                },
                orderBy: { sortOrder: "asc" },
            },
        },
    });
    if (!section) {
        return server_1.NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    return server_1.NextResponse.json(section);
}
// PUT – update section details
async function PUT(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params; // ✅ await params
    const body = await req.json();
    const { title, description, isVisible, shuffleIntervalMinutes } = body;
    const updated = await prisma_1.prisma.homeSection.update({
        where: { id },
        data: {
            title: title ?? undefined,
            description: description ?? undefined,
            isVisible: isVisible ?? undefined,
            shuffleIntervalMinutes: shuffleIntervalMinutes ?? undefined,
        },
    });
    return server_1.NextResponse.json(updated);
}
// DELETE – remove a section
async function DELETE(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params; // ✅ await params
    await prisma_1.prisma.homeSection.delete({ where: { id } });
    return new server_1.NextResponse(null, { status: 204 });
}
