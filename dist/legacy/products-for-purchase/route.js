"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../lib/prisma");
async function GET() {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { status: true },
            include: {
                stock: true,
                generic: true,
                brand: true,
            },
            orderBy: { name: "asc" },
        });
        const mapped = products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            mrp: p.mrp,
            costPrice: p.costPrice,
            profitMargin: p.profitMargin,
            sellPrice: p.sellPrice,
            stock: p.stock?.quantity || 0,
            image: p.image,
            nextPurchasePrice: p.nextPurchasePrice,
        }));
        return server_1.NextResponse.json(mapped);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
