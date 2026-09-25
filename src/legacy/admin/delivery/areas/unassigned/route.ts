import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../compat/session";
import { authOptions } from "../../../../../compat/session";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const areas = await prisma.area.findMany({
      where: { deliveryCodeId: null },
      orderBy: { name: "asc" },
      include: {
        zone: {
          include: { city: true },
        },
      },
    });
    return NextResponse.json(areas);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch unassigned areas" },
      { status: 500 }
    );
  }
}