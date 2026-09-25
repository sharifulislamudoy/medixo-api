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
exports.LegacyController = void 0;
const common_1 = require("@nestjs/common");
const server_1 = require("next/server");
const legacy_routes_1 = require("./legacy-routes");
const read_actor_1 = require("./auth/read-actor");
const session_1 = require("./compat/session");
let LegacyController = class LegacyController {
    async dispatch(req, res) {
        const pathname = new URL(req.originalUrl, "http://localhost").pathname;
        const route = legacy_routes_1.legacyRoutes.find(item => item.pattern.test(pathname));
        const method = req.method.toUpperCase();
        if (!route || typeof route.handlers[method] !== "function")
            throw new common_1.NotFoundException();
        const actor = await (0, read_actor_1.readActor)(req);
        if (pathname.startsWith("/api/admin/") && actor.role !== "ADMIN") {
            throw new common_1.UnauthorizedException("Admin access required");
        }
        if ((pathname.startsWith("/api/deliveryboy/") || pathname.startsWith("/api/delivery/")) &&
            actor.role !== "DELIVERY_BOY") {
            throw new common_1.UnauthorizedException("Delivery access required");
        }
        if ((pathname.startsWith("/api/suppliers/") || pathname === "/api/suppliers" ||
            pathname === "/api/products-for-purchase" ||
            pathname === "/api/products/search-suggestions") && actor.role !== "ADMIN") {
            throw new common_1.UnauthorizedException("Supplier app is outside the three-role scope");
        }
        if ((pathname === "/api/orders" || pathname.startsWith("/api/orders/") || pathname.startsWith("/api/review/")) &&
            actor.role !== "SHOP_OWNER" && actor.role !== "ADMIN") {
            throw new common_1.UnauthorizedException("Customer access required");
        }
        const params = pathname.match(route.pattern)?.groups || {};
        const url = new URL(req.originalUrl, `http://${req.headers.host || "localhost:4000"}`);
        const headers = new Headers();
        for (const [name, value] of Object.entries(req.headers)) {
            if (typeof value === "string")
                headers.set(name, value);
        }
        const hasBody = !["GET", "HEAD"].includes(method);
        const request = new server_1.NextRequest(url, {
            method, headers,
            ...(hasBody ? { body: JSON.stringify(req.body ?? {}), duplex: "half" } : {}),
        });
        const handler = route.handlers[method];
        const response = await session_1.sessionScope.run(actor, () => handler(request, { params: Promise.resolve(params) }));
        res.status(response.status);
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.send(Buffer.from(await response.arrayBuffer()));
    }
};
exports.LegacyController = LegacyController;
__decorate([
    (0, common_1.All)("*"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LegacyController.prototype, "dispatch", null);
exports.LegacyController = LegacyController = __decorate([
    (0, common_1.Controller)("api")
], LegacyController);
