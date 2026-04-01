import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export function publicRouter() {
  const r = Router();

  r.get("/shops", async (req, res) => {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const featured = req.query.featured === "1";
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const shops = await prisma.shop.findMany({
      where: {
        isApproved: true,
        ...(city ? { city } : {}),
        ...(featured ? { isFeatured: true } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { city: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({
      shops: shops.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        city: s.city,
        logoUrl: s.logoUrl,
        bannerUrl: s.bannerUrl,
        isFeatured: s.isFeatured,
        subscriptionType: s.subscriptionType,
        productCount: s._count.products,
      })),
    });
  });

  r.get("/shops/:id", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const shop = await prisma.shop.findFirst({
      where: { id, isApproved: true },
      include: {
        owner: { select: { username: true, firstName: true } },
        products: { where: { isActive: true }, orderBy: { updatedAt: "desc" } },
      },
    });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const { owner, ...rest } = shop;
    res.json({
      shop: {
        ...rest,
        ownerUsername: owner?.username ?? null,
        ownerFirstName: owner?.firstName ?? null,
      },
    });
  });

  r.post("/shops/:id/view", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await prisma.analytics.upsert({
      where: { shopId: id },
      create: { shopId: id, viewsCount: 1 },
      update: { viewsCount: { increment: 1 } },
    });
    res.json({ ok: true });
  });

  r.get("/products", async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const min = req.query.min != null ? parseFloat(String(req.query.min)) : undefined;
    const max = req.query.max != null ? parseFloat(String(req.query.max)) : undefined;
    const shopId = req.query.shopId != null ? parseInt(String(req.query.shopId), 10) : undefined;

    const priceFilter =
      Number.isFinite(min) || Number.isFinite(max)
        ? {
            price: {
              ...(Number.isFinite(min) ? { gte: min as number } : {}),
              ...(Number.isFinite(max) ? { lte: max as number } : {}),
            },
          }
        : {};

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        shop: { isApproved: true },
        ...(category ? { category } : {}),
        ...(Number.isFinite(shopId) ? { shopId: shopId! } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...priceFilter,
      },
      include: { shop: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    res.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
        stock: p.stock,
        shop: {
          id: p.shop.id,
          name: p.shop.name,
          city: p.shop.city,
          logoUrl: p.shop.logoUrl,
        },
      })),
    });
  });

  r.get("/products/:id", async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const product = await prisma.product.findFirst({
      where: { id, isActive: true, shop: { isApproved: true } },
      include: { shop: { include: { owner: { select: { username: true } } } } },
    });
    if (!product) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await prisma.analytics.upsert({
      where: { shopId: product.shopId },
      create: { shopId: product.shopId, clicksCount: 1 },
      update: { clicksCount: { increment: 1 } },
    });
    const { shop, ...p } = product;
    const { owner, ...shopRest } = shop;
    res.json({
      product: {
        ...p,
        shop: { ...shopRest, ownerUsername: owner?.username ?? null },
      },
    });
  });

  r.get("/categories", async (_req, res) => {
    const rows = await prisma.product.findMany({
      where: { isActive: true, shop: { isApproved: true }, NOT: { category: "" } },
      select: { category: true },
      distinct: ["category"],
    });
    res.json({ categories: rows.map((r) => r.category).filter(Boolean) });
  });

  return r;
}
