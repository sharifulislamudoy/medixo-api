import { NextResponse } from "next/server";
import { getServerSession } from "../../../compat/session";
import { authOptions } from "../../../compat/session";
import { prisma } from "../../../lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update all PROCESSING orders that have a deliveryCode assigned to SHIPPED
    const result = await prisma.order.updateMany({
      where: {
        status: "PROCESSING",
        deliveryCodeId: { not: null },
      },
      data: {
        status: "SHIPPED",
      },
    });

    return NextResponse.json({
      message: "Orders dispatched",
      count: result.count,
    });
  } catch (error) {
    console.error("Dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch orders" },
      { status: 500 }
    );
  }
}