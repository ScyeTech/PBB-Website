import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, ShoppingCart, User, Heart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { name: "Corporate Clothing", icon: "fas fa-tshirt", path: "/products?category=corporate-clothing" },
  { name: "Corporate Gifts", icon: "fas fa-gift", path: "/products?category=corporate-gifts" },
  { name: "Workwear", icon: "fas fa-hard-hat", path: "/products?category=workwear" },
  { name: "Headwear", icon: "fas fa-hat-cowboy", path: "/products?category=headwear" },
  { name: "Display & Signage", icon: "fas fa-flag", path: "/products?category=display" },
  { name: "Custom Products", icon: "fas fa-cogs", path: "/products?category=custom" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm text-neutral-600 border-b border-neutral-200">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              +267 318 0123
            </span>
            <span className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              info@professionalbrandingbw.com
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/help" className="hover:text-primary">Help Center</Link>
            <Link href="/register" className="hover:text-primary">Trade Registration</Link>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary mr-8">
              Professional Branding BW
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative hidden lg:block">
              <button
                className="flex items-center px-4 py-2 text-neutral-700 hover:text-primary font-medium"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <Menu className="w-4 h-4 mr-2" />
                All Categories
                <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
              
              {isCategoriesOpen && (
                <div 
                  className="absolute top-full left-0 w-64 bg-white shadow-lg border border-neutral-200 z-10"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.path}
                      className="block px-4 py-3 hover:bg-neutral-50 border-b border-neutral-200"
                    >
                      <i className={`${category.icon} w-5 mr-3 text-primary`}></i>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Button
                type="submit"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-1 rounded text-sm hover:bg-primary-dark"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Account & Cart */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/account" className="flex items-center text-neutral-700 hover:text-primary">
                <User className="w-4 h-4 mr-2" />
                Account
              </Link>
              <Link href="/wishlist" className="flex items-center text-neutral-700 hover:text-primary">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Link>
            </div>
            <Link href="/cart" className="flex items-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-light relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span>Cart</span>
              {cartCount > 0 && (
                <Badge className="ml-2 bg-white text-accent px-2 py-1 rounded-full text-xs font-bold">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
