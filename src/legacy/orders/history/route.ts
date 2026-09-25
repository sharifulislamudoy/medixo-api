import { getServerSession } from "../../../compat/session";
import { authOptions } from "../../../compat/session";
import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { orderDate: 'desc' },
    select: {
      id: true,
      invoiceNo: true,
      orderDate: true,
      totalAmount: true,
      status: true,
    },
  });

  return NextResponse.json({ orders });
}