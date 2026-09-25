"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session?.user?.id) {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Find the first (e.g., most recent) order that is DELIVERED and hasn't shown the review modal
    const order = await prisma_1.prisma.order.findFirst({
        where: {
            userId: session.user.id,
            status: "DELIVERED",
            reviewShown: false,
        },
        orderBy: { deliveryDate: "desc" },
        select: {
            id: true,
            invoiceNo: true,
            deliveryCode: { select: { code: true } },
        },
    });
    return server_1.NextResponse.json(order ?? null);
}
