/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Product, Order, Promo, Settings, BlogPost, StockLog, CartItem } from "./types";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartAndCheckoutModal from "./components/CartAndCheckoutModal";
import OrderTrackingModal from "./components/OrderTrackingModal";
import BlogPostsList from "./components/BlogPostsList";
import AdminDashboard from "./components/AdminDashboard";

import { 
  Search, ShoppingCart, Truck, HelpCircle, PhoneCall, 
  ChevronRight, Smartphone, AlertCircle, RefreshCw, Star, 
  MapPin, ShieldCheck, Mail, LockOpen, ArrowUpRight, Clock, Flame,
  Sparkles, Palette, Layers
} from "lucide-react";

export const templateStyles = {
  tokopedia: {
    bg: "bg-[#FAFAFA]", // Premium pure off-white minimalist canvas
    headerBg: "bg-white",
    cardBg: "bg-white",
    border: "border-zinc-150",
    textPrimary: "text-[#121212]", // Absolute modern high-contrast black
    textSecondary: "text-zinc-500", // Soft refined slate support text
    accent: "bg-[#121212]", // Bold signature black accents
    accentText: "text-[#121212]",
    accentHover: "hover:bg-neutral-800",
    badgeBg: "bg-zinc-100 text-zinc-800",
    badgeSec: "bg-zinc-50 text-zinc-650",
    buttonPrimary: "bg-[#121212] text-white hover:bg-neutral-800",
    buttonSecondary: "bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200",
    fontClass: "font-sans",
    accentBorder: "border-[#121212]",
    footerBg: "bg-[#121212] text-zinc-400 border-t border-zinc-800",
    footerTextPrimary: "text-white",
  },
  cream: {
    bg: "bg-[#FAFAFA]",
    headerBg: "bg-white",
    cardBg: "bg-white",
    border: "border-zinc-150",
    textPrimary: "text-[#121212]",
    textSecondary: "text-zinc-500",
    accent: "bg-[#121212]",
    accentText: "text-[#121212]",
    accentHover: "hover:bg-neutral-800",
    badgeBg: "bg-zinc-100 text-zinc-800",
    badgeSec: "bg-zinc-50 text-zinc-650",
    buttonPrimary: "bg-[#121212] text-white hover:bg-neutral-800",
    buttonSecondary: "bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200",
    fontClass: "font-sans",
    accentBorder: "border-[#121212]",
    footerBg: "bg-[#121212] text-zinc-400 border-t border-zinc-800",
    footerTextPrimary: "text-white",
  },
  midnight: {
    bg: "bg-[#FAFAFA]",
    headerBg: "bg-white",
    cardBg: "bg-white",
    border: "border-zinc-150",
    textPrimary: "text-[#121212]",
    textSecondary: "text-zinc-500",
    accent: "bg-[#121212]",
    accentText: "text-[#121212]",
    accentHover: "hover:bg-neutral-800",
    badgeBg: "bg-zinc-100 text-zinc-800",
    badgeSec: "bg-zinc-50 text-zinc-650",
    buttonPrimary: "bg-[#121212] text-white hover:bg-neutral-800",
    buttonSecondary: "bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200",
    fontClass: "font-sans",
    accentBorder: "border-[#121212]",
    footerBg: "bg-[#121212] text-zinc-400 border-t border-zinc-800",
    footerTextPrimary: "text-white",
  }
};

const getCategoryEmoji = (cat: string) => {
  const norm = cat.toLowerCase();
  if (norm.includes("semua")) return "🔥";
  if (norm.includes("elektronik") || norm.includes("gadget") || norm.includes("phone")) return "📱";
  if (norm.includes("baju") || norm.includes("pakaian") || norm.includes("fashion") || norm.includes("kemeja") || norm.includes("celana")) return "👕";
  if (norm.includes("skincare") || norm.includes("kosmetik") || norm.includes("cantik") || norm.includes("beauty")) return "💄";
  if (norm.includes("tas") || norm.includes("bag") || norm.includes("outdoor")) return "🎒";
  if (norm.includes("sepatu") || norm.includes("shoe")) return "👟";
  if (norm.includes("rumah") || norm.includes("home") || norm.includes("dapur") || norm.includes("kitchen")) return "🏠";
  if (norm.includes("makanan") || norm.includes("minuman") || norm.includes("food") || norm.includes("snack")) return "😋";
  if (norm.includes("hobi") || norm.includes("mainan") || norm.includes("toy")) return "🎮";
  if (norm.includes("otomotif") || norm.includes("motor") || norm.includes("mobil")) return "🚗";
  if (norm.includes("buku") || norm.includes("book") || norm.includes("tulis")) return "📚";
  return "📦"; // default product box emoji
};

export default function App() {
  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Store Template Style Mode
  const [storeTemplate, setStoreTemplate] = useState<"tokopedia" | "cream" | "midnight">(() => {
    const saved = localStorage.getItem("qeiza_store_template");
    const val = saved === "emerald" ? "tokopedia" : saved;
    return (val as "tokopedia" | "cream" | "midnight") || "tokopedia";
  });

  useEffect(() => {
    localStorage.setItem("qeiza_store_template", storeTemplate);
  }, [storeTemplate]);

  // UI Control States
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"buyer" | "admin">(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    return params.get("page") === "admin" || params.get("admin") === "true" ? "admin" : "buyer";
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  
  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  
  // Mock Flash Sale timer logic
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 24, seconds: 53 });
  
  // Hero Carousel Slide active indicator
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  const heroBanners = [
    {
      title: "Gaya Hidup Modern, Lebih Praktis & Mudah",
      subtitle: "Gadget Premium, Aksesoris Pilihan & Fashion Terbaik",
      tag: "SPECIAL LAUNCHING QEIZA MALL",
      img: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80",
      cta: "Belanja Sekarang"
    },
    {
      title: "Elektronik Canggih Di Genggaman Anda",
      subtitle: "Katalog Terlengkap Jaminan Original Bergaransi Resmi",
      tag: "NEW INVENTORIES ARRIVAL",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      cta: "Diskon Menarik"
    }
  ];

  // Load Database and config values on startup from express APIs
  const fetchAllData = async () => {
    try {
      const pRes = await fetch("/api/products");
      const productsData = await pRes.json();
      setProducts(productsData);

      const oRes = await fetch("/api/orders");
      const ordersData = await oRes.json();
      setOrders(ordersData);

      const prRes = await fetch("/api/promos");
      const promosData = await prRes.json();
      setPromos(promosData);

      const sRes = await fetch("/api/settings");
      const settingsData = await sRes.json();
      setSettings(settingsData);

      const bRes = await fetch("/api/blog-posts");
      const blogData = await bRes.json();
      setBlogPosts(blogData);

      const slRes = await fetch("/api/stock-logs");
      const logsData = await slRes.json();
      setStockLogs(logsData);
      
      setIsOfflineMode(false);
    } catch (err) {
      console.warn("Express backend API server offline/unreachable. Switching to robust Client Storage / Offline Demo Mode.", err);
      setIsOfflineMode(true);

      // Load products
      const savedProducts = localStorage.getItem("qeiza_fallback_products");
      if (savedProducts) {
        try { setProducts(JSON.parse(savedProducts)); } catch { localStorage.removeItem("qeiza_fallback_products"); }
      }
      if (!savedProducts || !localStorage.getItem("qeiza_fallback_products")) {
        const defaultProds = [
          {
            id: "prod-1",
            name: "iPhone 15 Pro Max 256GB Titanium",
            sku: "QZ-IPH-15PM-256",
            barcode: "8806090123456",
            description: "Nikmati kecanggihan iPhone terbaru dengan material Titanium tahan lama, chipset A17 Pro super bertenaga, sistem kamera canggih dengan 5x optical zoom, dan konektivitas USB-C super cepat.",
            costPrice: 18500000,
            price: 21999000,
            promoPrice: 20499000,
            weight: 221,
            stock: 14,
            minStock: 3,
            images: [
              "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
            ],
            colors: ["Titanium Alami", "Titanium Hitam"],
            sizes: ["256GB"],
            discount: 7,
            isActive: true,
            label: "bestseller",
            category: "Elektronik",
            subCategory: "Smartphone",
            videoUrl: null,
            adVideoUrl: null
          },
          {
            id: "prod-2",
            name: "Kemeja Oversized Linen Premium",
            sku: "QZ-FSH-LNN-WHT",
            barcode: "8991234567891",
            description: "Kemeja oversized bahan linen premium. Sangat adem, menyerap keringat, dan cocok untuk gaya kasual.",
            costPrice: 110000,
            price: 249000,
            promoPrice: 189000,
            weight: 250,
            stock: 43,
            minStock: 8,
            images: [
              "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
            ],
            colors: ["Off-White", "Sage Green"],
            sizes: ["M", "L"],
            discount: 24,
            isActive: true,
            label: "baru",
            category: "Fashion",
            subCategory: "Pakaian Pria",
            videoUrl: null,
            adVideoUrl: null
          }
        ];
        setProducts(defaultProds);
        localStorage.setItem("qeiza_fallback_products", JSON.stringify(defaultProds));
      }

      // Load settings
      const savedSettings = localStorage.getItem("qeiza_fallback_settings");
      if (savedSettings) {
        try { setSettings(JSON.parse(savedSettings)); } catch { localStorage.removeItem("qeiza_fallback_settings"); }
      }
      if (!savedSettings || !localStorage.getItem("qeiza_fallback_settings")) {
        const defaultSettings = {
          logoUrl: "",
          heroBanners: [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80"
          ],
          aboutText: "Qeiza Mall menyediakan berbagai macam kebutuhan gaya hidup masa kini dengan kualitas terbaik.",
          warehouseAddress: {
            street: "Jl. Raya Boulevard Barat No.18",
            kelurahan: "Kelapa Gading Barat",
            kecamatan: "Kelapa Gading",
            kabupaten: "Jakarta Utara",
            provinsi: "DKI Jakarta",
            postalCode: "14240"
          },
          activeCouriers: ["JNE", "J&T", "SiCepat"],
          activePayments: {
            cod: true,
            transferBank: {
              isActive: true,
              accounts: [
                {
                  bankName: "BCA",
                  accountNo: "8045519223",
                  holderName: "Qeiza Official Store"
                }
              ]
            },
            qris: {
              isActive: true,
              qrisUrl: "https://images.unsplash.com/photo-1682337199105-0eaf38ae85fc?auto=format&fit=crop&w=500&q=80"
            }
          },
          seoTitle: "Qeiza Mall - Belanja Mudah, Cepat, dan Terpercaya",
          seoDescription: "Pusat perbelanjaan online terpercaya Qeiza Mall.",
          contactPhone: "081234567890",
          contactEmail: "cs@qeizamall.com"
        };
        setSettings(defaultSettings);
        localStorage.setItem("qeiza_fallback_settings", JSON.stringify(defaultSettings));
      }

      // Load orders
      const savedOrders = localStorage.getItem("qeiza_fallback_orders");
      if (savedOrders) {
        try { setOrders(JSON.parse(savedOrders)); } catch { localStorage.removeItem("qeiza_fallback_orders"); }
      }
      if (!savedOrders || !localStorage.getItem("qeiza_fallback_orders")) {
        const defaultOrders = [
          {
            id: "ord-1",
            invoice: "INV-20260622-0001",
            createdAt: "2026-06-22T15:40:02.195Z",
            customerName: "Imron Rosyadi",
            customerPhone: "081234567890",
            address: {
              street: "Jl. Margonda Raya No. 4",
              kelurahan: "Pondok Cina",
              kecamatan: "Beji",
              kabupaten: "Depok",
              provinsi: "Jawa Barat",
              postalCode: "16424"
            },
            items: [
              {
                productId: "prod-2",
                productName: "Kemeja Oversized Linen Premium",
                price: 189000,
                costPrice: 110000,
                quantity: 1,
                color: "Sage Green",
                size: "L"
              }
            ],
            shippingCourier: "JNE",
            shippingCost: 15000,
            shippingOption: "REG",
            estimatedDays: "2-3 Hari",
            paymentMethod: "Transfer Bank" as any,
            paymentBank: "BCA",
            paymentStatus: "unpaid" as any,
            status: "pending" as any,
            totalWeight: 250,
            subtotal: 189000,
            discountAmount: 0,
            total: 204000,
            notes: "Tolong dikemas rapi ya kak",
            trackingNo: null,
            voucherCode: null
          }
        ];
        setOrders(defaultOrders);
        localStorage.setItem("qeiza_fallback_orders", JSON.stringify(defaultOrders));
      }

      // Load promos
      const savedPromos = localStorage.getItem("qeiza_fallback_promos");
      if (savedPromos) {
        try { setPromos(JSON.parse(savedPromos)); } catch { localStorage.removeItem("qeiza_fallback_promos"); }
      }
      if (!savedPromos || !localStorage.getItem("qeiza_fallback_promos")) {
        const defaultPromos = [
          {
            id: "prm-1",
            code: "PROMOINDONESIA",
            type: "percentage" as any,
            value: 10,
            minPurchase: 150000,
            isActive: true,
            description: "Diskon 10% dengan minimal transaksi Rp 150.000"
          }
        ];
        setPromos(defaultPromos);
        localStorage.setItem("qeiza_fallback_promos", JSON.stringify(defaultPromos));
      }

      // Load blog posts
      setBlogPosts([
        {
          id: "blog-1",
          title: "Cara Memilih Ukuran Pakaian Online yang Pas",
          content: "Pastikan Anda mengukur lingkar dada dan panjang baju secara seksama sebelum checkout.",
          imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
          slug: "pilih-ukuran-pakaian-online",
          createdAt: "2026-06-22T12:00:00.000Z"
        }
      ]);

      // Load stock logs
      setStockLogs([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Flash Sale Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 }; // Loop
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto transition hero banner slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Add Item to shopping cart
  const handleAddToCart = (product: Product, quantity: number, color?: string, size?: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (it) => it.productId === product.id && it.color === color && it.size === size
      );

      if (existingIdx > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIdx].quantity += quantity;
        return nextCart;
      } else {
        return [
          ...prevCart,
          {
            id: `cart-${Date.now()}-${Math.random()}`,
            productId: product.id,
            productName: product.name,
            price: product.promoPrice || product.price,
            quantity,
            color,
            size,
            weight: product.weight,
            images: product.images
          }
        ];
      }
    });
    alert(`Sukses menambahkan "${product.name}" ke Tas Belanja!`);
  };

  // Modify Cart Item quantity
  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((it) => it.id !== id));
    } else {
      setCart((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: qty } : it)));
    }
  };

  // Submit secure checkout API call to backend express
  const handleCreateOrder = async (orderPayload: any) => {
    let order = orderPayload;

    try {
      if (isOfflineMode || orderPayload.isFallbackOffline) {
        const mockInvoice = "INV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        const created: Order = {
          ...orderPayload,
          id: "ord-" + Date.now(),
          invoice: mockInvoice,
          createdAt: new Date().toISOString(),
          paymentStatus: "unpaid",
          status: "pending",
          trackingNo: null,
          trackingImage: null,
          paymentProof: null
        };
        const nextOrders = [...orders, created];
        setOrders(nextOrders);
        localStorage.setItem("qeiza_fallback_orders", JSON.stringify(nextOrders));
        order = created;
      } else {
        // If orderPayload does NOT have an invoice, it's a raw checkout payload, we need to POST it.
        if (!orderPayload.invoice) {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
          });
          if (res.ok) {
            const orderRes = await res.json();
            order = orderRes.order;
          } else {
            const errMsg = await res.text();
            alert(`Gagal membuat pesanan: ${errMsg}`);
            return;
          }
        }
      }

      // If we have a successful order, proceed to WhatsApp redirection & success state
      if (order && order.invoice) {
        setCart([]); // Clear shopping bag
        setIsCartOpen(false);
        if (!isOfflineMode) {
          fetchAllData(); // refresh order indexes
        }

        // Show a nice feedback alert and then redirect
        alert(`Pesanan Berhasil Dibuat!\nNo. Invoice Anda: ${order.invoice}\n\nSistem akan mengarahkan Anda ke WhatsApp untuk memproses pesanan langsung dengan layanan pelanggan Qeiza Mall.`);

        // Format phone number for WhatsApp CS (using settings.contactPhone)
        const csPhone = (settings?.contactPhone || "6282211993344").replace(/[^0-9]/g, "").replace(/^0/, "62");
        
        // Build beautiful WA formatted invoice text
        const itemsDetail = order.items.map((it: any) => {
          const variant = [it.color, it.size].filter(Boolean).join("/");
          const variantStr = variant ? ` (${variant})` : "";
          return `- ${it.productName}${variantStr} x${it.quantity} @ Rp ${it.price.toLocaleString("id-ID")}`;
        }).join("\n");

        const addressStr = `${order.address.street}, Kel. ${order.address.kelurahan}, Kec. ${order.address.kecamatan}, ${order.address.kabupaten}, ${order.address.provinsi} [${order.address.postalCode}]`;

        const formatCurrency = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

        const text = `Halo Kak, saya sudah belanja di Qeiza Mall! 🛍️\n\n` +
          `No. Invoice: *${order.invoice}*\n` +
          `Nama Penerima: *${order.customerName}*\n` +
          `No. WhatsApp: *${order.customerPhone}*\n\n` +
          `📍 *Alamat Pengiriman:*\n${addressStr}\n\n` +
          `📦 *Rincian Pesanan:*\n${itemsDetail}\n\n` +
          `🚚 *Biaya Pengiriman:*\n${order.shippingCourier} - ${order.shippingOption} (${formatCurrency(order.shippingCost)})\n\n` +
          `💰 *Total Tagihan:*\n*${formatCurrency(order.total)}*\n\n` +
          `💳 *Pilihan Pembayaran:*\n${order.paymentMethod}${order.paymentBank ? ` - ${order.paymentBank}` : ""}\n\n` +
          `📝 *Catatan:* ${order.notes || "-"}\n\n` +
          `*Langkah Selanjutnya:*\nMohon konfirmasi pesanan saya agar bisa segera dipersiapkan dan dikirim ya Kak. Terima kasih! 🙏`;

        const waUrl = `https://api.whatsapp.com/send?phone=${csPhone}&text=${encodeURIComponent(text)}`;
        if (typeof window !== "undefined") {
          window.open(waUrl, "_blank");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kendala jaringan saat memproses pesanan / penyelesaian WhatsApp.");
    }
  };

  // ERP admin update transitions state
  const handleUpdateOrderStatus = async (orderId: string, updates: Partial<Order>) => {
    if (isOfflineMode) {
      const next = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
      setOrders(next);
      localStorage.setItem("qeiza_fallback_orders", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (isOfflineMode) {
      const next = orders.filter(o => o.id !== orderId);
      setOrders(next);
      localStorage.setItem("qeiza_fallback_orders", JSON.stringify(next));
      return true;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAddProduct = async (productData: any) => {
    if (isOfflineMode) {
      const createdItem = {
        ...productData,
        id: "prod-" + Date.now(),
        discount: productData.promoPrice ? Math.round(((productData.price - productData.promoPrice) / productData.price) * 100) : 0
      };
      const next = [...products, createdItem];
      setProducts(next);
      localStorage.setItem("qeiza_fallback_products", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (prodId: string, updates: any) => {
    if (isOfflineMode) {
      const next = products.map(p => {
        if (p.id === prodId) {
          const merged = { ...p, ...updates };
          merged.discount = merged.promoPrice ? Math.round(((merged.price - merged.promoPrice) / merged.price) * 100) : 0;
          return merged;
        }
        return p;
      });
      setProducts(next);
      localStorage.setItem("qeiza_fallback_products", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (isOfflineMode) {
      const next = products.filter(p => p.id !== prodId);
      setProducts(next);
      localStorage.setItem("qeiza_fallback_products", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "DELETE"
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPromo = async (promoData: any) => {
    if (isOfflineMode) {
      const createdItem = {
        ...promoData,
        id: "prm-" + Date.now()
      };
      const next = [...promos, createdItem];
      setPromos(next);
      localStorage.setItem("qeiza_fallback_promos", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoData)
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (isOfflineMode) {
      const next = promos.filter(p => p.id !== promoId);
      setPromos(next);
      localStorage.setItem("qeiza_fallback_promos", JSON.stringify(next));
      return;
    }
    try {
      const res = await fetch(`/api/promos/${promoId}`, {
        method: "DELETE"
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    if (isOfflineMode) {
      if (settings) {
        const next = { ...settings, ...updates };
        setSettings(next);
        localStorage.setItem("qeiza_fallback_settings", JSON.stringify(next));
      }
      return;
    }
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Catalog commodities
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const uniqueCategories: string[] = [
    "Semua", 
    ...(Array.from(new Set(products.filter(p => p.isActive && p.category && p.category.trim() !== "").map((p) => String(p.category).trim()))) as string[])
  ];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading || !settings) {
    return (
      <div id="loading-spinner-screen" className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold font-mono text-gray-500 mt-4 uppercase tracking-widest">Memulai Sistem Qeiza Mall...</p>
      </div>
    );
  }

  // RENDER SELLER ADMIN DESKTOP ERP IF VIEW MODE IS SET TO ADMIN
  if (viewMode === "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        {isOfflineMode && (
          <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 z-50 shadow-sm leading-normal">
            <span>⚠️</span>
            <span><strong>Mode Demo Offline Aktif</strong>: Server API Express tidak terdeteksi (aplikasi berjalan serverless/static di hosting ini). Semua data disimpan di peramban Anda (localStorage).</span>
          </div>
        )}
        <AdminDashboard 
          products={products}
          orders={orders}
          stockLogs={stockLogs}
          promos={promos}
          settings={settings}
          onRefreshData={fetchAllData}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddPromo={handleAddPromo}
          onDeletePromo={handleDeletePromo}
          onUpdateSettings={handleUpdateSettings}
          onExitAdmin={() => {
            setViewMode("buyer");
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("page");
              url.searchParams.delete("admin");
              window.history.pushState({}, "", url.toString());
            }
          }}
        />
      </div>
    );
  }

  const st = templateStyles[storeTemplate];

  return (
    <div className={`min-h-screen ${st.bg} ${st.fontClass} ${st.textPrimary} transition-all duration-300 scroll-smooth leading-normal relative select-none`}>
      
      {isOfflineMode && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 z-50 relative shadow-sm leading-normal">
          <span>⚠️</span>
          <span><strong>Mode Demo Offline Aktif</strong>: Gagal terhubung ke API Server (berjalan serverless/static di hosting ini). Transaksi Anda disimpan lokal di peramban ini.</span>
        </div>
      )}
      
      {/* 0. TOPMOST ANNOUNCEMENT BAR */}
      <div className="bg-zinc-900 text-zinc-300 border-b border-zinc-800 text-[10px] py-2 px-4 hidden lg:block select-none tracking-widest font-medium uppercase text-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Smartphone className="w-3.5 h-3.5" />
            <span>GRATIS ONGKIR SE-INDONESIA • SPESIAL PROMO HARI INI</span>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="flex items-center gap-4 font-semibold text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Tentang Qeiza Mall</a>
            <a href="#" className="hover:text-white transition-colors">Mulai Berjualan</a>
            <a href="#" className="hover:text-white transition-colors">Promo</a>
            <a href="#" className="hover:text-white transition-colors">Qeiza Care</a>
          </div>
        </div>
      </div>

      {/* 1. TOP STICKY PREMIUM HEADER BAR (SHOPIFY-STYLE) */}
      <header id="sticky-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-150 shrink-0 shadow-xs transition-all duration-300 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-1 cursor-pointer shrink-0" onClick={() => { setSelectedCategory("Semua"); setSearchQuery(""); }}>
            <span className="font-extrabold text-zinc-950 text-xl lg:text-2xl tracking-tighter block font-sans uppercase">QEIZA MALL</span>
          </div>

          {/* Kategori Button Link */}
          <button 
            onClick={() => {
              setSelectedCategory("Semua");
              const el = document.getElementById("product-catalog-anchor");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs font-bold text-zinc-650 hover:text-zinc-950 transition-colors cursor-pointer px-1 shrink-0 hidden md:block uppercase tracking-wider"
          >
            Katalog
          </button>

          {/* Quick Header Instant Search bar - Tokopedia size */}
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Cari produk di Qeiza Mall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          </div>

          {/* Navigation right controls */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Lacak Pesanan CTA (Visible on both desktop & mobile in clean text/icon style) */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              title="Lacak Status Invoice"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Lacak Pesanan</span>
            </button>

            <div className="h-5 w-[1px] bg-zinc-200"></div>

            {/* Shopping Bag Counter button */}
            <div className="relative cursor-pointer p-1.5 hover:scale-105 transition-transform text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-zinc-650 hover:text-[#121212]">Keranjang</span>
              {cart.reduce((sum, i) => sum + i.quantity, 0) > 0 && (
                <span className="absolute -top-1 -right-2 bg-zinc-950 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DELIVER TO BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3 flex flex-wrap items-center justify-between text-[11px] gap-2 select-none text-zinc-500">
          <div className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>Alamat Pengiriman:</span>
            <span className="text-zinc-900 font-extrabold">Jakarta Pusat • Qeiza Store ∨</span>
          </div>
        </div>
      </header>

      {/* CATEGORY ICON PILLS ROW (SHOPIFY MODERN STYLE SUBBAR) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-2 overflow-x-auto scrollbar-none select-none shadow-xs">
          <div className="flex items-center gap-3 w-full justify-start text-xs overflow-x-auto scrollbar-none">
            {uniqueCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchQuery(""); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border transition-all shrink-0 font-bold ${
                    isActive 
                      ? "border-zinc-950 bg-zinc-950 text-white" 
                      : "border-zinc-200 text-zinc-650 hover:border-zinc-400 bg-white"
                  }`}
                >
                  <span className="text-sm">{getCategoryEmoji(cat)}</span>
                  <span>{cat === "Semua" ? "Semua Produk" : cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area in grid structured containers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: Promos & High-End Accents */}
        <aside className="w-full lg:w-56 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl p-5 bg-zinc-900 text-white relative overflow-hidden min-h-[160px] flex flex-col justify-between shadow-xs border border-zinc-850">
            <div className="relative z-10">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">New Arrival</p>
              <h4 className="text-base font-extrabold leading-tight mb-3">Gaya Premium Setiap Hari</h4>
              <button 
                onClick={() => {
                  const el = document.getElementById("product-catalog-anchor");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[10px] font-bold underline underline-offset-4 hover:text-zinc-300 transition-colors cursor-pointer tracking-wider uppercase"
              >
                LIHAT KOLEKSI
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </aside>

        {/* Middle Area: Hero Banner & Primary Catalogs */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* 2. HERO BANNER LARGE SLIDESHOW & VIDEO AD AREA (TOKOPEDIA DESIGN) */}
          <section id="hero-slider">
            <div className="w-full text-white bg-gradient-to-r from-[#8E0E00] via-[#1F1C2C] to-[#01579B] rounded-3xl overflow-hidden shadow-md relative min-h-[220px] p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6 select-none border border-white/10">
              
              {/* Left text column */}
              <div className="flex-1 space-y-4 relative z-10 max-w-xl text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-300 tracking-wider">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span>SPECIAL OFFER UNTUK ANDA</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Selamat datang! Gabung dan temukan Pilihan Produk Terbaik, <span className="text-amber-300 drop-shadow-md">Hanya Untukmu!</span>
                </h1>
                <p className="text-xs text-white/80 max-w-md font-medium leading-relaxed">
                  Belanja aman, nyaman, dan terjangkau di Qeiza Mall. Nikmati bonus gratis ongkir instan ke seluruh Indonesia khusus pesanan hari ini.
                </p>
              </div>

              {/* Right Button/CTA Actions */}
              <div className="relative shrink-0 flex flex-col items-center justify-center gap-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById("product-catalog-anchor");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] px-8 py-3.5 rounded-xl font-black text-sm tracking-widest shadow-xl scale-100 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 uppercase"
                >
                  Gabung Sekarang
                </button>
                <span className="text-[9px] text-white/60 font-mono font-bold tracking-wider">*Ketentuan promo berlaku</span>
              </div>

              {/* Backglow Ambient layers */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#D32F2F]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </section>

          {/* 3. FLASH SALE PROMOTION URGENCY COUNTDOWN GRID */}
          <section id="flash-sale-countdown" className="scroll-mt-20">
            <div className={`${st.cardBg} p-5 rounded-3xl border ${st.border} shadow-sm space-y-4 transition-all duration-300`}>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${st.border} pb-3`}>
                <div className="flex items-center gap-3">
                  <div className={`bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl text-rose-500`}>
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-extrabold ${st.textPrimary} flex items-center gap-2`}>
                      <span>Flash Sale Kejutan Qeiza</span>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/65 text-orange-600 dark:text-orange-400 rounded text-[9px] font-black">HOT</span>
                    </h3>
                    <p className={`text-[11px] ${st.textSecondary} font-semibold mt-0.5`}>Diskon potongan spektakuler, stok sangat terbatas!</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold">
                  <span className={`${st.textSecondary} font-bold tracking-wider uppercase text-[9px] mr-1`}>Tinggal:</span>
                  <span className="bg-rose-500 text-white px-2 py-1 rounded-md">{String(countdown.hours).padStart(2, "0")}</span>
                  <span className="text-rose-500">:</span>
                  <span className="bg-rose-500 text-white px-2 py-1 rounded-md">{String(countdown.minutes).padStart(2, "0")}</span>
                  <span className="text-rose-500">:</span>
                  <span className="bg-rose-500 text-white px-2 py-1 rounded-md">{String(countdown.seconds).padStart(2, "0")}</span>
                </div>
              </div>

              {/* Flash Sale Grid (filters products labeled "promo") */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {products.filter(p => p.label === "promo").slice(0, 5).map(prod => (
                  <div 
                    id={`flash-sale-product-card-${prod.id}`}
                    key={prod.id} 
                    className={`${storeTemplate === "midnight" ? "bg-slate-900/50" : "bg-gray-50/70"} p-2.5 rounded-2xl border ${st.border} flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md hover:border-rose-500/40 transition-all relative`}
                    onClick={() => setSelectedProduct(prod)}
                  >
                    {prod.discount > 0 && (
                      <span className="absolute top-2 left-2 text-[8px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase z-10">
                        -{prod.discount}%
                      </span>
                    )}

                    <div className={`aspect-square rounded-xl ${st.cardBg} border ${st.border} overflow-hidden relative shrink-0`}>
                      <img referrerPolicy="no-referrer" src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                      {prod.stock <= 4 && (
                        <div className="absolute inset-x-0 bottom-0 bg-rose-600/95 text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wider">
                          Sisa {prod.stock}!
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-[11px] font-bold ${st.textPrimary} line-clamp-1`}>{prod.name}</h4>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className={`text-xs font-black ${st.accentText}`}>{formatIDR(prod.promoPrice || prod.price)}</span>
                        <span className={`text-[8px] ${st.textSecondary} line-through`}>{formatIDR(prod.price)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${prod.stock <= 3 ? "bg-rose-500" : "bg-emerald-500"}`} 
                          style={{ width: `${Math.min(100, (prod.stock / 10) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. MAIN PRODUCT CATALOG MODULE (WITH CATEGORIES BAR & GRID) */}
          <section id="product-catalog-anchor" className="scroll-mt-20 space-y-4">
            
            <div className="space-y-3">
              <div className={`flex items-baseline justify-between border-b ${st.border} pb-2`}>
                <h3 className={`text-sm font-extrabold ${st.textPrimary} flex items-center gap-1.5`}>
                  <span>Rekomendasi Produk Pilihan Kami</span>
                  <span className={`text-xs ${st.textSecondary} font-semibold`}>({filteredProducts.length} ready)</span>
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className={`${st.cardBg} p-12 rounded-2xl border ${st.border} text-center ${st.textSecondary} font-semibold space-y-2`}>
                  <span className="block text-2xl">☹</span>
                  <p className="text-xs">Mohon maaf, tidak ditemukan produk "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onViewDetail={() => setSelectedProduct(p)} 
                      onBuyImmediate={(prod) => handleAddToCart(prod, 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 5. INTERACTIVE CAROUSEL "CARA BELANJA" SECTIONS */}
          <section id="shopping-guides" className="space-y-2">
            <div className="bg-zinc-950 text-gray-250 p-6 sm:p-8 rounded-2xl space-y-4 border border-zinc-850">
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-450 font-mono font-bold tracking-widest block uppercase">TUTORIAL</span>
                <h3 className="text-base font-black text-white leading-none">Panduan Mudah Berbelanja di Qeiza Mall</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-805 space-y-1.5">
                  <span className="text-sm text-zinc-400 font-mono font-bold">01.</span>
                  <h4 className="text-xs font-bold text-white">Pilih Produk & Varian</h4>
                  <p className="text-[11px] text-gray-400 leading-normal font-medium">Cari barang kesayangan Anda, lalu pilih variasi warna dan ukuran.</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-805 space-y-1.5">
                  <span className="text-sm text-zinc-400 font-mono font-bold">02.</span>
                  <h4 className="text-xs font-bold text-white">Lengkapi Data Kasir</h4>
                  <p className="text-[11px] text-gray-400 leading-normal font-medium">Buka menu Tas Belanja, masukkan nama WhatsApp, alamat destinasi pengiriman.</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-805 space-y-1.5">
                  <span className="text-sm text-zinc-400 font-mono font-bold">03.</span>
                  <h4 className="text-xs font-bold text-white">Selesaikan Pembayaran</h4>
                  <p className="text-[11px] text-gray-400 leading-normal font-medium">Bayar COD, scan QRIS atau Transfer Bank. Resi Anda langsung aktif.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. TESTIMONI PELANGGAN REAL (CRM ADVOCACY BOARD) */}
          <section id="customer-testimonials" className="space-y-3">
            <h3 className={`text-xs font-bold ${st.textSecondary} uppercase tracking-widest border-b ${st.border} pb-1.5`}>Ulasan Pembeli Puas</h3>
            
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] ${st.textSecondary} font-semibold`}>
              <div className={`${st.cardBg} p-4 rounded-2xl border ${st.border} shadow-xs space-y-2`}>
                <div className="flex gap-0.5 text-amber-500 text-[10px]">★★★★★</div>
                <p className="leading-relaxed">“Sangat puas berbelanja di Qeiza Mall! Pengiriman cepat, kemasan rapi bubble wrap tebal.”</p>
                <div>
                  <strong className={`${st.textPrimary} block text-xs`}>Dewi Lestari</strong>
                  <span className={`text-[9px] ${st.textSecondary} block font-mono`}>Beli: Kemeja Linen Sage</span>
                </div>
              </div>

              <div className={`${st.cardBg} p-4 rounded-2xl border ${st.border} shadow-xs space-y-2`}>
                <div className="flex gap-0.5 text-amber-500 text-[10px]">★★★★★</div>
                <p className="leading-relaxed">“Checkout jam tangan smart menggunakan QRIS instan sekali prosesnya. Customer care sangat ramah.”</p>
                <div>
                  <strong className={`${st.textPrimary} block text-xs`}>Aditya Nugroho</strong>
                  <span className={`text-[9px] ${st.textSecondary} block font-mono`}>Beli: Smartwatch Sport V2</span>
                </div>
              </div>

              <div className={`${st.cardBg} p-4 rounded-2xl border ${st.border} shadow-xs space-y-2`}>
                <div className="flex gap-0.5 text-amber-500 text-[10px]">★★★★★</div>
                <p className="leading-relaxed">“Harganya miring dibandingkan toko luar, voucher subsidi beneran gratis ongkir.”</p>
                <div>
                  <strong className={`${st.textPrimary} block text-xs`}>Sarah Amalia</strong>
                  <span className={`text-[9px] ${st.textSecondary} block font-mono`}>Beli: Serum Skin Radiant</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. SEO ARTICLES & BLOG POSTS */}
          <section id="seo-blog">
            <BlogPostsList posts={blogPosts} />
          </section>

        </div>

        {/* Right Sidebar: Tracking Status, Promo code and copy elements */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div className={`${st.cardBg} rounded-2xl p-4 shadow-sm border ${st.border}`}>
            <h3 className={`text-[11px] font-bold ${st.textSecondary} uppercase tracking-wider mb-4`}>Lacak Pesanan</h3>
            <div className="space-y-4">
              <div className="relative pb-4 border-l-2 border-zinc-950 ml-2 pl-4">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-950 rounded-full border-4 border-white shadow-xs"></div>
                <p className={`text-xs font-bold ${st.textPrimary}`}>Paket Dikirim</p>
                <p className={`text-[10px] ${st.textSecondary} font-medium`}>Kurir Mitra Menuju Tujuan</p>
              </div>
              <div className="relative pb-0 border-l-2 border-zinc-200 ml-2 pl-4">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-200 rounded-full border-4 border-white"></div>
                <p className="text-xs font-bold text-zinc-400">Sampai di Tujuan</p>
                <p className="text-[10px] text-zinc-405 font-medium font-semibold">Estimasi Tepat Waktu</p>
              </div>
              
              <div 
                className="bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-xl p-3 border border-zinc-200 cursor-pointer"
                onClick={() => setIsTrackingOpen(true)}
              >
                <p className={`text-[10px] font-semibold ${st.textSecondary} mb-1`}>Cek Resi / Invoice</p>
                <div className={`flex justify-between items-center text-xs font-mono font-bold ${st.textPrimary}`}>
                  <span className="opacity-80">Lacak paket Anda...</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${st.accentText}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-5 text-white shadow-lg border border-zinc-805 flex-1 flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[9px] font-semibold mb-3 tracking-wider">VOUCHER DISKON</span>
              <h4 className="text-xl font-extrabold mb-1 leading-sharp uppercase">
                POTONGAN <br />
                {promos.length > 0 ? `Diskon ${promos[0].discountPercent}%` : "S/D 50%"}
              </h4>
              <p className="text-[10px] opacity-80 mt-2">Dapatkan subsidi ongkir tanpa minimal belanja hanya hari ini!</p>
            </div>
            
            {promos.length > 0 ? (
              <div 
                onClick={() => {
                  navigator.clipboard.writeText(promos[0].code);
                  alert(`Disalin: ${promos[0].code}`);
                }}
                className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 border border-white/20 cursor-pointer mt-4"
              >
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-60 mb-1">Salin Kode Promo</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs">{promos[0].code}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-3 border border-white/20 mt-4">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-65 mb-1">Salin Kode</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs">QEIZAMALL50</span>
                </div>
              </div>
            )}
          </div>
        </aside>

      </main>

      {/* 8. FLOATING WHATSAPP CHAT TRIGGERS WITH PAPERS MOCK */}
      <div className="fixed bottom-6 right-6 z-45 flex items-center gap-3">
        <div className={`bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-2xl shadow-lg border ${st.border} text-[10.5px] font-bold ${st.textPrimary} hidden md:block`}>
          Tanya Admin?
        </div>
        <a
          href={`https://wa.me/${settings.contactPhone}?text=Halo%20Admin%20Qeiza%20Mall,%20saya%20tertarik%20bertanya%20seputar%20produk%20dan%20order%20yang%20tersedia.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Hubungi Customer Support Kami"
        >
          <svg className="w-6.5 h-6.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.517 5.514l-.955 3.486 3.737-.981z"/>
          </svg>
        </a>
      </div>

      {/* 9. PREMIUM COMPACT MINI FOOTER */}
      <footer className={`${st.footerBg} py-6 px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold transition-all duration-300`}>
        <p>© 2024 Qeiza Mall - Official Store. All Rights Reserved.</p>
        <div className="flex items-center gap-6 mt-3 sm:mt-0">
          <a href="#" className={`hover:${st.footerTextPrimary} transition-colors`}>Metode Pembayaran</a>
          <a href="#" className={`hover:${st.footerTextPrimary} transition-colors`}>Kebijakan Privasi</a>
          <a href="#" className={`hover:${st.footerTextPrimary} transition-colors`}>Syarat & Ketentuan</a>
          <button 
            type="button"
            onClick={() => {
              setViewMode("admin");
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.set("page", "admin");
                window.history.pushState({}, "", url.toString());
              }
            }}
            className={`hover:${st.footerTextPrimary} transition-colors cursor-pointer text-zinc-400/80 font-bold`}
          >
            Portal ERP
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs">🇮🇩</span>
            <span>IDN | IDR</span>
          </div>
        </div>
      </footer>

      {/* DYNAMIC BACKDROP DIALOG MODALS SECTIONS */}

      {/* Product Detailed modal wrapper preview */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onInstantBuy={(prod, color, size) => {
            handleAddToCart(prod, 1, color, size);
            setSelectedProduct(null);
          }}
          contactPhone={settings.contactPhone}
        />
      )}

      {/* Cart Checkout multi-step ledger sheet */}
      {isCartOpen && (
        <CartAndCheckoutModal 
          cartItems={cart.map((it) => {
            const foundProd = products.find((p) => p.id === it.productId) || ({
              id: it.productId,
              name: it.productName,
              price: it.price,
              promoPrice: null,
              costPrice: it.price,
              weight: it.weight,
              stock: 99,
              minStock: 1,
              images: it.images,
              videoUrl: null,
              adVideoUrl: null,
              colors: it.color ? [it.color] : [],
              sizes: it.size ? [it.size] : [],
              discount: 0,
              isActive: true,
              label: "biasa",
              category: "Semua",
              subCategory: null,
            } as Product);
            return {
              product: foundProd,
              quantity: it.quantity,
              color: it.color,
              size: it.size,
            };
          })}
          settings={settings}
          promos={promos}
          onUpdateQty={(idx, newQty) => {
            const item = cart[idx];
            if (item) {
              handleUpdateCartQty(item.id, newQty);
            }
          }}
          onRemoveItem={(idx) => {
            const item = cart[idx];
            if (item) {
              handleUpdateCartQty(item.id, 0);
            }
          }}
          onClose={() => setIsCartOpen(false)}
          onCheckoutSuccess={handleCreateOrder}
          isOfflineMode={isOfflineMode}
        />
      )}

      {/* Order Status Timeline tracer sheet */}
      {isTrackingOpen && (
        <OrderTrackingModal 
          orders={orders}
          onClose={() => setIsTrackingOpen(false)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

    </div>
  );
}
