import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for basic user management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Products table for caching Amrod API data
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  images: jsonb("images").$type<string[]>().default([]),
  colors: jsonb("colors").$type<string[]>().default([]),
  sizes: jsonb("sizes").$type<string[]>().default([]),
  stockCount: integer("stock_count").default(0),
  brandingOptions: jsonb("branding_options").$type<any[]>().default([]),
  specifications: jsonb("specifications").$type<Record<string, any>>().default({}),
  minimumOrder: integer("minimum_order").default(1),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentId: varchar("parent_id"),
  sortOrder: integer("sort_order").default(0),
});

// Branding methods and pricing
export const brandingMethods = pgTable("branding_methods", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  colorUpcharge: decimal("color_upcharge", { precision: 10, scale: 2 }).default("0"),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }).default("0"),
  minimumQuantity: integer("minimum_quantity").default(1),
});

// Cart items (session-based)
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  brandingMethod: varchar("branding_method_id"),
  brandingColors: integer("branding_colors").default(1),
  customBranding: text("custom_branding"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  brandingCost: decimal("branding_cost", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quote requests
export const quoteRequests = pgTable("quote_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  companyName: text("company_name"),
  items: jsonb("items").$type<any[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API sync logs
export const apiSyncLogs = pgTable("api_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncType: text("sync_type").notNull(),
  status: text("status").notNull(),
  recordsProcessed: integer("records_processed").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastUpdated: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertBrandingMethodSchema = createInsertSchema(brandingMethods).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertBrandingMethod = z.infer<typeof insertBrandingMethodSchema>;
export type BrandingMethod = typeof brandingMethods.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type ApiSyncLog = typeof apiSyncLogs.$inferSelect;
