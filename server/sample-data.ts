// Sample data to populate the application while API integration is being set up
import type { Product, Category, BrandingMethod } from "@shared/schema";

export const sampleCategories: Category[] = [
  {
    id: "cat-1",
    name: "Apparel",
    description: "T-shirts, polos, jackets and clothing items",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    parentId: null,
    sortOrder: 1,
  },
  {
    id: "cat-2", 
    name: "Bags & Travel",
    description: "Branded bags, backpacks, and travel accessories",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    parentId: null,
    sortOrder: 2,
  },
  {
    id: "cat-3",
    name: "Drinkware",
    description: "Mugs, bottles, tumblers and drinkware",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
    parentId: null,
    sortOrder: 3,
  },
  {
    id: "cat-4",
    name: "Technology",
    description: "Power banks, USB drives, tech accessories",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400",
    parentId: null,
    sortOrder: 4,
  },
  {
    id: "cat-5",
    name: "Stationery",
    description: "Pens, notebooks, desk accessories",
    imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400",
    parentId: null,
    sortOrder: 5,
  },
];

export const sampleBrandingMethods: BrandingMethod[] = [
  {
    id: "brand-1",
    name: "Screen Print",
    description: "Traditional screen printing for vibrant colors",
    baseCost: "12.50",
    colorUpcharge: "3.50",
    setupFee: "65.00",
    minimumQuantity: 50,
  },
  {
    id: "brand-2", 
    name: "Embroidery",
    description: "Premium embroidered finish",
    baseCost: "18.00",
    colorUpcharge: "0.00",
    setupFee: "120.00",
    minimumQuantity: 25,
  },
  {
    id: "brand-3",
    name: "Digital Print",
    description: "Full color digital printing",
    baseCost: "8.50",
    colorUpcharge: "0.00",
    setupFee: "45.00",
    minimumQuantity: 25,
  },
  {
    id: "brand-4",
    name: "Laser Engraving",
    description: "Precise laser engraving for premium look",
    baseCost: "15.00",
    colorUpcharge: "0.00",
    setupFee: "85.00",
    minimumQuantity: 25,
  },
];

export const sampleProducts: Product[] = [
  {
    id: "prod-1",
    name: "Classic Cotton T-Shirt",
    description: "100% cotton heavyweight t-shirt. Perfect for screen printing and embroidery. Available in multiple colors.",
    basePrice: "89.50",
    category: "Apparel",
    brand: "Gildan",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400"
    ],
    colors: ["White", "Black", "Navy", "Red", "Grey", "Royal Blue"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    stockCount: 850,
    brandingOptions: [
      { method: "screen-print", cost: 12.50, setupFee: 65, minimumQuantity: 50 },
      { method: "embroidery", cost: 18, setupFee: 120, minimumQuantity: 25 }
    ],
    specifications: {
      fabric: "100% Cotton",
      weight: "185gsm",
      fit: "Regular"
    },
    minimumOrder: 25,
    isActive: true,
    lastUpdated: new Date(),
  },
  {
    id: "prod-2",
    name: "Premium Polo Shirt",
    description: "65/35 poly cotton pique polo with three button placket and side vents.",
    basePrice: "125.00",
    category: "Apparel", 
    brand: "Port Authority",
    images: [
      "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400"
    ],
    colors: ["White", "Black", "Navy", "Red", "Khaki"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    stockCount: 420,
    brandingOptions: [
      { method: "embroidery", cost: 18, setupFee: 120, minimumQuantity: 25 },
      { method: "screen-print", cost: 12.50, setupFee: 65, minimumQuantity: 50 }
    ],
    specifications: {
      fabric: "65% Polyester / 35% Cotton",
      weight: "210gsm"
    },
    minimumOrder: 25,
    isActive: true,
    lastUpdated: new Date(),
  },
  {
    id: "prod-3",
    name: "Insulated Travel Mug",
    description: "16oz double wall stainless steel travel mug with spill-proof lid.",
    basePrice: "145.00",
    category: "Drinkware",
    brand: "RTIC",
    images: [
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    ],
    colors: ["Stainless Steel", "Black", "White", "Blue", "Red"],
    sizes: ["16oz"],
    stockCount: 275,
    brandingOptions: [
      { method: "laser-engraving", cost: 15, setupFee: 85, minimumQuantity: 25 },
      { method: "digital-print", cost: 8.50, setupFee: 45, minimumQuantity: 25 }
    ],
    specifications: {
      capacity: "16oz (473ml)",
      material: "Stainless Steel",
      features: "Double Wall Vacuum Insulated"
    },
    minimumOrder: 25,
    isActive: true,
    lastUpdated: new Date(),
  },
  {
    id: "prod-4",
    name: "Canvas Tote Bag",
    description: "Heavy duty 12oz canvas tote bag with reinforced handles. Great for screen printing.",
    basePrice: "68.50",
    category: "Bags & Travel",
    brand: "Liberty Bags",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"
    ],
    colors: ["Natural", "Black", "Navy", "Red", "Forest Green"],
    sizes: ["Standard"],
    stockCount: 650,
    brandingOptions: [
      { method: "screen-print", cost: 12.50, setupFee: 65, minimumQuantity: 50 },
      { method: "digital-print", cost: 8.50, setupFee: 45, minimumQuantity: 25 }
    ],
    specifications: {
      material: "12oz Canvas",
      dimensions: "15\" x 16\" x 6\"",
      features: "22\" Reinforced Handles"
    },
    minimumOrder: 50,
    isActive: true,
    lastUpdated: new Date(),
  },
  {
    id: "prod-5",
    name: "Wireless Power Bank",
    description: "10,000mAh wireless charging power bank with LED indicator and USB-C output.",
    basePrice: "285.00",
    category: "Technology",
    brand: "Anker",
    images: [
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400",
      "https://images.unsplash.com/photo-1609772875810-8350174b70d7?w=400"
    ],
    colors: ["Black", "White"],
    sizes: ["Standard"],
    stockCount: 180,
    brandingOptions: [
      { method: "laser-engraving", cost: 15, setupFee: 85, minimumQuantity: 25 },
      { method: "digital-print", cost: 8.50, setupFee: 45, minimumQuantity: 25 }
    ],
    specifications: {
      capacity: "10,000mAh",
      output: "USB-C, Wireless 10W",
      features: "LED Battery Indicator"
    },
    minimumOrder: 25,
    isActive: true,
    lastUpdated: new Date(),
  },
  {
    id: "prod-6",
    name: "Executive Pen Set",
    description: "Premium metal pen set with stylish presentation box. Perfect for corporate gifts.",
    basePrice: "195.00",
    category: "Stationery",
    brand: "Cross",
    images: [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400",
      "https://images.unsplash.com/photo-1556798873-89c8637ee518?w=400"
    ],
    colors: ["Silver", "Gold", "Black"],
    sizes: ["Standard"],
    stockCount: 95,
    brandingOptions: [
      { method: "laser-engraving", cost: 15, setupFee: 85, minimumQuantity: 25 }
    ],
    specifications: {
      material: "Metal Construction",
      includes: "Ballpoint & Rollerball",
      packaging: "Gift Box Included"
    },
    minimumOrder: 25,
    isActive: true,
    lastUpdated: new Date(),
  },
];