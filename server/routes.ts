import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { amrodApi } from "./services/amrodApi";
import { syncScheduler } from "./services/scheduler";
import { insertCartItemSchema, insertQuoteRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the sync scheduler
  syncScheduler.start();

  // Session middleware for cart tracking
  app.use((req, res, next) => {
    if (!req.session.id) {
      req.session.id = randomUUID();
    }
    next();
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, brand, page = "1", limit = "20" } = req.query;
      
      const filters = {
        category: category as string | undefined,
        search: search as string | undefined,
        brand: brand as string | undefined,
      };

      const products = await storage.getProducts(filters);
      
      // Simple pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum;
      
      const paginatedProducts = products.slice(start, end);
      
      res.json({
        products: paginatedProducts,
        total: products.length,
        page: pageNum,
        limit: limitNum,
        hasMore: end < products.length
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Branding methods API
  app.get("/api/branding-methods", async (req, res) => {
    try {
      const methods = await storage.getBrandingMethods();
      res.json(methods);
    } catch (error) {
      console.error("Error fetching branding methods:", error);
      res.status(500).json({ error: "Failed to fetch branding methods" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      if (!sessionId) {
        return res.json([]);
      }
      
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      if (!sessionId) {
        return res.status(400).json({ error: "No session found" });
      }

      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });

      const cartItem = await storage.addCartItem(validatedData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ error: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const updatedItem = await storage.updateCartItem(req.params.id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeCartItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      if (!sessionId) {
        return res.json({ success: true });
      }
      
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Quote requests API
  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quote = await storage.createQuoteRequest(validatedData);
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(400).json({ error: "Failed to create quote request" });
    }
  });

  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuoteRequest(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // Branding calculator API
  app.post("/api/branding/calculate", async (req, res) => {
    try {
      const { productId, quantity, brandingMethodId, colors = 1 } = req.body;

      const product = await storage.getProduct(productId);
      const brandingMethod = await storage.getBrandingMethod(brandingMethodId);

      if (!product || !brandingMethod) {
        return res.status(404).json({ error: "Product or branding method not found" });
      }

      const productCost = parseFloat(product.basePrice) * quantity;
      const baseBrandingCost = parseFloat(brandingMethod.baseCost) * quantity;
      const colorUpcharge = parseFloat(brandingMethod.colorUpcharge || '0') * (colors - 1) * quantity;
      const setupFee = parseFloat(brandingMethod.setupFee || '0');

      const subtotal = productCost + baseBrandingCost + colorUpcharge + setupFee;
      const vat = subtotal * 0.15;
      const total = subtotal + vat;

      res.json({
        productCost,
        brandingCost: baseBrandingCost + colorUpcharge,
        setupFee,
        subtotal,
        vat,
        total,
        perUnit: total / quantity
      });
    } catch (error) {
      console.error("Error calculating branding cost:", error);
      res.status(500).json({ error: "Failed to calculate branding cost" });
    }
  });

  // Manual sync trigger (for development)
  app.post("/api/sync", async (req, res) => {
    try {
      await syncScheduler.syncAll();
      res.json({ success: true, message: "Sync completed" });
    } catch (error) {
      console.error("Manual sync failed:", error);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
