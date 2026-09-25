import { decode } from "next-auth/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { prisma } from "../lib/prisma";
import type { Request } from "express";

export async function readActor(req: Request) {
  const cookies = Object.fromEntries(String(req.headers.cookie || "").split("; ")
    .filter(Boolean).map(pair => { const i = pair.indexOf("="); return [pair.slice(0, i), pair.slice(i + 1)]; }));
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7) : undefined;
  const path = req.originalUrl || "";
  const roleCookie = path.startsWith("/api/admin/") ? "medixo-admin.session-token"
    : path.startsWith("/api/deliveryboy/") || path.startsWith("/api/delivery/")
      ? "medixo-delivery.session-token"
      : path.startsWith("/api/customer/") || path.startsWith("/api/orders") || path.startsWith("/api/review/")
        ? "medixo-customer.session-token" : "";
  const token = bearer || (roleCookie ? cookies[roleCookie] : undefined) ||
    cookies["medixo-admin.session-token"] || cookies["medixo-customer.session-token"] ||
    cookies["medixo-delivery.session-token"];
  if (!token || !process.env.NEXTAUTH_SECRET) throw new UnauthorizedException("Login required");
  const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET });
  if (!decoded?.id || !decoded.sessionId) throw new UnauthorizedException("Session expired");
  const [user, session] = await Promise.all([
    prisma.user.findUnique({ where: { id: String(decoded.id) }, select: { id: true, role: true, status: true, name: true, email: true } }),
    prisma.session.findUnique({ where: { token: String(decoded.sessionId) }, select: { userId: true } }),
  ]);
  if (!user || user.status !== "APPROVED" || !session || session.userId !== user.id || user.role !== decoded.role) {
    throw new UnauthorizedException("Session expired");
  }
  return { id: user.id, role: user.role, name: user.name, email: user.email };
}
