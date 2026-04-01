import path from "node:path";
import fs from "node:fs";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { SubscriptionType } from "@prisma/client";

export function sellerRouter(jwtSecret: string, uploadDir: string, publicUploadUrl: string) {
  const r = Router();
  const auth = requireAuth(jwtSecret);
  const sellerOnly = requireRole("seller");

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".bin";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

  r.use(auth, sellerOnly);

  r.get("/shop", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({
      where: { ownerUserId: req.auth!.sub },
      include: { analytics: true },
    });
    res.json({ shop });
  });

  r.post("/shop", async (req: AuthedRequest, res) => {
    const existing = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (existing) {
      res.status(400).json({ error: "already_exists" });
      return;
    }
    const { name, description, city } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name_required" });
      return;
    }
    const shop = await prisma.shop.create({
      data: {
        ownerUserId: req.auth!.sub,
        name: name.trim(),
        description: typeof description === "string" ? description : "",
        city: typeof city === "string" ? city : "",
        isApproved: false,
      },
    });
    await prisma.analytics.create({ data: { shopId: shop.id } });
    res.json({ shop });
  });

  r.patch("/shop", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const { name, description, city } = req.body ?? {};
    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(typeof name === "string" ? { name: name.trim() } : {}),
        ...(typeof description === "string" ? { description } : {}),
        ...(typeof city === "string" ? { city } : {}),
      },
    });
    res.json({ shop: updated });
  });

  r.post("/shop/logo", upload.single("file"), async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop || !req.file) {
      res.status(400).json({ error: "bad_request" });
      return;
    }
    const logoUrl = `${publicUploadUrl}/${req.file.filename}`;
    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: { logoUrl },
    });
    res.json({ shop: updated });
  });

  r.post("/shop/banner", upload.single("file"), async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop || !req.file) {
      res.status(400).json({ error: "bad_request" });
      return;
    }
    const bannerUrl = `${publicUploadUrl}/${req.file.filename}`;
    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: { bannerUrl },
    });
    res.json({ shop: updated });
  });

  r.get("/products", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.json({ products: [] });
      return;
    }
    const products = await prisma.product.findMany({
      where: { shopId: shop.id },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ products });
  });

  r.post("/products", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.status(400).json({ error: "create_shop_first" });
      return;
    }
    const { name, description, price, category, stock, imageUrl } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name_required" });
      return;
    }
    const p = parseFloat(String(price));
    if (!Number.isFinite(p) || p < 0) {
      res.status(400).json({ error: "bad_price" });
      return;
    }
    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: name.trim(),
        description: typeof description === "string" ? description : "",
        price: p,
        category: typeof category === "string" ? category : "",
        stock: Number.isFinite(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0,
        imageUrl: typeof imageUrl === "string" ? imageUrl : null,
      },
    });
    res.json({ product });
  });

  r.patch("/products/:id", async (req: AuthedRequest, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "bad_id" });
      return;
    }
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const product = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!product) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const { name, description, price, category, stock, isActive, imageUrl } = req.body ?? {};
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(typeof name === "string" ? { name: name.trim() } : {}),
        ...(typeof description === "string" ? { description } : {}),
        ...(price != null && Number.isFinite(parseFloat(String(price)))
          ? { price: parseFloat(String(price)) }
          : {}),
        ...(typeof category === "string" ? { category } : {}),
        ...(stock != null && Number.isFinite(Number(stock)) ? { stock: Math.max(0, Math.floor(Number(stock))) } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(typeof imageUrl === "string" ? { imageUrl } : {}),
      },
    });
    res.json({ product: updated });
  });

  r.post("/products/:id/image", upload.single("file"), async (req: AuthedRequest, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id) || !req.file) {
      res.status(400).json({ error: "bad_request" });
      return;
    }
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const product = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!product) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const imageUrl = `${publicUploadUrl}/${req.file.filename}`;
    const updated = await prisma.product.update({ where: { id }, data: { imageUrl } });
    res.json({ product: updated });
  });

  r.get("/orders", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.json({ orders: [] });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { product: { shopId: shop.id } },
      include: { product: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  });

  r.patch("/orders/:id/status", async (req: AuthedRequest, res) => {
    const id = parseInt(String(req.params.id), 10);
    const status = req.body?.status as string | undefined;
    const allowed = ["pending", "confirmed", "shipped", "completed", "cancelled"];
    if (Number.isNaN(id) || !status || !allowed.includes(status)) {
      res.status(400).json({ error: "bad_request" });
      return;
    }
    const shop = await prisma.shop.findFirst({ where: { ownerUserId: req.auth!.sub } });
    if (!shop) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const order = await prisma.order.findFirst({
      where: { id, product: { shopId: shop.id } },
    });
    if (!order) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as "pending" | "confirmed" | "shipped" | "completed" | "cancelled" },
    });
    res.json({ order: updated });
  });

  r.get("/analytics", async (req: AuthedRequest, res) => {
    const shop = await prisma.shop.findFirst({
      where: { ownerUserId: req.auth!.sub },
      include: { analytics: true },
    });
    if (!shop) {
      res.json({ analytics: null });
      return;
    }
    res.json({ analytics: shop.analytics, subscriptionType: shop.subscriptionType as SubscriptionType });
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
