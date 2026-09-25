import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");

  if (!cityId) {
    return NextResponse.json(
      { error: "cityId is required" },
      { status: 400 }
    );
  }

  try {
    const zones = await prisma.zone.findMany({
      where: { cityId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}