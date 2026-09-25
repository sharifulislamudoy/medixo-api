"use strict";
// app/api/admin/home-sections/[id]/products/route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = require("../../../../../lib/prisma");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
// POST – add products to section
async function POST(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: sectionId } = await params; // ✅ await params
    const body = await req.json();
    const { productIds } = body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return server_1.NextResponse.json({ error: "productIds array required" }, { status: 400 });
    }
    const lastProduct = await prisma_1.prisma.homeSectionProduct.findFirst({
        where: { sectionId },
        orderBy: { sortOrder: "desc" },
    });
    let nextOrder = lastProduct ? lastProduct.sortOrder + 1 : 0;
    await prisma_1.prisma.homeSectionProduct.createMany({
        data: productIds.map((pid, index) => ({
            sectionId,
            productId: pid,
            sortOrder: nextOrder + index,
        })),
    });
    await prisma_1.prisma.homeSection.update({
        where: { id: sectionId },
        data: { lastShuffledAt: null },
    });
    return server_1.NextResponse.json({ success: true }, { status: 201 });
}
// DELETE – remove a product from section
async function DELETE(req, { params }) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: sectionId } = await params; // ✅ await params
    const body = await req.json();
    const { productId } = body;
    if (!productId) {
        return server_1.NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    await prisma_1.prisma.homeSectionProduct.deleteMany({
        where: { sectionId, productId },
    });
    const remaining = await prisma_1.prisma.homeSectionProduct.findMany({
        where: { sectionId },
        orderBy: { sortOrder: "asc" },
    });
    await prisma_1.prisma.$transaction(remaining.map((item, idx) => prisma_1.prisma.homeSectionProduct.update({
        where: { id: item.id },
        data: { sortOrder: idx },
    })));
    await prisma_1.prisma.homeSection.update({
        where: { id: sectionId },
        data: { lastShuffledAt: null },
    });
    return new server_1.NextResponse(null, { status: 204 });
}
