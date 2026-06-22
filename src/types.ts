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

