import { Link } from "wouter";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
  const price = parseFloat(product.basePrice);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative overflow-hidden rounded-t-lg">
        <Link href={`/product/${product.id}`}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {(product.stockCount || 0) > 100 && (
          <Badge className="absolute top-2 right-2 bg-accent text-white">
            Popular
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-neutral-900 mb-2 hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary">
              R {price.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 ml-1">ex VAT</span>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-neutral-500 flex justify-between">
          <span>Stock: {product.stockCount || 0}+</span>
          <span>Min: {product.minimumOrder || 1} units</span>
        </div>
        
        {product.brand && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
