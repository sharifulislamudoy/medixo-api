import { NextResponse } from "next/server";
import { getServerSession } from "../../../compat/session";
import { authOptions } from "../../../compat/session";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DELIVERY_BOY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryBoy = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deliveryCodeId: true },
    });

    if (!deliveryBoy?.deliveryCodeId) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        deliveryCodeId: deliveryBoy.deliveryCodeId,
        status: "SHIPPED",
      },
      orderBy: { orderDate: "desc" },
      select: {
        id: true,
        invoiceNo: true,
        orderDate: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        totalAmount: true,
        status: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}