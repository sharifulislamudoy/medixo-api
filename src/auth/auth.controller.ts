import { Body, Controller, Get, Param, Patch, Post, Put, Req, Res, UploadedFiles, UseInterceptors, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { readActor } from "./read-actor";
import { deleteVerificationDocument, uploadVerificationDocument, verificationDocumentDownloadUrl, type StoredDocument } from "../lib/cloudinary";

const roles = ["SHOP_OWNER", "DELIVERY_BOY"] as const;
const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
const requiredDocuments = ["deed", "photo", "nidFront", "nidBack", "cv"];
type RegistrationFile = { fieldname: string; originalname: string; mimetype: string; buffer: Buffer };

function validDocument(file: RegistrationFile) {
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

@Controller()
export class AuthController {
  @Post("auth/signup")
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 6, fileSize: 5 * 1024 * 1024 } }))
  async signup(@Body() body: Record<string, unknown>, @UploadedFiles() files: RegistrationFile[] = []) {
    const role = String(body.role || "SHOP_OWNER");
    const phone = String(body.phone || "").trim();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    if (!roles.some(item => item === role) || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone) ||
        name.length < 2 || password.length < 8 ||
        (body.confirmPassword && password !== body.confirmPassword)) {
      throw new BadRequestException("Invalid registration details");
    }
    if (role === "SHOP_OWNER" && (!body.shopName || !body.address)) {
      throw new BadRequestException("Shop name and address are required");
    }
    if (role === "SHOP_OWNER" &&
        (files.length > 1 || files.some(file => file.fieldname !== "shopLicense" || !validDocument(file)))) {
      throw new BadRequestException("Only one valid shop license document is allowed");
    }
    if (role === "DELIVERY_BOY") {
      if (body.vehicle !== "BIKE" && body.vehicle !== "CYCLE") {
        throw new BadRequestException("Choose bike or cycle");
      }
      const required = body.vehicle === "BIKE" ? [...requiredDocuments, "vehicleCard"] : requiredDocuments;
      if (files.length !== required.length ||
          required.some(type => files.filter(file => file.fieldname === type).length !== 1) ||
          files.some(file => !validDocument(file))) {
        throw new BadRequestException("Provide valid deed, photo, NID front/back, CV PDF and bike smart card when applicable");
      }
    }
    const email = String(body.email || `${phone}@accounts.medixo.local`).trim().toLowerCase();
    if (await prisma.user.findFirst({ where: { OR: [{ phone }, { email }] } })) {
      throw new ConflictException("Phone or email already exists");
    }
    const uploaded: StoredDocument[] = [];
    try {
      const documents = [];
      for (const file of files) {
        const stored = await uploadVerificationDocument(file);
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

      const user = await prisma.user.create({ data: {
        name, email, phone, password: await bcrypt.hash(password, 12),
        role: role as "SHOP_OWNER" | "DELIVERY_BOY", status: "PENDING",
        address: String(body.address || ""), shopName: body.shopName ? String(body.shopName) : null,
        vehicle: role === "DELIVERY_BOY" ? String(body.vehicle || "BIKE") : null,
        ...(body.areaId ? { area: { connect: { id: String(body.areaId) } } } : {}),
        ...(documents.length ? { verificationDocuments: { create: documents } } : {}),
      }});
      return { message: "Registration pending admin approval", id: user.id, status: user.status };
    } catch (error) {
      await Promise.allSettled(uploaded.map(deleteVerificationDocument));
      throw error;
    }
  }

  @Post("auth/login")
  async login(@Body() body: Record<string, string>, @Req() req: Request) {
    const user = await prisma.user.findUnique({ where: { phone: String(body.phone || "") } });
    if (!user || !await bcrypt.compare(String(body.password || ""), user.password)) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (user.status !== "APPROVED") throw new UnauthorizedException("ACCOUNT_NOT_APPROVED");
    if (user.role === "SUPPLIER" || (body.expectedRole && user.role !== body.expectedRole)) {
      throw new UnauthorizedException("Wrong application for this account");
    }
    const limit = user.role === "ADMIN" ? Infinity : 1;
    if (await prisma.session.count({ where: { userId: user.id } }) >= limit) {
      throw new UnauthorizedException("SESSION_LIMIT_EXCEEDED");
    }
    const session = await prisma.session.create({ data: {
      userId: user.id, token: randomUUID(), ipAddress: req.ip,
      userAgent: String(req.headers["user-agent"] || ""),
    }});
    return { user: { id: user.id, name: user.name, email: user.email,
      role: user.role, sessionId: session.token } };
  }

  @Post("api/auth/clear-sessions")
  async clearSessions(@Body() body: Record<string, string>) {
    const user = await prisma.user.findUnique({ where: { phone: String(body.phone || "") } });
    if (!user || !await bcrypt.compare(String(body.password || ""), user.password)) {
      throw new UnauthorizedException("Invalid credentials");
    }
    await prisma.session.deleteMany({ where: { userId: user.id } });
    return { success: true };
  }

  @Get("auth/me")
  async me(@Req() req: Request) {
    return { user: await readActor(req) };
  }

  @Post("auth/session")
  async validateSession(@Body() body: Record<string, string>) {
    const token = String(body.sessionToken || "");
    if (!token) throw new UnauthorizedException("Session expired");
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.user.status !== "APPROVED" ||
        session.user.role !== body.expectedRole) {
      throw new UnauthorizedException("Session expired");
    }
    const { id, name, email, role } = session.user;
    return { user: { id, name, email, role } };
  }

  @Post("auth/logout")
  async logout(@Body() body: Record<string, string>) {
    if (body.sessionToken) {
      await prisma.session.deleteMany({ where: { token: body.sessionToken } });
    }
    return { success: true };
  }

  @Post("api/register")
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 1, fileSize: 5 * 1024 * 1024 } }))
  async registerCustomer(@Body() body: Record<string, unknown>, @UploadedFiles() files: RegistrationFile[] = []) {
    return this.signup({ ...body, role: "SHOP_OWNER" }, files);
  }

  @Post("api/register/delivery-boy")
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 6, fileSize: 5 * 1024 * 1024 } }))
  async registerDelivery(@Body() body: Record<string, unknown>, @UploadedFiles() files: RegistrationFile[]) {
    return this.signup({ ...body, role: "DELIVERY_BOY" }, files);
  }

  @Get("api/admin/users/:id/documents/:type")
  async document(@Param("id") id: string, @Param("type") type: string,
    @Req() req: Request, @Res() res: Response) {
    const actor = await readActor(req);
    if (actor.role !== "ADMIN") throw new UnauthorizedException();
    const document = await prisma.verificationDocument.findUnique({
      where: { userId_type: { userId: id, type } },
    });
    if (!document) throw new NotFoundException();
    let data: Buffer;
    if (document.publicId && document.resourceType && document.format) {
      const url = verificationDocumentDownloadUrl({
        publicId: document.publicId,
        resourceType: document.resourceType as StoredDocument["resourceType"],
        format: document.format,
      });
      const cloudinaryResponse = await fetch(url, { cache: "no-store" });
      if (!cloudinaryResponse.ok) throw new NotFoundException("Document unavailable");
      data = Buffer.from(await cloudinaryResponse.arrayBuffer());
    } else if (document.data) {
      data = Buffer.from(document.data);
    } else {
      throw new NotFoundException("Document unavailable");
    }
    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${document.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.send(data);
  }

  @Post("api/admin/users/update-status")
  async changeStatus(@Body() body: Record<string, string>, @Req() req: Request) {
    const actor = await readActor(req);
    if (actor.role !== "ADMIN") throw new UnauthorizedException();
    if (!statuses.some(status => status === body.newStatus)) throw new BadRequestException("Invalid status");
    if (body.userId === actor.id) throw new BadRequestException("Cannot change your own status");
    return prisma.user.update({ where: { id: body.userId }, data: {
      status: body.newStatus as typeof statuses[number],
      ...(body.deliveryCodeId ? { deliveryCodeId: body.deliveryCodeId } : {}),
    }, select: { id: true, status: true, deliveryCodeId: true } });
  }

  @Patch("api/admin/users/:id/status")
  async status(@Param("id") id: string, @Body() body: Record<string, string>, @Req() req: Request) {
    return this.changeStatus({ userId: id, newStatus: body.status, deliveryCodeId: body.deliveryCodeId }, req);
  }

  @Put("api/admin/users/:id/delivery-code")
  async assignCode(@Param("id") id: string, @Body() body: Record<string, string>, @Req() req: Request) {
    const actor = await readActor(req);
    if (actor.role !== "ADMIN") throw new UnauthorizedException();
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role !== "DELIVERY_BOY" || !body.deliveryCodeId) throw new BadRequestException("Invalid assignment");
    return prisma.user.update({ where: { id }, data: { deliveryCodeId: body.deliveryCodeId },
      select: { id: true, deliveryCodeId: true } });
  }
}
