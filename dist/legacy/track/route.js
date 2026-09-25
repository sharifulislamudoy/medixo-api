"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../compat/session");
const session_2 = require("../../compat/session");
const prisma_1 = require("../../lib/prisma");
async function POST(req) {
    try {
        const session = await (0, session_1.getServerSession)(session_2.authOptions);
        if (!session?.user?.id) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // ✅ Safe JSON parse – handle empty body gracefully
        let page;
        try {
            const body = await req.json();
            page = body?.page;
        }
        catch {
            // Body is empty or invalid JSON – try reading from text
            const raw = await req.text();
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    page = parsed?.page;
                }
                catch {
                    // ignore
                }
            }
        }
        if (!page || typeof page !== "string") {
            // Don't fail silently; just use a default
            page = "/";
        }
        await prisma_1.prisma.pageView.create({
            data: {
                userId: session.user.id,
                page,
            },
        });
        return server_1.NextResponse.json({ ok: true });
    }
    catch (error) {
        console.error("Track error:", error);
        return server_1.NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
