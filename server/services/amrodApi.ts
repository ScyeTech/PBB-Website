interface AmrodProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  variants: Array<{
    color: string;
    sizes: string[];
    stock: number;
  }>;
  brandingOptions: Array<{
    method: string;
    cost: number;
    setupFee: number;
    minimumQuantity: number;
  }>;
  specifications: Record<string, any>;
  minimumOrder: number;
}

interface AmrodCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
}

interface AmrodBrandingMethod {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  colorUpcharge: number;
  setupFee: number;
  minimumQuantity: number;
}

export class AmrodApiService {
  private baseUrl: string;
  private authUrl: string;
  private username: string;
  private password: string;
  private customerCode: string;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseUrl = process.env.AMROD_API_URL || 'https://vendorapi.amrod.co.za';
    this.authUrl = 'https://identity.amrod.co.za/VendorLogin';
    this.username = process.env.AMROD_USERNAME || 'chaitali@pbb.co.bw';
    this.password = process.env.AMROD_PASSWORD || 'Chaitali@2024';
    this.customerCode = process.env.AMROD_CUSTOMER_CODE || '';
    
    console.log('Amrod API initialized with credentials for:', this.username);
  }

  private async authenticate(): Promise<string> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken;
    }

    try {
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: this.username,
          Password: this.password,
          CustomerCode: this.customerCode
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed! status: ${response.status}`);
      }

      const authData = await response.json();
      this.authToken = authData.access_token || authData.token || authData.AccessToken;
      
      // Set token expiry to 1 hour from now (typical JWT expiry)
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      
      if (!this.authToken) {
        throw new Error('No access token received from authentication');
      }
      
      return this.authToken;
    } catch (error) {
      console.error('Amrod authentication failed:', error);
      throw error;
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized, clear token and retry once
        if (response.status === 401 && this.authToken) {
          this.authToken = null;
          this.tokenExpiry = null;
          const newToken = await this.authenticate();
          
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Amrod API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getProducts(page = 1, limit = 100): Promise<{ products: AmrodProduct[]; total: number; hasMore: boolean }> {
    try {
      const response = await this.makeRequest<any>(`/products/GetAll`);
      
      const products: AmrodProduct[] = response?.map((item: any) => ({
        id: item.SimpleCode || item.FullCode || item.id,
        name: item.Name || item.name,
        description: item.Description || item.LongDescription || '',
        price: parseFloat(item.Price || item.UnitPrice || '0'),
        category: item.Category || item.CategoryName || 'Uncategorized',
        brand: item.Brand || item.BrandName || '',
        images: item.Images || [item.Image].filter(Boolean) || [],
        variants: item.Variants || [],
        brandingOptions: item.BrandingOptions || [],
        specifications: item.Specifications || {},
        minimumOrder: parseInt(item.MinimumOrderQuantity || item.MOQ || '1')
      })) || [];

      // Simple pagination for large datasets
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        total: products.length,
        hasMore: endIndex < products.length
      };
    } catch (error) {
      console.error('Failed to fetch products from Amrod API:', error);
      return { products: [], total: 0, hasMore: false };
    }
  }

  async getProduct(id: string): Promise<AmrodProduct | null> {
    try {
      return await this.makeRequest<AmrodProduct>(`/products/${id}`);
    } catch (error) {
      console.error(`Failed to fetch product ${id} from Amrod API:`, error);
      return null;
    }
  }

  async getCategories(): Promise<AmrodCategory[]> {
    try {
      const response = await this.makeRequest<any>('/categories/GetAll');
      return response?.map((item: any) => ({
        id: item.CategoryCode || item.id,
        name: item.CategoryName || item.name,
        description: item.Description || '',
        parentId: item.ParentCategoryCode || item.parentId
      })) || [];
    } catch (error) {
      console.error('Failed to fetch categories from Amrod API:', error);
      return [];
    }
  }

  async getBrandingMethods(): Promise<AmrodBrandingMethod[]> {
    try {
      const response = await this.makeRequest<any>('/branding/GetAll');
      return response?.map((item: any) => ({
        id: item.BrandingCode || item.id,
        name: item.BrandingMethodName || item.name,
        description: item.Description || '',
        baseCost: parseFloat(item.BaseCost || '0'),
        colorUpcharge: parseFloat(item.ColorUpcharge || '0'),
        setupFee: parseFloat(item.SetupFee || '0'),
        minimumQuantity: parseInt(item.MinimumQuantity || '1')
      })) || [];
    } catch (error) {
      console.error('Failed to fetch branding methods from Amrod API:', error);
      return [];
    }
  }

  async getProductStock(productId: string): Promise<{ [variant: string]: number }> {
    try {
      const data = await this.makeRequest<{ stock: { [variant: string]: number } }>(`/products/${productId}/stock`);
      return data.stock || {};
    } catch (error) {
      console.error(`Failed to fetch stock for product ${productId}:`, error);
      return {};
    }
  }

  async getBrandingPricing(productId: string, brandingMethodId: string): Promise<{ baseCost: number; colorUpcharge: number; setupFee: number } | null> {
    try {
      const data = await this.makeRequest<any>(`/products/${productId}/branding/${brandingMethodId}/pricing`);
      return {
        baseCost: data.baseCost || 0,
        colorUpcharge: data.colorUpcharge || 0,
        setupFee: data.setupFee || 0
      };
    } catch (error) {
      console.error(`Failed to fetch branding pricing for product ${productId}, method ${brandingMethodId}:`, error);
      return null;
    }
  }
}

export const amrodApi = new AmrodApiService();
