"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const session_1 = require("../../../compat/session");
const session_2 = require("../../../compat/session");
const prisma_1 = require("../../../lib/prisma");
async function POST(req) {
    const session = await (0, session_1.getServerSession)(session_2.authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { confirmText } = await req.json();
    if (confirmText !== "Reset My Store") {
        return server_1.NextResponse.json({ error: "Invalid confirmation text" }, { status: 400 });
    }
    try {
        // Delete all stock records
        await prisma_1.prisma.stock.deleteMany({});
        return server_1.NextResponse.json({ message: "Store reset successfully" });
    }
    catch (error) {
        console.error("Reset store error:", error);
        return server_1.NextResponse.json({ error: "Failed to reset store" }, { status: 500 });
    }
}
