import { useState, useEffect } from "react";
import { Calculator, ShoppingCart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product, BrandingMethod } from "@shared/schema";

interface BrandingCalculatorProps {
  productId?: string;
  onAddToCart?: () => void;
  onRequestQuote?: () => void;
}

interface CalculationResult {
  productCost: number;
  brandingCost: number;
  setupFee: number;
  subtotal: number;
  vat: number;
  total: number;
  perUnit: number;
}

export function BrandingCalculator({ productId, onAddToCart, onRequestQuote }: BrandingCalculatorProps) {
  const [selectedProductId, setSelectedProductId] = useState(productId || "");
  const [quantity, setQuantity] = useState(50);
  const [selectedBrandingMethod, setSelectedBrandingMethod] = useState("");
  const [colors, setColors] = useState(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: brandingMethods = [] } = useQuery<BrandingMethod[]>({
    queryKey: ['/api/branding-methods'],
  });

  const calculateMutation = useMutation({
    mutationFn: async (params: {
      productId: string;
      quantity: number;
      brandingMethodId: string;
      colors: number;
    }) => {
      const response = await fetch('/api/branding/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
    onSuccess: (result) => {
      setCalculation(result);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate branding cost",
        variant: "destructive",
      });
    },
  });

  // Auto-calculate when parameters change
  useEffect(() => {
    if (selectedProductId && selectedBrandingMethod && quantity > 0) {
      calculateMutation.mutate({
        productId: selectedProductId,
        quantity,
        brandingMethodId: selectedBrandingMethod,
        colors,
      });
    }
  }, [selectedProductId, quantity, selectedBrandingMethod, colors]);

  const selectedProduct = Array.isArray(products) ? products.find(p => p.id === selectedProductId) : undefined;
  const selectedMethod = Array.isArray(brandingMethods) ? brandingMethods.find(m => m.id === selectedBrandingMethod) : undefined;

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedMethod || !calculation) return;

    try {
      await addToCart({
        productId: selectedProduct.id,
        quantity,
        selectedColor: null,
        selectedSize: null,
        brandingMethod: selectedMethod.id,
        brandingColors: colors,
        customBranding: null,
        unitPrice: selectedProduct.basePrice,
        brandingCost: (calculation.brandingCost / quantity).toString(),
      });

      toast({
        title: "Added to Cart",
        description: `${quantity} x ${selectedProduct.name} added to cart`,
      });

      onAddToCart?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Branding Calculator
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R {parseFloat(product.basePrice).toFixed(2)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      No products available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="branding-method">Branding Method</Label>
              <Select value={selectedBrandingMethod} onValueChange={setSelectedBrandingMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branding method" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(brandingMethods) && brandingMethods.length > 0 ? (
                    brandingMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} - R {parseFloat(method.baseCost).toFixed(2)} per unit
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-methods" disabled>
                      No branding methods available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="colors">Number of Colors</Label>
              <Select value={colors.toString()} onValueChange={(value) => setColors(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Color</SelectItem>
                  <SelectItem value="2">2 Colors</SelectItem>
                  <SelectItem value="3">3 Colors</SelectItem>
                  <SelectItem value="4">Full Color</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedMethod && selectedMethod.setupFee && (
              <div className="text-sm text-neutral-600">
                <p>Setup Fee: R {parseFloat(selectedMethod.setupFee || '0').toFixed(2)} (one-time)</p>
                <p>Minimum Quantity: {selectedMethod.minimumQuantity || 1}</p>
              </div>
            )}
          </div>

          {/* Calculator Results */}
          <div>
            {calculation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      Product Cost ({quantity} × R {selectedProduct ? parseFloat(selectedProduct.basePrice).toFixed(2) : '0.00'})
                    </span>
                    <span className="font-semibold">R {calculation.productCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      Branding Cost ({quantity} × R {selectedMethod ? parseFloat(selectedMethod.baseCost).toFixed(2) : '0.00'})
                    </span>
                    <span className="font-semibold">R {calculation.brandingCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Setup Fee</span>
                    <span className="font-semibold">R {calculation.setupFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Subtotal (ex VAT)</span>
                    <span className="font-bold text-primary">R {calculation.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>VAT (15%)</span>
                    <span>R {calculation.vat.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total (inc VAT)</span>
                    <span>R {calculation.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-sm text-neutral-500 text-center">
                    R {calculation.perUnit.toFixed(2)} per unit (inc VAT)
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-accent hover:bg-accent-light text-white"
                      disabled={!calculation}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button
                      onClick={onRequestQuote}
                      className="w-full bg-primary hover:bg-primary-dark text-white"
                      disabled={!calculation}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Request Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 text-neutral-500">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select product and branding options to calculate cost</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
