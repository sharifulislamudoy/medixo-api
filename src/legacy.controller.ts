import { All, Controller, Req, Res, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { NextRequest } from "next/server";
import type { Request, Response } from "express";
import { legacyRoutes } from "./legacy-routes";
import { readActor } from "./auth/read-actor";
import { sessionScope } from "./compat/session";

@Controller("api")
export class LegacyController {
  @All("*")
  async dispatch(@Req() req: Request, @Res() res: Response) {
    const pathname = new URL(req.originalUrl, "http://localhost").pathname;
    const route = legacyRoutes.find(item => item.pattern.test(pathname));
    const method = req.method.toUpperCase();
    if (!route || typeof route.handlers[method] !== "function") throw new NotFoundException();

    const actor = await readActor(req);
    if (pathname.startsWith("/api/admin/") && actor.role !== "ADMIN") {
      throw new UnauthorizedException("Admin access required");
    }
    if ((pathname.startsWith("/api/deliveryboy/") || pathname.startsWith("/api/delivery/")) &&
        actor.role !== "DELIVERY_BOY") {
      throw new UnauthorizedException("Delivery access required");
    }
    if ((pathname.startsWith("/api/suppliers/") || pathname === "/api/suppliers" ||
         pathname === "/api/products-for-purchase" ||
         pathname === "/api/products/search-suggestions") && actor.role !== "ADMIN") {
      throw new UnauthorizedException("Supplier app is outside the three-role scope");
    }
    if ((pathname === "/api/orders" || pathname.startsWith("/api/orders/") || pathname.startsWith("/api/review/")) &&
        actor.role !== "SHOP_OWNER" && actor.role !== "ADMIN") {
      throw new UnauthorizedException("Customer access required");
    }

    const params = pathname.match(route.pattern)?.groups || {};
    const url = new URL(req.originalUrl, `http://${req.headers.host || "localhost:4000"}`);
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(name, value);
    }
    const hasBody = !["GET", "HEAD"].includes(method);
    const request = new NextRequest(url, {
      method, headers,
      ...(hasBody ? { body: JSON.stringify(req.body ?? {}), duplex: "half" as never } : {}),
    });
    const handler = route.handlers[method] as (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<globalThis.Response>;
    const response = await sessionScope.run(actor, () => handler(request, { params: Promise.resolve(params) }));
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(await response.arrayBuffer()));
  }
}
