"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataController = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("./lib/prisma");
const read_actor_1 = require("./auth/read-actor");
const analyzeUser_1 = require("./lib/analyzeUser");
async function requireRole(request, role) {
    const actor = await (0, read_actor_1.readActor)(request);
    if (actor.role !== role)
        throw new common_1.UnauthorizedException(`${role} access required`);
    return actor;
}
const publicProductSelect = {
    id: true,
    name: true,
    slug: true,
    category: true,
    sku: true,
    image: true,
    mrp: true,
    sellPrice: true,
    description: true,
    availability: true,
    genericId: true,
    brandId: true,
    generic: { select: { name: true } },
    brand: { select: { name: true } },
    stock: { select: { quantity: true } },
};
const deliveryOrderInclude = {
    items: {
        include: {
            product: { select: { id: true, name: true, image: true, sellPrice: true } },
        },
    },
};
let AppDataController = class AppDataController {
    async newArrivals(request) {
        await requireRole(request, "SHOP_OWNER");
        return prisma_1.prisma.product.findMany({
            where: { status: true },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: publicProductSelect,
        });
    }
    async announcement(request, slug) {
        await requireRole(request, "SHOP_OWNER");
        return prisma_1.prisma.advertisement.findFirst({
            where: { slug, isVisible: true, category: "ANNOUNCEMENT" },
            select: {
                title: true,
                detailImage: true,
                description: true,
                category: true,
            },
        });
    }
    async product(request, slug) {
        await requireRole(request, "SHOP_OWNER");
        const product = await prisma_1.prisma.product.findFirst({
            where: { slug, status: true },
            select: publicProductSelect,
        });
        if (!product)
            return { product: null, similar: [], suggested: [] };
        const [similar, suggested] = await Promise.all([
            product.genericId
                ? prisma_1.prisma.product.findMany({
                    where: { genericId: product.genericId, slug: { not: slug }, status: true },
                    select: publicProductSelect,
                    take: 10,
                })
                : Promise.resolve([]),
            product.brandId
                ? prisma_1.prisma.product.findMany({
                    where: {
                        brandId: product.brandId,
                        slug: { not: slug },
                        status: true,
                        ...(product.genericId ? { genericId: { not: product.genericId } } : {}),
                    },
                    select: publicProductSelect,
                    take: 10,
                })
                : Promise.resolve([]),
        ]);
        const byDiscount = (items) => items.sort((a, b) => (b.mrp > b.sellPrice ? (b.mrp - b.sellPrice) / b.mrp : 0) -
            (a.mrp > a.sellPrice ? (a.mrp - a.sellPrice) / a.mrp : 0));
        return { product, similar: byDiscount(similar), suggested: byDiscount(suggested) };
    }
    async sitemapProducts(request) {
        await requireRole(request, "SHOP_OWNER");
        return prisma_1.prisma.product.findMany({
            where: { status: true },
            select: { slug: true, updatedAt: true },
        });
    }
    async dashboard(request) {
        await requireRole(request, "ADMIN");
        const [totalUsers, pendingUsers, processingOrders] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { status: "PENDING" } }),
            prisma_1.prisma.order.count({ where: { status: "PROCESSING" } }),
        ]);
        return { totalUsers, pendingUsers, processingOrders };
    }
    async users(request) {
        await requireRole(request, "ADMIN");
        return prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                shopName: true,
                role: true,
                status: true,
                vehicle: true,
                createdAt: true,
                verificationDocuments: { select: { type: true } },
                area: { select: { name: true, trCode: true } },
                deliveryCode: { select: { id: true, code: true } },
                bankAccountNumber: true,
                bankBranch: true,
                accountHolderName: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async reviews(request) {
        await requireRole(request, "ADMIN");
        return prisma_1.prisma.order.findMany({
            where: { reviewRating: { not: null } },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                invoiceNo: true,
                reviewRating: true,
                reviewComment: true,
                customerName: true,
                deliveryDate: true,
                user: { select: {
                        id: true, name: true, email: true, phone: true, shopName: true,
                    } },
            },
        });
    }
    async assignedOrders(request) {
        const actor = await requireRole(request, "DELIVERY_BOY");
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: actor.id },
            select: { deliveryCodeId: true },
        });
        if (!user?.deliveryCodeId)
            return { assigned: false, orders: [] };
        const orders = await prisma_1.prisma.order.findMany({
            where: { deliveryCodeId: user.deliveryCodeId, status: "SHIPPED" },
            orderBy: { orderDate: "desc" },
            select: {
                id: true,
                invoiceNo: true,
                orderDate: true,
                customerName: true,
                customerShopName: true,
                customerPhone: true,
                totalAmount: true,
                status: true,
            },
        });
        return { assigned: true, orders };
    }
    async assignedOrder(request, id) {
        const actor = await requireRole(request, "DELIVERY_BOY");
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: actor.id },
            select: { deliveryCodeId: true },
        });
        if (!user?.deliveryCodeId)
            return { assigned: false, order: null };
        const order = await prisma_1.prisma.order.findFirst({
            where: { id, deliveryCodeId: user.deliveryCodeId },
            include: deliveryOrderInclude,
        });
        return { assigned: true, order };
    }
    async cash(request) {
        const actor = await requireRole(request, "DELIVERY_BOY");
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: actor.id },
            select: { deliveryCodeId: true },
        });
        if (!user?.deliveryCodeId)
            return { assigned: false };
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                deliveryCodeId: user.deliveryCodeId,
                updatedAt: { gte: start, lt: end },
            },
            include: deliveryOrderInclude,
            orderBy: { updatedAt: "desc" },
        });
        let assignedTotal = 0;
        let collectedTotal = 0;
        let returnedTotal = 0;
        const returnedItemsMap = new Map();
        for (const order of orders) {
            const returnedValue = order.items.reduce((sum, item) => sum + item.returnedQuantity * item.price, 0);
            if (returnedValue > 0) {
                returnedTotal += returnedValue;
                for (const item of order.items) {
                    if (item.returnedQuantity <= 0)
                        continue;
                    const existing = returnedItemsMap.get(item.productId);
                    if (existing) {
                        existing.totalReturned += item.returnedQuantity;
                        existing.totalValue += item.returnedQuantity * item.price;
                    }
                    else {
                        returnedItemsMap.set(item.productId, {
                            productName: item.product.name,
                            productImage: item.product.image,
                            totalReturned: item.returnedQuantity,
                            totalValue: item.returnedQuantity * item.price,
                        });
                    }
                }
            }
            if (order.status === "SHIPPED")
                assignedTotal += order.totalAmount;
            if (order.status === "DELIVERED" && order.paymentStatus === "PAID") {
                collectedTotal += order.totalAmount - returnedValue;
            }
        }
        return {
            assigned: true,
            assignedTotal,
            collectedTotal,
            returnedTotal,
            returnedItems: [...returnedItemsMap.values()],
        };
    }
    async history(request) {
        const actor = await requireRole(request, "DELIVERY_BOY");
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: actor.id },
            select: { deliveryCodeId: true },
        });
        if (!user?.deliveryCodeId)
            return { assigned: false, history: [] };
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                deliveryCodeId: user.deliveryCodeId,
                status: { in: ["DELIVERED", "RETURNED"] },
            },
            include: { items: true },
            orderBy: { updatedAt: "desc" },
        });
        const byDay = new Map();
        for (const order of orders) {
            const date = order.updatedAt.toISOString().split("T")[0];
            const entry = byDay.get(date) || {
                date, deliveredCount: 0, deliveredAmount: 0, returnedAmount: 0,
            };
            if (order.status === "DELIVERED") {
                entry.deliveredCount++;
                entry.deliveredAmount += order.totalAmount;
            }
            entry.returnedAmount += order.items.reduce((sum, item) => sum + item.returnedQuantity * item.price, 0);
            byDay.set(date, entry);
        }
        return {
            assigned: true,
            history: [...byDay.values()].sort((a, b) => b.date.localeCompare(a.date)),
        };
    }
    async leaderboard(request) {
        await requireRole(request, "DELIVERY_BOY");
        const [deliveryBoys, statsByCode] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where: { role: "DELIVERY_BOY" },
                select: { name: true, deliveryCode: { select: { id: true, code: true } } },
            }),
            prisma_1.prisma.order.groupBy({
                by: ["deliveryCodeId"],
                where: { status: "DELIVERED", deliveryCodeId: { not: null } },
                _count: { id: true },
                _sum: { totalAmount: true },
            }),
        ]);
        const statsMap = new Map(statsByCode.map(stat => [stat.deliveryCodeId, {
                orderCount: stat._count.id,
                totalAmount: stat._sum.totalAmount || 0,
            }]));
        return deliveryBoys.map(boy => {
            const stats = statsMap.get(boy.deliveryCode?.id || null);
            return {
                name: boy.name,
                code: boy.deliveryCode?.code || "—",
                orderCount: stats?.orderCount || 0,
                totalAmount: stats?.totalAmount || 0,
            };
        }).sort((a, b) => b.orderCount - a.orderCount);
    }
    async userActivities(request) {
        await requireRole(request, "ADMIN");
        const users = await prisma_1.prisma.user.findMany({
            where: {
                role: "SHOP_OWNER",
                OR: [
                    { orders: { some: {} } },
                    { pageViews: { some: {} } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                orders: {
                    select: {
                        status: true,
                        totalAmount: true,
                    },
                },
                pageViews: {
                    select: {
                        page: true,
                        timestamp: true,
                    },
                    orderBy: { timestamp: "asc" },
                },
            },
        });
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        // প্রতিটি ইউজারের ডেটা প্রসেসিং (Groq ছাড়া)
        const processedUsers = users.map((user) => {
            const totalOrders = user.orders.length;
            const deliveredAmount = user.orders
                .filter((o) => o.status === "DELIVERED")
                .reduce((sum, o) => sum + o.totalAmount, 0);
            const pageViews = user.pageViews;
            const todayViews = pageViews.filter((pv) => pv.timestamp >= todayStart && pv.timestamp < todayEnd);
            // Top 5 pages for AI
            const pageCounter = new Map();
            pageViews.forEach((pv) => pageCounter.set(pv.page, (pageCounter.get(pv.page) || 0) + 1));
            const sortedPages = [...pageCounter.entries()].sort((a, b) => b[1] - a[1]);
            const topPages = sortedPages.slice(0, 5).map(([page]) => page);
            const mostVisitedPage = topPages.length > 0 ? topPages[0] : "—";
            // সেশন তৈরি (30 min gap)
            const sessions = [];
            if (pageViews.length > 0) {
                const sorted = [...pageViews].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                let currentSession = {
                    start: sorted[0].timestamp,
                    end: sorted[0].timestamp,
                    pagesCount: 1,
                };
                for (let i = 1; i < sorted.length; i++) {
                    const diff = sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime();
                    if (diff <= 30 * 60 * 1000) {
                        currentSession.end = sorted[i].timestamp;
                        currentSession.pagesCount++;
                    }
                    else {
                        sessions.push({ ...currentSession });
                        currentSession = {
                            start: sorted[i].timestamp,
                            end: sorted[i].timestamp,
                            pagesCount: 1,
                        };
                    }
                }
                sessions.push(currentSession);
            }
            // আজকের অ্যাক্টিভ সময়
            let todayActiveMs = 0;
            sessions.forEach((s) => {
                if (s.end >= todayStart && s.start < todayEnd) {
                    const overlapStart = s.start < todayStart ? todayStart : s.start;
                    const overlapEnd = s.end > todayEnd ? todayEnd : s.end;
                    todayActiveMs += overlapEnd.getTime() - overlapStart.getTime();
                }
            });
            const todayActiveMinutes = Math.round(todayActiveMs / 60000);
            const sessionsToday = sessions.filter((s) => s.start >= todayStart && s.start < todayEnd).length;
            // দৈনিক অ্যাক্টিভিটি (মোডালের জন্য)
            const dailyMap = new Map();
            pageViews.forEach((pv) => {
                const dateKey = pv.timestamp.toISOString().split("T")[0];
                if (!dailyMap.has(dateKey)) {
                    dailyMap.set(dateKey, { totalPages: 0, totalTimeMs: 0 });
                }
                dailyMap.get(dateKey).totalPages++;
            });
            sessions.forEach((s) => {
                const dateKey = s.start.toISOString().split("T")[0];
                if (dailyMap.has(dateKey)) {
                    dailyMap.get(dateKey).totalTimeMs += s.end.getTime() - s.start.getTime();
                }
            });
            const dailyActivity = Array.from(dailyMap.entries()).map(([date, data]) => ({
                date,
                pagesCount: data.totalPages,
                activeMinutes: Math.round(data.totalTimeMs / 60000),
            }));
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
                totalOrders,
                deliveredAmount,
                totalPageViews: pageViews.length,
                todayPageViews: todayViews.length,
                mostVisitedPage,
                todayActiveMinutes,
                sessionsToday,
                dailyActivity,
                sessions,
                topPages, // Groq এ পাঠানোর জন্য
            };
        });
        // 🔁 প্যারালাল Groq API কল (একসাথে সব ইউজারের জন্য)
        const suspiciousResults = await Promise.all(processedUsers.map((userData) => (0, analyzeUser_1.isRateChecker)({
            totalOrders: userData.totalOrders,
            totalPageViews: userData.totalPageViews,
            topPages: userData.topPages,
        })));
        // final data ready
        const userActivities = processedUsers.map((userData, idx) => ({
            ...userData,
            suspicious: suspiciousResults[idx], // true/false
            // topPages আর দরকার নেই, তাই সরিয়ে ফেলতে পারেন
            topPages: undefined,
        }));
        // সর্ট (আজকের পেজ ভিউ অনুসারে)
        userActivities.sort((a, b) => b.todayPageViews - a.todayPageViews);
        return userActivities;
    }
};
exports.AppDataController = AppDataController;
__decorate([
    (0, common_1.Get)("customer/new-arrivals"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "newArrivals", null);
__decorate([
    (0, common_1.Get)("customer/advertisements/:slug"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "announcement", null);
__decorate([
    (0, common_1.Get)("customer/products/:slug"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "product", null);
__decorate([
    (0, common_1.Get)("customer/sitemap-products"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "sitemapProducts", null);
__decorate([
    (0, common_1.Get)("admin/dashboard/summary"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)("admin/users/list"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "users", null);
__decorate([
    (0, common_1.Get)("admin/reviews/list"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "reviews", null);
__decorate([
    (0, common_1.Get)("delivery/assigned/orders"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "assignedOrders", null);
__decorate([
    (0, common_1.Get)("delivery/assigned/orders/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "assignedOrder", null);
__decorate([
    (0, common_1.Get)("delivery/assigned/cash"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "cash", null);
__decorate([
    (0, common_1.Get)("delivery/assigned/history"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "history", null);
__decorate([
    (0, common_1.Get)("delivery/leaderboard"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "leaderboard", null);
__decorate([
    (0, common_1.Get)("admin/user-activities/list"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppDataController.prototype, "userActivities", null);
exports.AppDataController = AppDataController = __decorate([
    (0, common_1.Controller)("api")
], AppDataController);
