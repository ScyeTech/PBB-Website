import { storage } from '../storage';
import { amrodApi } from './amrodApi';
import type { InsertProduct, InsertCategory, InsertBrandingMethod } from '@shared/schema';

export class SyncScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting Amrod API sync scheduler...');
    
    // Run initial sync
    this.syncAll().catch(console.error);
    
    // Schedule sync every 6 hours (6 * 60 * 60 * 1000)
    this.intervalId = setInterval(() => {
      this.syncAll().catch(console.error);
    }, 6 * 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Stopped Amrod API sync scheduler');
  }

  async syncAll(): Promise<void> {
    console.log('Starting full Amrod API sync...');
    
    try {
      await this.syncCategories();
      await this.syncBrandingMethods();
      await this.syncProducts();
      console.log('Full Amrod API sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
    }
  }

  async syncCategories(): Promise<void> {
    const syncLog = await storage.createSyncLog({
      syncType: 'categories',
      status: 'running'
    });

    try {
      console.log('Syncing categories from Amrod API...');
      const amrodCategories = await amrodApi.getCategories();
      
      const categories: InsertCategory[] = amrodCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId || null,
        imageUrl: null,
        sortOrder: 0
      }));

      await storage.bulkCreateCategories(categories);

      await storage.updateSyncLog(syncLog.id, {
        status: 'completed',
        recordsProcessed: categories.length,
        completedAt: new Date()
      });

      console.log(`Synced ${categories.length} categories`);
    } catch (error) {
      await storage.updateSyncLog(syncLog.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      throw error;
    }
  }

  async syncBrandingMethods(): Promise<void> {
    const syncLog = await storage.createSyncLog({
      syncType: 'branding_methods',
      status: 'running'
    });

    try {
      console.log('Syncing branding methods from Amrod API...');
      const amrodMethods = await amrodApi.getBrandingMethods();
      
      const methods: InsertBrandingMethod[] = amrodMethods.map(method => ({
        id: method.id,
        name: method.name,
        description: method.description,
        baseCost: method.baseCost.toString(),
        colorUpcharge: method.colorUpcharge.toString(),
        setupFee: method.setupFee.toString(),
        minimumQuantity: method.minimumQuantity
      }));

      await storage.bulkCreateBrandingMethods(methods);

      await storage.updateSyncLog(syncLog.id, {
        status: 'completed',
        recordsProcessed: methods.length,
        completedAt: new Date()
      });

      console.log(`Synced ${methods.length} branding methods`);
    } catch (error) {
      await storage.updateSyncLog(syncLog.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      throw error;
    }
  }

  async syncProducts(): Promise<void> {
    const syncLog = await storage.createSyncLog({
      syncType: 'products',
      status: 'running'
    });

    try {
      console.log('Syncing products from Amrod API...');
      
      // Clear existing products
      await storage.deleteAllProducts();
      
      let page = 1;
      let totalProcessed = 0;
      let hasMore = true;

      while (hasMore) {
        const { products: amrodProducts, hasMore: more } = await amrodApi.getProducts(page, 100);
        hasMore = more;

        const products: InsertProduct[] = amrodProducts.map(product => {
          // Extract colors and sizes from variants
          const colors = [...new Set(product.variants.map(v => v.color))];
          const sizes = [...new Set(product.variants.flatMap(v => v.sizes))];
          const stockCount = product.variants.reduce((sum, v) => sum + v.stock, 0);

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            basePrice: product.price.toString(),
            category: product.category,
            brand: product.brand,
            images: product.images,
            colors,
            sizes,
            stockCount,
            brandingOptions: product.brandingOptions,
            specifications: product.specifications,
            minimumOrder: product.minimumOrder,
            isActive: true
          };
        });

        await storage.bulkCreateProducts(products);
        totalProcessed += products.length;
        
        console.log(`Synced page ${page}, ${products.length} products (${totalProcessed} total)`);
        page++;
      }

      await storage.updateSyncLog(syncLog.id, {
        status: 'completed',
        recordsProcessed: totalProcessed,
        completedAt: new Date()
      });

      console.log(`Synced ${totalProcessed} products total`);
    } catch (error) {
      await storage.updateSyncLog(syncLog.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      throw error;
    }
  }
}

export const syncScheduler = new SyncScheduler();
