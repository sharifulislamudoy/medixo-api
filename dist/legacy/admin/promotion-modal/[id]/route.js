"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const prisma_1 = require("../../../../lib/prisma");
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
async function PUT(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const body = await req.json();
    const { title, imageUrl, hyperlink, isVisible } = body;
    // If updating visibility to true, ensure no other modal is visible
    if (isVisible === true) {
        const alreadyVisible = await prisma_1.prisma.promotionModal.findFirst({
            where: {
                isVisible: true,
                NOT: { id },
            },
        });
        if (alreadyVisible) {
            return server_1.NextResponse.json({ error: "Another modal is already visible. Only one modal can be visible at a time." }, { status: 400 });
        }
    }
    const updated = await prisma_1.prisma.promotionModal.update({
        where: { id },
        data: {
            title,
            imageUrl,
            hyperlink,
            isVisible,
        },
    });
    return server_1.NextResponse.json(updated);
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.promotionModal.delete({
        where: { id },
    });
    return server_1.NextResponse.json({ message: "Deleted" });
}
