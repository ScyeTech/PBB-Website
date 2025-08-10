import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold text-white mb-4">Professional Branding BW</div>
            <p className="text-neutral-300 mb-4">
              Botswana's premier promotional products supplier based in Gaborone, serving trade customers with quality products and professional branding solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Product Categories</h4>
            <ul className="space-y-2 text-neutral-300">
              <li><Link href="/products?category=corporate-clothing" className="hover:text-white">Corporate Clothing</Link></li>
              <li><Link href="/products?category=corporate-gifts" className="hover:text-white">Corporate Gifts</Link></li>
              <li><Link href="/products?category=workwear" className="hover:text-white">Workwear</Link></li>
              <li><Link href="/products?category=headwear" className="hover:text-white">Headwear</Link></li>
              <li><Link href="/products?category=display" className="hover:text-white">Display & Signage</Link></li>
              <li><Link href="/products?category=custom" className="hover:text-white">Custom Products</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-neutral-300">
              <li><Link href="/services/screen-printing" className="hover:text-white">Screen Printing</Link></li>
              <li><Link href="/services/embroidery" className="hover:text-white">Embroidery</Link></li>
              <li><Link href="/services/digital-printing" className="hover:text-white">Digital Printing</Link></li>
              <li><Link href="/services/laser-engraving" className="hover:text-white">Laser Engraving</Link></li>
              <li><Link href="/calculator" className="hover:text-white">Branding Calculator</Link></li>
              <li><Link href="/quotes" className="hover:text-white">Quote Requests</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-neutral-300">
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3" />
                +267 318 0123
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                info@professionalbrandingbw.com
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-3" />
                Gaborone, Botswana
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-3" />
                Mon-Fri: 8:00 AM - 5:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm">
              © 2024 PromoSource. All rights reserved. Trade-only supplier.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/trade-terms" className="text-neutral-400 hover:text-white text-sm">Trade Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
