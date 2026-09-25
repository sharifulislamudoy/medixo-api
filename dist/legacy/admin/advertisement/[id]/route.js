"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
// /app/api/admin/advertisement/[id]/route.ts
const prisma_1 = require("../../../../lib/prisma");
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
function createSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
async function PUT(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const body = await req.json();
    const { title, imageUrl, category, hyperlink, isVisible, detailImage, description } = body;
    // Fetch the existing advertisement to compare
    const current = await prisma_1.prisma.advertisement.findUnique({ where: { id } });
    if (!current)
        return server_1.NextResponse.json({ error: "Not found" }, { status: 404 });
    // Build the update payload dynamically – only set fields that are present in the body
    const data = {};
    if (title !== undefined) {
        data.title = title;
        // Regenerate slug only if the title has changed
        if (current.title !== title) {
            let slug = createSlug(title);
            // Avoid duplicate slug
            const duplicate = await prisma_1.prisma.advertisement.findFirst({
                where: { slug, id: { not: id } },
            });
            if (duplicate) {
                slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
            }
            data.slug = slug;
        }
    }
    if (imageUrl !== undefined) {
        data.imageUrl = imageUrl;
    }
    if (category !== undefined) {
        data.category = category;
        // When category changes, manage optional fields accordingly
        if (category === "ANNOUNCEMENT") {
            if (detailImage !== undefined)
                data.detailImage = detailImage;
            if (description !== undefined)
                data.description = description;
            // If category becomes ANNOUNCEMENT, clear hyperlink
            if (current.category !== "ANNOUNCEMENT") {
                data.hyperlink = null;
            }
        }
        else {
            // If category becomes PRODUCT (or other), clear announcement-specific fields
            data.detailImage = null;
            data.description = null;
            if (hyperlink !== undefined)
                data.hyperlink = hyperlink;
        }
    }
    else {
        // Even if category not changed, allow updating optional fields
        if (detailImage !== undefined)
            data.detailImage = detailImage;
        if (description !== undefined)
            data.description = description;
        if (hyperlink !== undefined)
            data.hyperlink = hyperlink;
    }
    if (isVisible !== undefined) {
        data.isVisible = isVisible;
    }
    const updated = await prisma_1.prisma.advertisement.update({
        where: { id },
        data,
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.advertisement.delete({ where: { id } });
    return server_1.NextResponse.json({ message: "Deleted" });
}
