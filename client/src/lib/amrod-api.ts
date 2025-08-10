// Frontend utilities for Amrod API data handling
import type { Product, Category, BrandingMethod } from "@shared/schema";

export interface ProductFilters {
  category?: string;
  search?: string;
  brand?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class AmrodApiClient {
  private baseUrl = '/api';

  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseUrl}/products?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    return response.json();
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  }

  async getBrandingMethods(): Promise<BrandingMethod[]> {
    const response = await fetch(`${this.baseUrl}/branding-methods`);
    if (!response.ok) {
      throw new Error('Failed to fetch branding methods');
    }
    
    return response.json();
  }

  async calculateBrandingCost(params: {
    productId: string;
    quantity: number;
    brandingMethodId: string;
    colors: number;
  }) {
    const response = await fetch(`${this.baseUrl}/branding/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate branding cost');
    }

    return response.json();
  }
}

export const amrodApiClient = new AmrodApiClient();
