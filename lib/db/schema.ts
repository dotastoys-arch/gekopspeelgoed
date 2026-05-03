import { pgTable, text, integer, serial, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  ean: text("ean").unique(),
  articleNumber: text("article_number"),
  name: text("name").notNull(),
  purchasePriceExcl: doublePrecision("purchase_price_excl").notNull(),
  gender: text("gender", { enum: ["boy", "girl", "unisex"] }).notNull().default("unisex"),
  ageMin: integer("age_min").notNull().default(0),
  ageMax: integer("age_max").notNull().default(8),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  supplier: text("supplier").notNull(),
  invoiceNumber: text("invoice_number"),
  invoiceDate: text("invoice_date"),
  totalExcl: doublePrecision("total_excl"),
  totalBtw: doublePrecision("total_btw"),
  totalIncl: doublePrecision("total_incl"),
  filename: text("filename"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const invoiceLines = pgTable("invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").references(() => products.id),
  articleNumber: text("article_number"),
  ean: text("ean"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceExcl: doublePrecision("unit_price_excl").notNull(),
  totalExcl: doublePrecision("total_excl").notNull(),
});

export const packageConfigs = pgTable("package_configs", {
  id: serial("id").primaryKey(),
  category: text("category", {
    enum: ["baby_0_3", "boys_3_5", "boys_6_8", "girls_3_5", "girls_6_8"],
  }).notNull().unique(),
  sellingPriceIncl: doublePrecision("selling_price_incl").notNull().default(34.95),
  itemsCount: integer("items_count").notNull().default(6),
  minMarginPct: doublePrecision("min_margin_pct").notNull().default(25),
  minProfit: doublePrecision("min_profit").notNull().default(5.0),
  shippingCost: doublePrecision("shipping_cost").notNull().default(4.95),
  vatRate: doublePrecision("vat_rate").notNull().default(21.0),
  isActive: boolean("is_active").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country").notNull().default("NL"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  category: text("category", {
    enum: ["baby_0_3", "boys_3_5", "boys_6_8", "girls_3_5", "girls_6_8"],
  }).notNull(),
  sellingPriceIncl: doublePrecision("selling_price_incl").notNull(),
  totalPurchaseExcl: doublePrecision("total_purchase_excl").notNull(),
  profit: doublePrecision("profit").notNull(),
  status: text("status", {
    enum: ["pending_payment", "pending", "packed", "shipped", "delivered", "cancelled"],
  }).notNull().default("pending_payment"),
  molliePaymentId: text("mollie_payment_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  purchasePriceExcl: doublePrecision("purchase_price_excl").notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type PackageConfig = typeof packageConfigs.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Category = "baby_0_3" | "boys_3_5" | "boys_6_8" | "girls_3_5" | "girls_6_8";
