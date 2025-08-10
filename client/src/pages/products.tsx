import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  inStock: boolean;
  search: string;
}

export default function Products() {
  const [location] = useLocation();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000 },
    colors: [],
    inStock: false,
    search: ""
  });

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const search = params.get('search');
    const brand = params.get('brand');

    if (category || search || brand) {
      setFilters(prev => ({
        ...prev,
        categories: category ? [category] : prev.categories,
        search: search || prev.search,
        brands: brand ? [brand] : prev.brands
      }));
    }
  }, [location]);

  // Build query parameters
  const queryParams = {
    category: filters.categories[0],
    search: filters.search,
    brand: filters.brands[0],
    page: currentPage,
    limit: 20
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/products', queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryParams.category) params.append('category', queryParams.category);
      if (queryParams.search) params.append('search', queryParams.search);
      if (queryParams.brand) params.append('brand', queryParams.brand);
      params.append('page', queryParams.page.toString());
      params.append('limit', queryParams.limit.toString());

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Filter products on frontend for additional filters
  const filteredProducts = data?.products?.filter((product: Product) => {
    // Price range filter
    const price = parseFloat(product.basePrice);
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    // Stock filter
    if (filters.inStock && (product.stockCount || 0) <= 0) {
      return false;
    }

    // Color filter
    if (filters.colors.length > 0) {
      const hasMatchingColor = product.colors?.some(color => 
        filters.colors.includes(color)
      );
      if (!hasMatchingColor) return false;
    }

    // Additional brand filter (if multiple selected)
    if (filters.brands.length > 1) {
      if (!product.brand || !filters.brands.includes(product.brand)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.basePrice) - parseFloat(b.basePrice);
      case 'price-high':
        return parseFloat(b.basePrice) - parseFloat(a.basePrice);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return b.stockCount - a.stockCount;
      default:
        return 0;
    }
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    return count;
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Error Loading Products</h2>
          <p className="text-neutral-600">Sorry, we couldn't load the products. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Products</h1>
        <p className="text-neutral-600">
          Discover our comprehensive range of promotional products and corporate gifts
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFiltersOpen || window.innerWidth >= 1024}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
          />
        </div>

        {/* Products Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                {isLoading ? 'Loading...' : `${sortedProducts.length} products`}
              </span>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary">
                  {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="stock">Stock Level</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex items-center border border-neutral-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600 mb-4">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button onClick={() => setFilters({
                categories: [],
                brands: [],
                priceRange: { min: 0, max: 1000 },
                colors: [],
                inStock: false,
                search: ""
              })}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {data?.hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} variant="outline">
                    Load More Products
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
