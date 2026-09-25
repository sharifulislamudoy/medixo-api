import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "../../../compat/session";
import { authOptions } from "../../../compat/session";

// GET all promotion modals (Admin only)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const modals = await prisma.promotionModal.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(modals);
}

// CREATE promotion modal
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, imageUrl, hyperlink } = await req.json();

  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  const modal = await prisma.promotionModal.create({
    data: {
      title,
      imageUrl,
      hyperlink,
      isVisible: false, // always false by default
    },
  });

  return NextResponse.json(modal);
}