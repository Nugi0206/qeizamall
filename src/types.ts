/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  costPrice: number; // Harga Modal
  price: number; // Harga Jual
  promoPrice: number | null; // Harga Promo
  weight: number; // dlm gram
  stock: number;
  minStock: number; // Batas minimum stok
  images: string[];
  videoUrl: string | null;
  adVideoUrl: string | null;
  colors: string[];
  sizes: string[];
  discount: number; // persentase diskon dihitung otomastis jika ada promoPrice
  isActive: boolean;
  label: "baru" | "bestseller" | "promo" | "biasa";
  category: string;
  subCategory: string | null;
  isMall?: boolean;
  shippingCity?: string;
  colorImages?: Record<string, string>; // Maps a color name to its variant base64/URL photo
  variantPrices?: Record<string, { price: number; promoPrice: number | null; stock: number; costPrice?: number }>;
}

export interface Address {
  street: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  color: string | null;
  size: string | null;
}

export type OrderStatus = "pending" | "processing" | "packaging" | "shipping" | "completed" | "cancelled" | "failed";

export interface Order {
  id: string;
  invoice: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  items: OrderItem[];
  shippingCourier: string; // "JNE", "J&T", "SiCepat", dll
  shippingCost: number;
  shippingOption: string; // "REG", "YES", dll
  estimatedDays: string;
  paymentMethod: "COD" | "Transfer Bank" | "QRIS";
  paymentBank: string | null; // BCA, Mandiri, dll jika Transfer Bank
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: OrderStatus;
  totalWeight: number; // gram
  subtotal: number;
  discountAmount: number;
  total: number;
  notes: string;
  trackingNo: string | null;
  trackingImage?: string | null;
  paymentProof?: string | null;
  voucherCode: string | null;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface BankAccount {
  bankName: string;
  accountNo: string;
  holderName: string;
}

export interface Settings {
  logoUrl: string;
  heroBanners: string[]; // URLs or Base64 images for banners
  aboutText: string;
  warehouseAddress: Address;
  activeCouriers: string[]; // List of enabled couriers
  activePayments: {
    cod: boolean;
    transferBank: {
      isActive: boolean;
      accounts: BankAccount[];
    };
    qris: {
      isActive: boolean;
      qrisUrl: string;
    };
  };
  seoTitle: string;
  seoDescription: string;
  contactPhone: string;
  contactEmail: string;
  bannerBadge?: string;
  bannerTitle?: string;
  bannerDescription?: string;
  bannerCtaText?: string;
  bannerImageUrl?: string;
  newArrivalTitle?: string;
  newArrivalBadge?: string;
  collectionTitle?: string;
  collectionBadge?: string;
  flashSaleProductIds?: string[];
  reviews?: { id: string; name: string; stars: number; text: string; product: string; }[];
  metaPixelId?: string;
}

export interface Promo {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; // Nilai diskon
  minPurchase: number;
  isActive: boolean;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string; // HTML or Text
  imageUrl: string;
  slug: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string | null;
  size: string | null;
  weight: number;
  images: string[];
}

export function getProductCheapestPrice(product: Product): { displayPrice: number; originalPrice: number; discountPercent: number; hasDiscount: boolean } {
  const activeVariants: string[] = [];
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const activeColors = colors.filter(c => c && c.trim() !== "");
  const activeSizes = sizes.filter(s => s && s.trim() !== "");
  
  if (activeColors.length > 0 && activeSizes.length > 0) {
    activeColors.forEach(c => {
      activeSizes.forEach(s => {
        if (c.trim() === "Kombinasi" && s.trim() === "All Size") {
          // skip
        } else if (c.trim() === "Kombinasi") {
          activeVariants.push(s.trim());
        } else if (s.trim() === "All Size") {
          activeVariants.push(c.trim());
        } else {
          activeVariants.push(`${c.trim()}-${s.trim()}`);
        }
      });
    });
  } else if (activeColors.length > 0) {
    activeColors.forEach(c => {
      if (c.trim() !== "Kombinasi") activeVariants.push(c.trim());
    });
  } else if (activeSizes.length > 0) {
    activeSizes.forEach(s => {
      if (s.trim() !== "All Size") activeVariants.push(s.trim());
    });
  }

  const prices: { price: number; promoPrice: number | null }[] = [];

  // 1. Gather valid variant prices
  if (product.variantPrices && activeVariants.length > 0) {
    activeVariants.forEach((vKey) => {
      const varInfo = product.variantPrices?.[vKey];
      if (varInfo && varInfo.price > 0) {
        prices.push({ price: varInfo.price, promoPrice: varInfo.promoPrice });
      }
    });
  }

  // 2. If no valid variant prices found, fall back to base product price
  if (prices.length === 0 && product.price > 0) {
    prices.push({ price: product.price, promoPrice: product.promoPrice });
  }

  let cheapestActivePrice = Infinity;
  let correspondingOriginalPrice = product.price;

  prices.forEach((item) => {
    const active = item.promoPrice !== null && item.promoPrice > 0 ? item.promoPrice : item.price;
    if (active > 0 && active < cheapestActivePrice) {
      cheapestActivePrice = active;
      correspondingOriginalPrice = item.price;
    }
  });

  const displayPrice = cheapestActivePrice === Infinity ? product.price : cheapestActivePrice;
  const originalPrice = correspondingOriginalPrice > 0 ? correspondingOriginalPrice : product.price;
  const hasDiscount = displayPrice < originalPrice;
  const discountPercent = hasDiscount && originalPrice > 0 ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  return { displayPrice, originalPrice, discountPercent, hasDiscount };
}

