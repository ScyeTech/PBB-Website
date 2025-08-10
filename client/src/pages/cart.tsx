import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Cart() {
  const { items, updateCartItem, removeFromCart, clearCart, getCartTotal, isLoading } = useCart();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  // Fetch product details for cart items
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: items.length > 0,
  });

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const cartSubtotal = getCartTotal();
  const vatAmount = cartSubtotal * 0.15;
  const cartTotal = cartSubtotal + vatAmount;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
          <p className="text-neutral-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild className="bg-primary hover:bg-primary-dark">
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Shopping Cart</h1>
          <p className="text-neutral-600">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          {items.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearCart}
              disabled={isClearing}
            >
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = getProductDetails(item.productId);
            const unitPrice = parseFloat(item.unitPrice);
            const brandingCost = parseFloat(item.brandingCost || '0');
            const totalItemPrice = (unitPrice + brandingCost) * item.quantity;

            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={product?.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                        alt={product?.name || "Product"}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-neutral-900 line-clamp-2">
                            {product?.name || 'Product'}
                          </h3>
                          {product?.brand && (
                            <Badge variant="outline" className="mt-1">
                              {product.brand}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Variants */}
                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-neutral-600">
                        {item.selectedColor && (
                          <span>Color: {item.selectedColor}</span>
                        )}
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                        {item.brandingMethod && (
                          <span>Branding: Yes</span>
                        )}
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg">R {totalItemPrice.toFixed(2)}</div>
                          <div className="text-sm text-neutral-600">
                            R {(unitPrice + brandingCost).toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      {brandingCost > 0 && (
                        <div className="mt-2 text-xs text-neutral-500">
                          Product: R {unitPrice.toFixed(2)} + Branding: R {brandingCost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>R {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>VAT (15%)</span>
                  <span>R {vatAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>R {cartTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full bg-accent hover:bg-accent-light">
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>
              </div>

              {/* Trade Notice */}
              <div className="text-xs text-neutral-500 text-center p-3 bg-neutral-50 rounded-lg">
                <p className="font-semibold mb-1">Trade Only</p>
                <p>Prices shown exclude VAT. You must be a registered reseller to purchase.</p>
              </div>

              {/* Shipping Info */}
              <div className="text-sm text-neutral-600 space-y-1">
                <div className="flex justify-between">
                  <span>Estimated delivery:</span>
                  <span>3-5 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Free shipping:</span>
                  <span className={cartTotal >= 2500 ? "text-green-600" : ""}>
                    {cartTotal >= 2500 ? "✓ Qualified" : "on orders over R 2,500"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
