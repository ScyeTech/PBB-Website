import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Building2, User, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

const checkoutSchema = z.object({
  // Customer Details
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Phone number is required"),
  companyName: z.string().min(2, "Company name is required"),
  
  // Billing Address
  billingAddress: z.string().min(5, "Address is required"),
  billingCity: z.string().min(2, "City is required"),
  billingPostalCode: z.string().min(4, "Postal code is required"),
  billingProvince: z.string().min(1, "Province is required"),
  
  // Shipping Address
  sameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingProvince: z.string().optional(),
  
  // Order Details
  orderType: z.enum(["purchase", "quote"]),
  notes: z.string().optional(),
  
  // Terms
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsBilling: true,
      orderType: "quote",
      acceptTerms: false,
    },
  });

  const sameAsBilling = form.watch("sameAsBilling");
  
  // Fetch product details for cart items
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: items.length > 0,
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          brandingCost: parseFloat(item.brandingCost || '0'),
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          brandingMethod: item.brandingMethod,
          customBranding: item.customBranding,
        };
      });

      if (data.orderType === "quote") {
        // Submit quote request
        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            companyName: data.companyName,
            items: orderItems,
            totalAmount: getCartTotal() * 1.15, // Include VAT
            notes: data.notes || '',
          }),
        });

        if (!response.ok) throw new Error('Failed to submit quote request');
        return response.json();
      } else {
        // This would integrate with actual payment processing
        throw new Error('Direct purchases not yet implemented');
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: form.getValues("orderType") === "quote" 
          ? "Your quote request has been submitted successfully" 
          : "Your order has been placed successfully",
      });
      clearCart();
      setStep(4); // Success step
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    submitOrderMutation.mutate(data);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate customer details
      const fields = ['customerName', 'customerEmail', 'customerPhone', 'companyName'] as const;
      const hasErrors = fields.some(field => {
        const error = form.formState.errors[field];
        return error !== undefined;
      });
      
      if (hasErrors) {
        fields.forEach(field => form.trigger(field));
        return;
      }
    } else if (step === 2) {
      // Validate addresses
      const billingFields = ['billingAddress', 'billingCity', 'billingPostalCode', 'billingProvince'] as const;
      const hasErrors = billingFields.some(field => {
        const error = form.formState.errors[field];
        return error !== undefined;
      });
      
      if (hasErrors) {
        billingFields.forEach(field => form.trigger(field));
        return;
      }
      
      if (!sameAsBilling) {
        const shippingFields = ['shippingAddress', 'shippingCity', 'shippingPostalCode', 'shippingProvince'] as const;
        const hasShippingErrors = shippingFields.some(field => {
          const error = form.formState.errors[field];
          return error !== undefined;
        });
        
        if (hasShippingErrors) {
          shippingFields.forEach(field => form.trigger(field));
          return;
        }
      }
    }
    
    setStep(step + 1);
  };

  const cartSubtotal = getCartTotal();
  const vatAmount = cartSubtotal * 0.15;
  const cartTotal = cartSubtotal + vatAmount;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
          <p className="text-neutral-600 mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quote Request Submitted!</h2>
          <p className="text-neutral-600 mb-6">
            Thank you for your quote request. We'll review your requirements and get back to you within 24 hours with a detailed quotation.
          </p>
          <div className="space-y-3">
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Checkout</h1>
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 ${
                  step >= stepNumber ? 'text-neutral-900' : 'text-neutral-500'
                }`}>
                  {stepNumber === 1 && 'Details'}
                  {stepNumber === 2 && 'Address'}
                  {stepNumber === 3 && 'Review'}
                </span>
                {stepNumber < 3 && <div className="w-8 h-px bg-neutral-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Steps */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Ltd" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 11 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" onClick={nextStep}>
                        Next: Address Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Billing Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="billingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="billingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Johannesburg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="billingProvince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select province" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gauteng">Gauteng</SelectItem>
                                  <SelectItem value="western-cape">Western Cape</SelectItem>
                                  <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                                  <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                                  <SelectItem value="free-state">Free State</SelectItem>
                                  <SelectItem value="limpopo">Limpopo</SelectItem>
                                  <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                                  <SelectItem value="north-west">North West</SelectItem>
                                  <SelectItem value="northern-cape">Northern Cape</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="billingPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="2000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Address Toggle */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="sameAsBilling"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Same as billing address
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {!sameAsBilling && (
                        <div className="mt-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="shippingAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main Street" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="shippingCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Johannesburg" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingProvince"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Province</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select province" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="gauteng">Gauteng</SelectItem>
                                      <SelectItem value="western-cape">Western Cape</SelectItem>
                                      <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                                      <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                                      <SelectItem value="free-state">Free State</SelectItem>
                                      <SelectItem value="limpopo">Limpopo</SelectItem>
                                      <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                                      <SelectItem value="north-west">North West</SelectItem>
                                      <SelectItem value="northern-cape">Northern Cape</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingPostalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="2000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Next: Review Order
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Order Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="orderType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-4"
                              >
                                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                  <RadioGroupItem value="quote" id="quote" />
                                  <div className="space-y-1">
                                    <label htmlFor="quote" className="font-medium cursor-pointer">
                                      Request Quote (Recommended)
                                    </label>
                                    <p className="text-sm text-neutral-600">
                                      Get a detailed quote with final pricing, delivery times, and payment terms
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                                  <RadioGroupItem value="purchase" id="purchase" disabled />
                                  <div className="space-y-1">
                                    <label htmlFor="purchase" className="font-medium cursor-pointer">
                                      Direct Purchase (Coming Soon)
                                    </label>
                                    <p className="text-sm text-neutral-600">
                                      Pay online and place order immediately
                                    </p>
                                  </div>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Special Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special requirements, branding instructions, or delivery preferences..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Terms */}
                  <Card>
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              I accept the{" "}
                              <Link href="/terms" className="text-primary hover:underline">
                                Terms and Conditions
                              </Link>{" "}
                              and{" "}
                              <Link href="/trade-terms" className="text-primary hover:underline">
                                Trade Terms
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-accent hover:bg-accent-light"
                      disabled={submitOrderMutation.isPending}
                    >
                      {submitOrderMutation.isPending ? 'Submitting...' : 'Submit Quote Request'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      const unitPrice = parseFloat(item.unitPrice);
                      const brandingCost = parseFloat(item.brandingCost || '0');
                      const totalItemPrice = (unitPrice + brandingCost) * item.quantity;

                      return (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium line-clamp-2">
                              {product?.name || 'Product'}
                            </p>
                            <div className="text-neutral-600 text-xs">
                              Qty: {item.quantity}
                              {item.selectedColor && ` • ${item.selectedColor}`}
                              {item.selectedSize && ` • ${item.selectedSize}`}
                            </div>
                          </div>
                          <span className="font-medium ml-2">
                            R {totalItemPrice.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R {cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>VAT (15%)</span>
                      <span>R {vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Trade Notice */}
                  <div className="text-xs text-neutral-500 p-3 bg-neutral-50 rounded-lg">
                    <p className="font-semibold mb-1">Trade Only Pricing</p>
                    <p>Final pricing subject to quote approval and trade verification.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
