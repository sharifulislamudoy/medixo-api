"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function GET(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "DELIVERY_BOY") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    let month = searchParams.get("month");
    if (!month) {
        const now = new Date();
        month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    const boy = await prisma_1.prisma.user.findUnique({
        where: { id: session.user.id },
        include: { deliveryCode: true },
    });
    if (!boy || !boy.deliveryCodeId) {
        return server_1.NextResponse.json({
            month,
            name: boy?.name,
            vehicle: boy?.vehicle,
            deliveryCode: null,
            totalDeliveredValue: 0,
            deliveryCount: 0,
            perDeliveryBonus: 0,
            baseSalary: 6000,
            thresholdBonus: 0,
            totalEarnings: 6000,
        });
    }
    const orders = await prisma_1.prisma.order.findMany({
        where: {
            deliveryCodeId: boy.deliveryCodeId,
            status: "DELIVERED",
            orderDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            items: {
                where: { returnedQuantity: { gt: 0 } },
                select: { returnedQuantity: true, price: true },
            },
        },
    });
    let totalDeliveredValue = 0;
    const deliveryCount = orders.length;
    for (const order of orders) {
        const returnedValue = order.items.reduce((sum, item) => sum + item.returnedQuantity * item.price, 0);
        totalDeliveredValue += order.totalAmount - returnedValue;
    }
    // 🔁 Fixed: case‑insensitive vehicle check
    let perDeliveryRate = 0;
    const vehicle = boy.vehicle?.toLowerCase();
    if (vehicle === "bike")
        perDeliveryRate = 10;
    else if (vehicle === "cycle")
        perDeliveryRate = 5;
    const perDeliveryBonus = deliveryCount * perDeliveryRate;
    const thresholdBonus = totalDeliveredValue >= 1_200_000 ? 1000 : 0;
    const totalEarnings = 6000 + perDeliveryBonus + thresholdBonus;
    return server_1.NextResponse.json({
        month,
        name: boy.name,
        vehicle: boy.vehicle,
        deliveryCode: boy.deliveryCode?.code || "—",
        totalDeliveredValue,
        deliveryCount,
        perDeliveryBonus,
        baseSalary: 6000,
        thresholdBonus,
        totalEarnings,
    });
}
