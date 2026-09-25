// app/api/brands/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return NextResponse.json(brands.map(b => b.name));
}