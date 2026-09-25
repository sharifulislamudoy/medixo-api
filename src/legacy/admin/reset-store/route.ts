import { NextResponse } from "next/server";
import { getServerSession } from "../../../compat/session";
import { authOptions } from "../../../compat/session";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { confirmText } = await req.json();
  if (confirmText !== "Reset My Store") {
    return NextResponse.json({ error: "Invalid confirmation text" }, { status: 400 });
  }

  try {
    // Delete all stock records
    await prisma.stock.deleteMany({});
    return NextResponse.json({ message: "Store reset successfully" });
  } catch (error) {
    console.error("Reset store error:", error);
    return NextResponse.json({ error: "Failed to reset store" }, { status: 500 });
  }
}