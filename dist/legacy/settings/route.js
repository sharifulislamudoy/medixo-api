"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
// app/api/settings/route.ts
const server_1 = require("next/server");
const session_1 = require("../../compat/session");
const session_2 = require("../../compat/session");
const prisma_1 = require("../../lib/prisma");
async function GET() {
    const settings = await prisma_1.prisma.siteSettings.findFirst();
    return server_1.NextResponse.json(settings || {
        dailyCutoffHour: 11,
        dailyCutoffMinute: 0,
        minFirstOrderAmount: 0,
        orderOffStart: null,
        orderOffEnd: null,
    });
}
async function PUT(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { dailyCutoffHour, dailyCutoffMinute, minFirstOrderAmount, orderOffStart, orderOffEnd } = body;
    // Upsert the single settings row
    const existing = await prisma_1.prisma.siteSettings.findFirst();
    let settings;
    if (existing) {
        settings = await prisma_1.prisma.siteSettings.update({
            where: { id: existing.id },
            data: {
                dailyCutoffHour: dailyCutoffHour ?? existing.dailyCutoffHour,
                dailyCutoffMinute: dailyCutoffMinute ?? existing.dailyCutoffMinute,
                minFirstOrderAmount: minFirstOrderAmount ?? existing.minFirstOrderAmount,
                orderOffStart: orderOffStart !== undefined ? new Date(orderOffStart) : existing.orderOffStart,
                orderOffEnd: orderOffEnd !== undefined ? new Date(orderOffEnd) : existing.orderOffEnd,
            },
        });
    }
    else {
        settings = await prisma_1.prisma.siteSettings.create({
            data: {
                dailyCutoffHour: dailyCutoffHour ?? 11,
                dailyCutoffMinute: dailyCutoffMinute ?? 0,
                minFirstOrderAmount: minFirstOrderAmount ?? 0,
                orderOffStart: orderOffStart ? new Date(orderOffStart) : null,
                orderOffEnd: orderOffEnd ? new Date(orderOffEnd) : null,
            },
        });
    }
    return server_1.NextResponse.json(settings);
}
