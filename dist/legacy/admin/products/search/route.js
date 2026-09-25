"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../../lib/prisma");
async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('search');
    if (!query) {
        return server_1.NextResponse.json({ products: [] });
    }
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                ],
                status: true,
                availability: true,
            },
            take: 10,
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                sku: true,
                sellPrice: true,
            },
        });
        return server_1.NextResponse.json({ products });
    }
    catch (error) {
        console.error('Product search error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
