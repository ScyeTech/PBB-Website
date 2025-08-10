import { Link } from "wouter";
import { UserPlus, Play, ArrowRight, Calculator, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandingCalculator } from "@/components/branding/branding-calculator";
import { ProductCard } from "@/components/product/product-card";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', { limit: 4 }],
  });

  const categories = [
    {
      name: "Corporate Clothing",
      description: "Professional apparel for corporate branding",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=corporate-clothing"
    },
    {
      name: "Corporate Gifts",
      description: "Premium gifts for client relationships",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=corporate-gifts"
    },
    {
      name: "Workwear",
      description: "Professional safety and industrial clothing",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=workwear"
    },
    {
      name: "Headwear",
      description: "Caps, hats, and promotional headwear",
      image: "https://images.unsplash.com/photo-1588117472013-59bb13edafec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=headwear"
    },
    {
      name: "Display & Signage",
      description: "Banners, flags, and display solutions",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=display"
    },
    {
      name: "Custom Products",
      description: "Bespoke solutions for unique requirements",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      path: "/products?category=custom"
    }
  ];

  const brandPartners = [
    "Andy Cartwright", "Altitude", "Alex Varga", "Biz Collection",
    "Slazenger", "US Basic", "Kooshty", "Okiyo", "Swiss Cougar",
    "Cutter & Buck", "Eva & Elm", "Gary Player"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&h=600')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Branding <br />
              <span className="text-yellow-300">Botswana</span> - Your Partner
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Based in Gaborone, we're your trade-only supplier for corporate clothing, gifts, and promotional items. 
              Quality branding solutions for businesses across Botswana and Southern Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-accent hover:bg-accent-light text-white px-8 py-4 text-lg">
                <Link href="/register">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register as Reseller
                </Link>
              </Button>
              <Button variant="secondary" className="px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Overview
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Browse Our Product Categories</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover our comprehensive range of high-quality promotional products designed to meet all your branding needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.name} href={category.path}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl shadow-lg bg-white">
                    <img 
                      src={category.image}
                      alt={category.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90 mb-3">{category.description}</p>
                      <span className="inline-flex items-center text-yellow-300 font-medium">
                        View Products <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Branding Section */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">In-House Branding Solutions</h2>
              <p className="text-lg text-neutral-600 mb-6">
                With industry-leading turnaround times and large capacity across all departments, we provide clients with the ease, convenience, and cost-savings of purchasing and branding products at one point.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  { name: "Screen Printing", desc: "High-quality screen printing for large volume orders" },
                  { name: "Embroidery", desc: "Professional embroidery services for premium finishes" },
                  { name: "Digital Printing", desc: "Full-color digital printing for complex designs" },
                  { name: "Laser Engraving", desc: "Precision engraving for corporate gifts and awards" }
                ].map((service) => (
                  <div key={service.name} className="flex items-start">
                    <CheckCircle className="text-accent mt-1 mr-3 w-5 h-5" />
                    <div>
                      <h4 className="font-semibold text-neutral-900">{service.name}</h4>
                      <p className="text-neutral-600">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button asChild className="bg-primary hover:bg-primary-dark text-white">
                <Link href="#branding-calculator">
                  <Calculator className="w-4 h-4 mr-2" />
                  Try Branding Calculator
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Professional branding equipment"
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Embroidery process"
                className="rounded-lg shadow-lg w-full h-48 object-cover mt-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Branded promotional samples"
                className="rounded-lg shadow-lg w-full h-48 object-cover -mt-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Screen printing process"
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Featured Products</h2>
            <p className="text-lg text-neutral-600">Discover our most popular promotional products trusted by businesses across South Africa</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild className="bg-accent hover:bg-accent-light text-white">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Partners */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Trusted Brand Partners</h2>
            <p className="text-lg text-neutral-600">We represent leading international and local brands in promotional products</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {brandPartners.map((brand) => (
              <div key={brand} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-lg font-bold text-neutral-400 text-center">{brand}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branding Calculator */}
      <section id="branding-calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Branding Calculator</h2>
            <p className="text-lg text-neutral-600">Calculate your branding costs in real-time</p>
          </div>
          
          <BrandingCalculator />
        </div>
      </section>

      {/* Reseller Registration */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Become a Reseller</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join South Africa's largest promotional products network. As a strictly trade-only supplier, 
              we work exclusively with registered resellers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Meet Requirements",
                description: "Ensure you qualify as a promotional products reseller. We only supply companies buying for resale purposes, not end users."
              },
              {
                step: "2", 
                title: "Complete Registration",
                description: "Gather necessary documents and complete our online registration form. We'll verify your qualification as a reseller."
              },
              {
                step: "3",
                title: "Pay Registration Fee", 
                description: "Once approved, pay a once-off administration fee. Receive a complimentary welcome pack with branded samples for your clients."
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-blue-100 mb-4">{item.description}</p>
                <Button variant="secondary" size="sm">
                  {item.step === "1" && <><Play className="w-4 h-4 mr-2" />Watch Video</>}
                  {item.step === "2" && <><UserPlus className="w-4 h-4 mr-2" />Register Now</>}
                  {item.step === "3" && <>Learn More</>}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-accent hover:bg-accent-light text-white w-14 h-14 rounded-full shadow-lg">
          <i className="fas fa-comment text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
