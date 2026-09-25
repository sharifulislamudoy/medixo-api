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
    // Find delivery codes that are not assigned to any user
    const codes = await prisma.deliveryCode.findMany({
      where: {
        users: {
          none: {}, // no users linked
        },
      },
      include: {
        areas: {
          include: {
            zone: {
              include: { city: true },
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(codes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch delivery codes" },
      { status: 500 }
    );
  }
}