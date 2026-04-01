import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export function customerRouter(jwtSecret: string) {
  const r = Router();
  const auth = requireAuth(jwtSecret);
  const customerOnly = requireRole("customer");

  r.use(auth, customerOnly);

  r.get("/favorites", async (req: AuthedRequest, res) => {
    const userId = req.auth!.sub;
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { shop: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      favorites: rows.map((f) => ({
        id: f.id,
        product: f.product,
      })),
    });
  });

  r.post("/favorites/:productId", async (req: AuthedRequest, res) => {
    const userId = req.auth!.sub;
    const productId = parseInt(String(req.params.productId), 10);
    if (Number.isNaN(productId)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true, shop: { isApproved: true } },
    });
    if (!product) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
    res.json({ ok: true });
  });

  r.delete("/favorites/:productId", async (req: AuthedRequest, res) => {
    const userId = req.auth!.sub;
    const productId = parseInt(String(req.params.productId), 10);
    if (Number.isNaN(productId)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    await prisma.favorite.deleteMany({ where: { userId, productId } });
    res.json({ ok: true });
  });

  r.post("/orders/checkout", async (req: AuthedRequest, res) => {
    const userId = req.auth!.sub;
    const items = req.body?.items as { productId: number; quantity: number }[] | undefined;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "empty_cart" });
      return;
    }

    const created: number[] = [];

    for (const raw of items) {
      const productId = Number(raw.productId);
      const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
      if (!Number.isFinite(productId)) continue;

      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true, shop: { isApproved: true } },
        include: { shop: true },
      });
      if (!product || product.stock < quantity) {
        res.status(400).json({ error: "stock_or_product", productId });
        return;
      }

      const totalPrice = product.price * quantity;

      const order = await prisma.$transaction(async (tx) => {
        const o = await tx.order.create({
          data: {
            customerUserId: userId,
            productId,
            quantity,
            totalPrice,
            status: "pending",
          },
        });
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
        await tx.analytics.upsert({
          where: { shopId: product.shopId },
          create: {
            shopId: product.shopId,
            ordersCount: 1,
            revenue: totalPrice,
          },
          update: {
            ordersCount: { increment: 1 },
            revenue: { increment: totalPrice },
          },
        });
        return o;
      });

      created.push(order.id);
    }

    res.json({ ok: true, orderIds: created });
  });

  r.get("/orders", async (req: AuthedRequest, res) => {
    const userId = req.auth!.sub;
    const orders = await prisma.order.findMany({
      where: { customerUserId: userId },
      include: { product: { include: { shop: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
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
