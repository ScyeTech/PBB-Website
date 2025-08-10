import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  inStock: boolean;
  search: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ProductFilters({ filters, onFiltersChange, isOpen, onToggle }: ProductFiltersProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const brands = [
    "Andy Cartwright", "Altitude", "Alex Varga", "Biz Collection",
    "Slazenger", "US Basic", "Kooshty", "Okiyo", "Swiss Cougar"
  ];

  const colors = [
    "Black", "White", "Navy", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Grey"
  ];

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 1000 },
      colors: [],
      inStock: false,
      search: ""
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    return count;
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      updateFilters({ categories: [...filters.categories, categoryId] });
    } else {
      updateFilters({ categories: filters.categories.filter(id => id !== categoryId) });
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      updateFilters({ brands: [...filters.brands, brand] });
    } else {
      updateFilters({ brands: filters.brands.filter(b => b !== brand) });
    }
  };

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      updateFilters({ colors: [...filters.colors, color] });
    } else {
      updateFilters({ colors: filters.colors.filter(c => c !== color) });
    }
  };

  if (!isOpen) {
    return (
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full mb-4"
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
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Filters</CardTitle>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Products</Label>
          <Input
            id="search"
            placeholder="Search by name or description..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <Label className="text-sm font-semibold">Categories</Label>
          <div className="space-y-2 mt-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label htmlFor={`category-${category.id}`} className="text-sm">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Brands */}
        <div>
          <Label className="text-sm font-semibold">Brands</Label>
          <div className="space-y-2 mt-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-sm font-semibold">Price Range (R)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label htmlFor="min-price" className="text-xs">Min</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={filters.priceRange.min || ''}
                onChange={(e) => updateFilters({
                  priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-xs">Max</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="1000"
                value={filters.priceRange.max || ''}
                onChange={(e) => updateFilters({
                  priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 1000 }
                })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div>
          <Label className="text-sm font-semibold">Colors</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={filters.colors.includes(color)}
                  onCheckedChange={(checked) => 
                    handleColorChange(color, checked as boolean)
                  }
                />
                <Label htmlFor={`color-${color}`} className="text-sm">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stock Availability */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilters({ inStock: checked as boolean })}
          />
          <Label htmlFor="in-stock" className="text-sm">
            In Stock Only
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
