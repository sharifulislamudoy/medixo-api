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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = require("node:crypto");
const read_actor_1 = require("./read-actor");
const cloudinary_1 = require("../lib/cloudinary");
const roles = ["SHOP_OWNER", "DELIVERY_BOY"];
const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
const requiredDocuments = ["deed", "photo", "nidFront", "nidBack", "cv"];
function validDocument(file) {
    const bytes = file.buffer;
    const isPdf = bytes.subarray(0, 5).toString() === "%PDF-";
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (file.fieldname === "photo") {
        return (isJpeg && file.mimetype === "image/jpeg") ||
            (isPng && file.mimetype === "image/png");
    }
    return file.fieldname === "cv" ? isPdf && file.mimetype === "application/pdf"
        : (isPdf && file.mimetype === "application/pdf") ||
            (isJpeg && file.mimetype === "image/jpeg") ||
            (isPng && file.mimetype === "image/png");
}
let AuthController = class AuthController {
    async signup(body, files = []) {
        const role = String(body.role || "SHOP_OWNER");
        const phone = String(body.phone || "").trim();
        const name = String(body.name || "").trim();
        const password = String(body.password || "");
        if (!roles.some(item => item === role) || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone) ||
            name.length < 2 || password.length < 8 ||
            (body.confirmPassword && password !== body.confirmPassword)) {
            throw new common_1.BadRequestException("Invalid registration details");
        }
        if (role === "SHOP_OWNER" && (!body.shopName || !body.address)) {
            throw new common_1.BadRequestException("Shop name and address are required");
        }
        if (role === "SHOP_OWNER" &&
            (files.length > 1 || files.some(file => file.fieldname !== "shopLicense" || !validDocument(file)))) {
            throw new common_1.BadRequestException("Only one valid shop license document is allowed");
        }
        if (role === "DELIVERY_BOY") {
            if (body.vehicle !== "BIKE" && body.vehicle !== "CYCLE") {
                throw new common_1.BadRequestException("Choose bike or cycle");
            }
            const required = body.vehicle === "BIKE" ? [...requiredDocuments, "vehicleCard"] : requiredDocuments;
            if (files.length !== required.length ||
                required.some(type => files.filter(file => file.fieldname === type).length !== 1) ||
                files.some(file => !validDocument(file))) {
                throw new common_1.BadRequestException("Provide valid deed, photo, NID front/back, CV PDF and bike smart card when applicable");
            }
        }
        const email = String(body.email || `${phone}@accounts.medixo.local`).trim().toLowerCase();
        if (await prisma_1.prisma.user.findFirst({ where: { OR: [{ phone }, { email }] } })) {
            throw new common_1.ConflictException("Phone or email already exists");
        }
        const uploaded = [];
        try {
            const documents = [];
            for (const file of files) {
                const stored = await (0, cloudinary_1.uploadVerificationDocument)(file);
                uploaded.push(stored);
                documents.push({
                    type: file.fieldname,
                    mimeType: file.mimetype,
                    fileName: file.originalname.slice(0, 120),
                    publicId: stored.publicId,
                    resourceType: stored.resourceType,
                    format: stored.format,
                });
            }
            const user = await prisma_1.prisma.user.create({ data: {
                    name, email, phone, password: await bcryptjs_1.default.hash(password, 12),
                    role: role, status: "PENDING",
                    address: String(body.address || ""), shopName: body.shopName ? String(body.shopName) : null,
                    vehicle: role === "DELIVERY_BOY" ? String(body.vehicle || "BIKE") : null,
                    ...(body.areaId ? { area: { connect: { id: String(body.areaId) } } } : {}),
                    ...(documents.length ? { verificationDocuments: { create: documents } } : {}),
                } });
            return { message: "Registration pending admin approval", id: user.id, status: user.status };
        }
        catch (error) {
            await Promise.allSettled(uploaded.map(cloudinary_1.deleteVerificationDocument));
            throw error;
        }
    }
    async login(body, req) {
        const user = await prisma_1.prisma.user.findUnique({ where: { phone: String(body.phone || "") } });
        if (!user || !await bcryptjs_1.default.compare(String(body.password || ""), user.password)) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (user.status !== "APPROVED")
            throw new common_1.UnauthorizedException("ACCOUNT_NOT_APPROVED");
        if (user.role === "SUPPLIER" || (body.expectedRole && user.role !== body.expectedRole)) {
            throw new common_1.UnauthorizedException("Wrong application for this account");
        }
        const limit = user.role === "ADMIN" ? Infinity : 1;
        if (await prisma_1.prisma.session.count({ where: { userId: user.id } }) >= limit) {
            throw new common_1.UnauthorizedException("SESSION_LIMIT_EXCEEDED");
        }
        const session = await prisma_1.prisma.session.create({ data: {
                userId: user.id, token: (0, node_crypto_1.randomUUID)(), ipAddress: req.ip,
                userAgent: String(req.headers["user-agent"] || ""),
            } });
        return { user: { id: user.id, name: user.name, email: user.email,
                role: user.role, sessionId: session.token } };
    }
    async clearSessions(body) {
        const user = await prisma_1.prisma.user.findUnique({ where: { phone: String(body.phone || "") } });
        if (!user || !await bcryptjs_1.default.compare(String(body.password || ""), user.password)) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        await prisma_1.prisma.session.deleteMany({ where: { userId: user.id } });
        return { success: true };
    }
    async me(req) {
        return { user: await (0, read_actor_1.readActor)(req) };
    }
    async validateSession(body) {
        const token = String(body.sessionToken || "");
        if (!token)
            throw new common_1.UnauthorizedException("Session expired");
        const session = await prisma_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!session || session.user.status !== "APPROVED" ||
            session.user.role !== body.expectedRole) {
            throw new common_1.UnauthorizedException("Session expired");
        }
        const { id, name, email, role } = session.user;
        return { user: { id, name, email, role } };
    }
    async logout(body) {
        if (body.sessionToken) {
            await prisma_1.prisma.session.deleteMany({ where: { token: body.sessionToken } });
        }
        return { success: true };
    }
    async registerCustomer(body, files = []) {
        return this.signup({ ...body, role: "SHOP_OWNER" }, files);
    }
    async registerDelivery(body, files) {
        return this.signup({ ...body, role: "DELIVERY_BOY" }, files);
    }
    async document(id, type, req, res) {
        const actor = await (0, read_actor_1.readActor)(req);
        if (actor.role !== "ADMIN")
            throw new common_1.UnauthorizedException();
        const document = await prisma_1.prisma.verificationDocument.findUnique({
            where: { userId_type: { userId: id, type } },
        });
        if (!document)
            throw new common_1.NotFoundException();
        let data;
        if (document.publicId && document.resourceType && document.format) {
            const url = (0, cloudinary_1.verificationDocumentDownloadUrl)({
                publicId: document.publicId,
                resourceType: document.resourceType,
                format: document.format,
            });
            const cloudinaryResponse = await fetch(url, { cache: "no-store" });
            if (!cloudinaryResponse.ok)
                throw new common_1.NotFoundException("Document unavailable");
            data = Buffer.from(await cloudinaryResponse.arrayBuffer());
        }
        else if (document.data) {
            data = Buffer.from(document.data);
        }
        else {
            throw new common_1.NotFoundException("Document unavailable");
        }
        res.setHeader("Content-Type", document.mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${document.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`);
        res.setHeader("Cache-Control", "private, no-store");
        res.send(data);
    }
    async changeStatus(body, req) {
        const actor = await (0, read_actor_1.readActor)(req);
        if (actor.role !== "ADMIN")
            throw new common_1.UnauthorizedException();
        if (!statuses.some(status => status === body.newStatus))
            throw new common_1.BadRequestException("Invalid status");
        if (body.userId === actor.id)
            throw new common_1.BadRequestException("Cannot change your own status");
        return prisma_1.prisma.user.update({ where: { id: body.userId }, data: {
                status: body.newStatus,
                ...(body.deliveryCodeId ? { deliveryCodeId: body.deliveryCodeId } : {}),
            }, select: { id: true, status: true, deliveryCodeId: true } });
    }
    async status(id, body, req) {
        return this.changeStatus({ userId: id, newStatus: body.status, deliveryCodeId: body.deliveryCodeId }, req);
    }
    async assignCode(id, body, req) {
        const actor = await (0, read_actor_1.readActor)(req);
        if (actor.role !== "ADMIN")
            throw new common_1.UnauthorizedException();
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (user?.role !== "DELIVERY_BOY" || !body.deliveryCodeId)
            throw new common_1.BadRequestException("Invalid assignment");
        return prisma_1.prisma.user.update({ where: { id }, data: { deliveryCodeId: body.deliveryCodeId },
            select: { id: true, deliveryCodeId: true } });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("auth/signup"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { files: 6, fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("auth/login"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("api/auth/clear-sessions"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "clearSessions", null);
__decorate([
    (0, common_1.Get)("auth/me"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)("auth/session"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateSession", null);
__decorate([
    (0, common_1.Post)("auth/logout"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("api/register"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { files: 1, fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    (0, common_1.Post)("api/register/delivery-boy"),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { files: 6, fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerDelivery", null);
__decorate([
    (0, common_1.Get)("api/admin/users/:id/documents/:type"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("type")),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "document", null);
__decorate([
    (0, common_1.Post)("api/admin/users/update-status"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Patch)("api/admin/users/:id/status"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "status", null);
__decorate([
    (0, common_1.Put)("api/admin/users/:id/delivery-code"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "assignCode", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)()
], AuthController);
