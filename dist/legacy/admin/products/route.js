"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const sku_1 = require("../../../lib/sku");
const slugify_1 = require("../../../lib/slugify");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const products = await prisma_1.prisma.product.findMany({
        include: {
            generic: true,
            brand: true,
            stock: true,
        },
        orderBy: { createdAt: "desc" },
    });
    const mapped = products.map(p => ({
        ...p,
        stock: p.stock?.quantity ?? 0,
        costMargin: p.costMargin, // 👈 ensure it's exposed
    }));
    return server_1.NextResponse.json(mapped);
}
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, category, mrp, genericName, brandName, image, description, costPrice, profitMargin, costMargin, // 👈 NEW
    stock, } = await req.json();
    if (!name || !category || !mrp || !image || !description || !costPrice || profitMargin === undefined || stock === undefined) {
        return server_1.NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const cost = parseFloat(costPrice);
    const margin = parseFloat(profitMargin);
    const sellPrice = cost * (1 + margin / 100);
    const sku = await (0, sku_1.generateNextSKU)();
    const baseSlug = (0, slugify_1.slugify)(name);
    const slug = await (0, slugify_1.generateUniqueSlug)(baseSlug, prisma_1.prisma);
    let genericId = null;
    if (genericName) {
        const generic = await prisma_1.prisma.generic.upsert({
            where: { name: genericName },
            update: {},
            create: { name: genericName },
        });
        genericId = generic.id;
    }
    let brandId = null;
    if (brandName) {
        const brand = await prisma_1.prisma.brand.upsert({
            where: { name: brandName },
            update: {},
            create: { name: brandName },
        });
        brandId = brand.id;
    }
    const product = await prisma_1.prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
            data: {
                name,
                slug,
                category,
                sku,
                mrp: parseFloat(mrp),
                genericId,
                brandId,
                image,
                description,
                costPrice: cost,
                profitMargin: margin,
                costMargin: costMargin ? parseFloat(costMargin) : null, // 👈 store
                sellPrice,
            },
            include: { generic: true, brand: true },
        });
        await tx.stock.create({
            data: {
                productId: newProduct.id,
                quantity: parseInt(stock, 10),
            },
        });
        return newProduct;
    });
    return server_1.NextResponse.json({ ...product, stock: parseInt(stock, 10) });
}
