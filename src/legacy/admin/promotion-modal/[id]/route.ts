import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "../../../../compat/session";
import { authOptions } from "../../../../compat/session";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const { title, imageUrl, hyperlink, isVisible } = body;

  // If updating visibility to true, ensure no other modal is visible
  if (isVisible === true) {
    const alreadyVisible = await prisma.promotionModal.findFirst({
      where: {
        isVisible: true,
        NOT: { id },
      },
    });

    if (alreadyVisible) {
      return NextResponse.json(
        { error: "Another modal is already visible. Only one modal can be visible at a time." },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.promotionModal.update({
    where: { id },
    data: {
      title,
      imageUrl,
      hyperlink,
      isVisible,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.promotionModal.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Deleted" });
}