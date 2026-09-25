// app/api/generics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const generics = await prisma.generic.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return NextResponse.json(generics.map(g => g.name));
}