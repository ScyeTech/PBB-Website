import { 
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct,
  type Category,
  type InsertCategory,
  type BrandingMethod,
  type InsertBrandingMethod,
  type CartItem,
  type InsertCartItem,
  type QuoteRequest,
  type InsertQuoteRequest,
  type ApiSyncLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(filters?: { category?: string; search?: string; brand?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteAllProducts(): Promise<void>;
  bulkCreateProducts(products: InsertProduct[]): Promise<Product[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  bulkCreateCategories(categories: InsertCategory[]): Promise<Category[]>;

  // Branding Methods
  getBrandingMethods(): Promise<BrandingMethod[]>;
  getBrandingMethod(id: string): Promise<BrandingMethod | undefined>;
  createBrandingMethod(method: InsertBrandingMethod): Promise<BrandingMethod>;
  bulkCreateBrandingMethods(methods: InsertBrandingMethod[]): Promise<BrandingMethod[]>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, item: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Quotes
  createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequest(id: string): Promise<QuoteRequest | undefined>;
  getQuoteRequests(): Promise<QuoteRequest[]>;

  // API Sync Logs
  createSyncLog(log: { syncType: string; status: string; recordsProcessed?: number; errorMessage?: string }): Promise<ApiSyncLog>;
  updateSyncLog(id: string, updates: { status: string; recordsProcessed?: number; errorMessage?: string; completedAt?: Date }): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private brandingMethods: Map<string, BrandingMethod> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private quoteRequests: Map<string, QuoteRequest> = new Map();
  private syncLogs: Map<string, ApiSyncLog> = new Map();

  private sampleDataLoaded = false;

  private async ensureSampleDataLoaded() {
    if (this.sampleDataLoaded) return;
    
    try {
      console.log('Loading sample data for development...');
      
      // Import sample data
      const { sampleProducts, sampleCategories, sampleBrandingMethods } = await import('./sample-data.js');
      
      // Load categories
      sampleCategories.forEach(category => {
        this.categories.set(category.id, category);
      });
      
      // Load branding methods
      sampleBrandingMethods.forEach(method => {
        this.brandingMethods.set(method.id, method);
      });
      
      // Load products
      sampleProducts.forEach(product => {
        this.products.set(product.id, product);
      });
      
      this.sampleDataLoaded = true;
      console.log(`Loaded sample data: ${sampleProducts.length} products, ${sampleCategories.length} categories, ${sampleBrandingMethods.length} branding methods`);
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(filters?: { category?: string; search?: string; brand?: string }): Promise<Product[]> {
    await this.ensureSampleDataLoaded();
    let products = Array.from(this.products.values()).filter(p => p.isActive);

    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    await this.ensureSampleDataLoaded();
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product, 
      id,
      lastUpdated: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = { 
      ...existing, 
      ...product,
      lastUpdated: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteAllProducts(): Promise<void> {
    this.products.clear();
  }

  async bulkCreateProducts(products: InsertProduct[]): Promise<Product[]> {
    const created: Product[] = [];
    for (const product of products) {
      const newProduct = await this.createProduct(product);
      created.push(newProduct);
    }
    return created;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    await this.ensureSampleDataLoaded();
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async bulkCreateCategories(categories: InsertCategory[]): Promise<Category[]> {
    const created: Category[] = [];
    for (const category of categories) {
      const newCategory = await this.createCategory(category);
      created.push(newCategory);
    }
    return created;
  }

  // Branding Methods
  async getBrandingMethods(): Promise<BrandingMethod[]> {
    await this.ensureSampleDataLoaded();
    return Array.from(this.brandingMethods.values());
  }

  async getBrandingMethod(id: string): Promise<BrandingMethod | undefined> {
    await this.ensureSampleDataLoaded();
    return this.brandingMethods.get(id);
  }

  async createBrandingMethod(method: InsertBrandingMethod): Promise<BrandingMethod> {
    const id = randomUUID();
    const newMethod: BrandingMethod = { ...method, id };
    this.brandingMethods.set(id, newMethod);
    return newMethod;
  }

  async bulkCreateBrandingMethods(methods: InsertBrandingMethod[]): Promise<BrandingMethod[]> {
    const created: BrandingMethod[] = [];
    for (const method of methods) {
      const newMethod = await this.createBrandingMethod(method);
      created.push(newMethod);
    }
    return created;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const newItem: CartItem = { 
      ...item, 
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, item: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const existing = this.cartItems.get(id);
    if (!existing) return undefined;

    const updated: CartItem = { ...existing, ...item };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeCartItem(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToRemove = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToRemove.forEach(id => this.cartItems.delete(id));
  }

  // Quotes
  async createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = randomUUID();
    const newQuote: QuoteRequest = { 
      ...quote, 
      id,
      createdAt: new Date()
    };
    this.quoteRequests.set(id, newQuote);
    return newQuote;
  }

  async getQuoteRequest(id: string): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }

  // API Sync Logs
  async createSyncLog(log: { syncType: string; status: string; recordsProcessed?: number; errorMessage?: string }): Promise<ApiSyncLog> {
    const id = randomUUID();
    const newLog: ApiSyncLog = { 
      ...log,
      id,
      recordsProcessed: log.recordsProcessed || 0,
      startedAt: new Date(),
      completedAt: null
    };
    this.syncLogs.set(id, newLog);
    return newLog;
  }

  async updateSyncLog(id: string, updates: { status: string; recordsProcessed?: number; errorMessage?: string; completedAt?: Date }): Promise<void> {
    const existing = this.syncLogs.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.syncLogs.set(id, updated);
    }
  }
}

export const storage = new MemStorage();
