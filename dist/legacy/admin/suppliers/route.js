"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("../../../lib/prisma");
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    try {
        const suppliers = await prisma_1.prisma.user.findMany({
            where: {
                role: 'SUPPLIER',
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { shopName: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                shopName: true,
            },
            orderBy: { name: 'asc' },
            take: 20,
        });
        return server_1.NextResponse.json({ suppliers });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}
