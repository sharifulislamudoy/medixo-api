"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET() {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user || session.user.role !== "DELIVERY_BOY") {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Get delivery boy's assigned delivery code
        const deliveryBoy = await prisma_1.prisma.user.findUnique({
            where: { id: session.user.id },
            select: { deliveryCodeId: true },
        });
        if (!deliveryBoy?.deliveryCodeId) {
            return server_1.NextResponse.json([]); // No history
        }
        // Fetch all orders that belong to this delivery boy and are in a final state
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                deliveryCodeId: deliveryBoy.deliveryCodeId,
                status: { in: ["DELIVERED", "RETURNED"] },
            },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, image: true } },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
        // Group by date (using updatedAt)
        const historyMap = new Map();
        for (const order of orders) {
            const dateStr = order.updatedAt.toISOString().split("T")[0]; // YYYY-MM-DD
            const entry = historyMap.get(dateStr) || {
                date: dateStr,
                deliveredCount: 0,
                deliveredAmount: 0,
                returnedAmount: 0,
            };
            // Count delivered orders
            if (order.status === "DELIVERED") {
                entry.deliveredCount += 1;
                entry.deliveredAmount += order.totalAmount;
            }
            // Add returned amount from items (for both DELIVERED and RETURNED orders)
            const orderReturned = order.items.reduce((sum, item) => sum + item.returnedQuantity * item.price, 0);
            entry.returnedAmount += orderReturned;
            historyMap.set(dateStr, entry);
        }
        // Convert map to array and sort by date descending
        const history = Array.from(historyMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
        return server_1.NextResponse.json(history);
    }
    catch (error) {
        console.error("Error fetching delivery history:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
