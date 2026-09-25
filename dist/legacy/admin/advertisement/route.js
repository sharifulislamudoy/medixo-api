"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// /app/api/admin/advertisement/route.ts
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
function createSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ads = await prisma_1.prisma.advertisement.findMany({
        orderBy: { createdAt: "desc" },
    });
    return server_1.NextResponse.json(ads);
}
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, imageUrl, category, hyperlink, isVisible, detailImage, description } = body;
    if (!title || !imageUrl || !category) {
        return server_1.NextResponse.json({ error: "Title, image and category are required" }, { status: 400 });
    }
    let slug = createSlug(title);
    const existing = await prisma_1.prisma.advertisement.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }
    const ad = await prisma_1.prisma.advertisement.create({
        data: {
            title,
            slug,
            imageUrl,
            detailImage: category === "ANNOUNCEMENT" ? detailImage : null,
            description: category === "ANNOUNCEMENT" ? description : null,
            category,
            hyperlink: category === "PRODUCT" ? hyperlink : null,
            isVisible: isVisible ?? true,
        },
    });
    return server_1.NextResponse.json(ad);
}
