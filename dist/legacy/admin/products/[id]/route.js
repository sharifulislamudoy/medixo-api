"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const prisma_1 = require("../../../../lib/prisma");
const server_1 = require("next/server");
const session_1 = require("../../../../compat/session");
const session_2 = require("../../../../compat/session");
const slugify_1 = require("../../../../lib/slugify");
async function PUT(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const body = await req.json();
    const { name, category, mrp, genericName, brandName, image, description, costPrice, profitMargin, costMargin, // 👈 NEW
    status, availability, stock, } = body;
    let genericId = undefined;
    if (genericName !== undefined) {
        if (genericName) {
            const generic = await prisma_1.prisma.generic.upsert({
                where: { name: genericName },
                update: {},
                create: { name: genericName },
            });
            genericId = generic.id;
        }
        else {
            genericId = null;
        }
    }
    let brandId = undefined;
    if (brandName !== undefined) {
        if (brandName) {
            const brand = await prisma_1.prisma.brand.upsert({
                where: { name: brandName },
                update: {},
                create: { name: brandName },
            });
            brandId = brand.id;
        }
        else {
            brandId = null;
        }
    }
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        const currentProduct = await tx.product.findUnique({ where: { id } });
        if (!currentProduct)
            throw new Error("Product not found");
        let slug = currentProduct.slug;
        if (name && name !== currentProduct.name) {
            const baseSlug = (0, slugify_1.slugify)(name);
            slug = await (0, slugify_1.generateUniqueSlug)(baseSlug, tx, id);
        }
        const finalCost = costPrice !== undefined ? parseFloat(costPrice) : currentProduct.costPrice;
        const finalMargin = profitMargin !== undefined ? parseFloat(profitMargin) : currentProduct.profitMargin;
        const computedSellPrice = finalCost * (1 + finalMargin / 100);
        const product = await tx.product.update({
            where: { id },
            data: {
                name,
                slug,
                category,
                mrp: mrp ? parseFloat(mrp) : undefined,
                genericId,
                brandId,
                image,
                description,
                costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
                profitMargin: profitMargin !== undefined ? parseFloat(profitMargin) : undefined,
                costMargin: costMargin !== undefined ? parseFloat(costMargin) : undefined, // 👈 update
                sellPrice: computedSellPrice,
                status: status !== undefined ? status : undefined,
                availability: availability !== undefined ? availability : undefined,
            },
            include: { generic: true, brand: true },
        });
        if (stock !== undefined) {
            await tx.stock.upsert({
                where: { productId: id },
                update: { quantity: parseInt(stock, 10) },
                create: { productId: id, quantity: parseInt(stock, 10) },
            });
        }
        return product;
    });
    const stockRecord = await prisma_1.prisma.stock.findUnique({ where: { productId: id } });
    return server_1.NextResponse.json({ ...updated, stock: stockRecord?.quantity ?? 0 });
}
async function DELETE(req, context) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma_1.prisma.product.delete({ where: { id } });
    return server_1.NextResponse.json({ message: "Deleted" });
}
