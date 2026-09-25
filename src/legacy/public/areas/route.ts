import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zoneId = searchParams.get("zoneId");

  if (!zoneId) {
    return NextResponse.json(
      { error: "zoneId is required" },
      { status: 400 }
    );
  }

  try {
    const areas = await prisma.area.findMany({
      where: { zoneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, trCode: true },
    });
    return NextResponse.json(areas);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}