import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Minus, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandingCalculator } from "@/components/branding/branding-calculator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID');
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!productId,
  });

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Color Required",
        description: "Please select a color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size Required", 
        description: "Please select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    if (quantity < (product.minimumOrder || 1)) {
      toast({
        title: "Minimum Order",
        description: `Minimum order quantity is ${product.minimumOrder || 1} units`,
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        quantity,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
        brandingMethod: null,
        brandingColors: 1,
        customBranding: null,
        unitPrice: product.basePrice,
        brandingCost: "0",
      });

      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Product Not Found</h2>
          <p className="text-neutral-600 mb-4">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"];

  const price = parseFloat(product.basePrice);
  const vatAmount = price * 0.15;
  const totalPrice = price + vatAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span>/</span>
        <span className="text-neutral-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-sm"
            />
            {(product.stockCount || 0) <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-neutral-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {product.brand && (
              <Badge variant="outline" className="mb-4">
                {product.brand}
              </Badge>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-primary">
                R {price.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-500">
                <div>+ R {vatAmount.toFixed(2)} VAT</div>
                <div className="font-semibold">R {totalPrice.toFixed(2)} inc VAT</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className={`${(product.stockCount || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(product.stockCount || 0) > 0 ? `In Stock: ${product.stockCount || 0}+` : 'Out of Stock'}
              </span>
              <span className="text-neutral-500">Min Order: {product.minimumOrder || 1}</span>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-neutral-600">{product.description}</p>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {quantity < (product.minimumOrder || 1) && (
              <p className="text-sm text-red-600 mt-1">
                Minimum order quantity is {product.minimumOrder || 1}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-accent hover:bg-accent-light text-white py-3"
              disabled={(product.stockCount || 0) <= 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            
            <Button
              variant="outline"
              className="w-full py-3"
            >
              <FileText className="w-4 h-4 mr-2" />
              Request Quote
            </Button>
          </div>

          {/* Total Cost Display */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Unit Price (ex VAT):</span>
                  <span>R {price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Subtotal (ex VAT):</span>
                  <span>R {(price * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>VAT (15%):</span>
                  <span>R {(price * quantity * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total (inc VAT):</span>
                  <span>R {(price * quantity * 1.15).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="specifications" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="branding">Branding Options</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="font-semibold text-neutral-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </dt>
                      <dd className="text-neutral-600 mt-1">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-neutral-600">No detailed specifications available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Options</CardTitle>
            </CardHeader>
            <CardContent>
              {product.brandingOptions && product.brandingOptions.length > 0 ? (
                <div className="space-y-4">
                  {product.brandingOptions.map((option: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{option.method || `Option ${index + 1}`}</h4>
                      {option.cost && (
                        <p className="text-sm text-neutral-600">
                          Cost: R {option.cost} per unit
                        </p>
                      )}
                      {option.setupFee && (
                        <p className="text-sm text-neutral-600">
                          Setup Fee: R {option.setupFee}
                        </p>
                      )}
                      {option.minimumQuantity && (
                        <p className="text-sm text-neutral-600">
                          Minimum Quantity: {option.minimumQuantity}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600">
                  Branding options available. Contact us for detailed pricing and specifications.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Returns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Shipping Information</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Standard delivery: 3-5 business days</li>
                  <li>• Express delivery: 1-2 business days (additional cost)</li>
                  <li>• Free shipping on orders over R 2,500</li>
                  <li>• Delivery nationwide across South Africa</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Returns Policy</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• 30-day return policy for unbranded items</li>
                  <li>• Custom branded items cannot be returned unless faulty</li>
                  <li>• Items must be in original condition</li>
                  <li>• Return shipping costs apply unless item is faulty</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Branding Calculator */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Calculate Branding Cost</h2>
        <BrandingCalculator productId={product.id} />
      </div>
    </div>
  );
}
