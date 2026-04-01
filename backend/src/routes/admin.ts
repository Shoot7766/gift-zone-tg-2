import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function adminRouter(jwtSecret: string) {
  const r = Router();
  const auth = requireAuth(jwtSecret);
  const adminOnly = requireRole("admin");

  r.use(auth, adminOnly);

  r.get("/stats", async (_req, res) => {
    const [users, sellers, products, shops, orders, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "seller" } }),
      prisma.product.count(),
      prisma.shop.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
    ]);

    const pendingShops = await prisma.shop.count({ where: { isApproved: false } });

    res.json({
      usersCount: users,
      sellersCount: sellers,
      productsCount: products,
      shopsCount: shops,
      ordersCount: orders,
      revenueTotal: revenueAgg._sum.totalPrice ?? 0,
      pendingShopsCount: pendingShops,
    });
  });

  r.get("/shops/pending", async (_req, res) => {
    const shops = await prisma.shop.findMany({
      where: { isApproved: false },
      include: { owner: true },
      orderBy: { createdAt: "asc" },
    });
    res.json({ shops });
  });

  r.post("/shops/:id/approve", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const shop = await prisma.shop.update({
      where: { id },
      data: { isApproved: true },
    });
    res.json({ shop });
  });

  r.post("/shops/:id/reject", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    await prisma.shop.delete({ where: { id } });
    res.json({ ok: true });
  });

  r.post("/shops/:id/featured", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const featured = Boolean(req.body?.featured);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const shop = await prisma.shop.update({
      where: { id },
      data: { isFeatured: featured },
    });
    res.json({ shop });
  });

  r.post("/shops/:id/subscription", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const type = req.body?.type as string | undefined;
    const allowed = ["free", "basic", "vip"];
    if (Number.isNaN(id) || !type || !allowed.includes(type)) {
      res.status(400).json({ error: "bad_request" });
      return;
    }
    const shop = await prisma.shop.update({
      where: { id },
      data: { subscriptionType: type as "free" | "basic" | "vip" },
    });
    res.json({ shop });
  });

  r.get("/products", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const products = await prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {},
      include: { shop: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    res.json({ products });
  });

  r.patch("/products/:id", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const { isActive, name, price } = req.body ?? {};
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(typeof name === "string" ? { name: name.trim() } : {}),
        ...(price != null && Number.isFinite(parseFloat(String(price)))
          ? { price: parseFloat(String(price)) }
          : {}),
      },
    });
    res.json({ product: updated });
  });

  r.get("/analytics/overview", async (_req, res) => {
    const agg = await prisma.analytics.aggregate({
      _sum: {
        viewsCount: true,
        clicksCount: true,
        ordersCount: true,
        revenue: true,
      },
    });
    res.json({
      viewsTotal: agg._sum.viewsCount ?? 0,
      clicksTotal: agg._sum.clicksCount ?? 0,
      ordersTotal: agg._sum.ordersCount ?? 0,
      revenueTotal: agg._sum.revenue ?? 0,
    });
  });

  r.get("/profile", async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  });

  return r;
}
