"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../../../compat/session");
const session_2 = require("../../../../../compat/session");
const prisma_1 = require("../../../../../lib/prisma");
async function GET(req, { params }) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    where: { returnedQuantity: { gt: 0 } },
                    include: { product: { select: { name: true, image: true } } },
                },
            },
        });
        if (!order) {
            return server_1.NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const returnedItems = order.items.map((item) => ({
            productName: item.product.name,
            productImage: item.product.image,
            returnedQuantity: item.returnedQuantity,
            price: item.price,
            total: item.returnedQuantity * item.price,
        }));
        return server_1.NextResponse.json({ returnedItems });
    }
    catch (error) {
        console.error("Error fetching returned items:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
