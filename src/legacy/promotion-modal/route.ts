import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const modal = await prisma.promotionModal.findFirst({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(modal);
}