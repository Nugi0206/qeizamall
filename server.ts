/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Product, Order, Settings, Promo, StockLog, BlogPost, Address } from "./src/types.js";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to secure directory
interface DBStructure {
  products: Product[];
  orders: Order[];
  settings: Settings;
  promos: Promo[];
  stockLogs: StockLog[];
  blogPosts: BlogPost[];
}

const defaultWarehouseAddress: Address = {
  street: "Jl. Raya Boulevard Barat No.18, Kelapa Gading",
  kelurahan: "Kelapa Gading Barat",
  kecamatan: "Kelapa Gading",
  kabupaten: "Jakarta Utara",
  provinsi: "DKI Jakarta",
  postalCode: "14240",
};

const defaultSettings: Settings = {
  logoUrl: "",
  heroBanners: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
  ],
  aboutText: "Qeiza Mall menyediakan berbagai macam kebutuhan gaya hidup masa kini dengan kualitas terbaik, pengiriman tercepat, dan harga yang terjangkau. Kami selalu berkomitmen memberikan pelayanan prima serta jaminan transaksi aman 100%.",
  warehouseAddress: defaultWarehouseAddress,
  activeCouriers: ["JNE", "J&T", "SiCepat", "AnterAja", "Ninja Express", "Pos Indonesia", "TIKI"],
  activePayments: {
    cod: true,
    transferBank: {
      isActive: true,
      accounts: [
        { bankName: "BCA", accountNo: "8045519223", holderName: "Qeiza Official Store" },
        { bankName: "Mandiri", accountNo: "1350029910292", holderName: "PT Qeiza Retail Nusantara" },
        { bankName: "BRI", accountNo: "023901002345501", holderName: "Qeiza Mall" }
      ]
    },
    qris: {
      isActive: true,
      qrisUrl: "https://images.unsplash.com/photo-1682337199105-0eaf38ae85fc?auto=format&fit=crop&w=500&q=80" // Placeholder QRIS
    }
  },
  seoTitle: "Qeiza Mall - Belanja Mudah, Cepat, dan Terpercaya",
  seoDescription: "Pusat perbelanjaan online terpercaya Qeiza Mall. Menyediakan fashion premium, gadget terbaik, aksesoris, dan perlengkapan rumah unik dengan garansi pengiriman tercepat.",
  contactPhone: "081234567890",
  contactEmail: "cs@qeizamall.com"
};

const seedProducts: Product[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max 256GB Titanium",
    sku: "QZ-IPH-15PM-256",
    barcode: "8806090123456",
    description: "Nikmati kecanggihan iPhone terbaru dengan material Titanium tahan lama, chipset A17 Pro super bertenaga, sistem kamera canggih dengan 5x optical zoom, dan konektivitas USB-C super cepat. Dilengkapi dengan garansi resmi iBox Indonesia 1 tahun.",
    costPrice: 18500000,
    price: 21999000,
    promoPrice: 20499000,
    weight: 221,
    stock: 14,
    minStock: 3,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1695048132938-f9a86b97b095?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "https://www.youtube.com/embed/xqyUdNxWn3w",
    adVideoUrl: "https://www.youtube.com/embed/xqyUdNxWn3w",
    colors: ["Titanium Alami", "Titanium Hitam", "Titanium Putih"],
    sizes: ["256GB", "512GB"],
    discount: 7,
    isActive: true,
    label: "bestseller",
    category: "Elektronik",
    subCategory: "Smartphone"
  },
  {
    id: "prod-2",
    name: "Kemeja Oversized Linen Premium",
    sku: "QZ-FSH-LNN-WHT",
    barcode: "8991234567891",
    description: "Kemeja oversized bahan linen premium. Sangat adem, menyerap keringat, dan cocok untuk gaya kasual maupun formal. Desain minimalis kekinian, jahit tepi rapi kualitas butik dengan ketebalan kain pas.",
    costPrice: 110000,
    price: 249000,
    promoPrice: 189000,
    weight: 250,
    stock: 45,
    minStock: 8,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620012253295-c05cdee5e09e?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: null,
    adVideoUrl: null,
    colors: ["Off-White", "Sage Green", "Oatmeal"],
    sizes: ["S", "M", "L", "XL"],
    discount: 24,
    isActive: true,
    label: "baru",
    category: "Fashion",
    subCategory: "Pakaian Pria"
  },
  {
    id: "prod-3",
    name: "Smart Air Fryer LED Touch 4.5L",
    sku: "QZ-HME-AFR-450",
    barcode: "8990391283921",
    description: "Memasak sehat tanpa minyak dengan kapasitas besar 4.5 Liter. Dilengkapi 8 menu preset pintar, kontrol suhu digital yang presisi 80-200°C, interior anti-lengket yang sangat mudah dibersihkan, dan perlindungan watt otomatis agar hemat daya.",
    costPrice: 420000,
    price: 899000,
    promoPrice: 729000,
    weight: 4200,
    stock: 22,
    minStock: 5,
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: null,
    adVideoUrl: null,
    colors: ["Hitam Onyx", "Putih Polar"],
    sizes: ["Standard 4.5L"],
    discount: 19,
    isActive: true,
    label: "promo",
    category: "Peralatan Rumah",
    subCategory: "Dapur Kecil"
  },
  {
    id: "prod-4",
    name: "Serum Niacinamide 10% Brightening Booster",
    sku: "QZ-BEU-SER-010",
    barcode: "8991349012921",
    description: "Serum pencerah kulit berformula intensif dengan Niacinamide 10% tingkat farmasi, Zinc PCA untuk hidrasi penjinak minyak, dan Hyaluronic acid. Berkhasiat memudarkan noda hitam, meratakan warna kulit wajah, mengecilkan pori-pori dalam 2 minggu penggunaan.",
    costPrice: 45000,
    price: 120000,
    promoPrice: 89000,
    weight: 120,
    stock: 4, // low stock to trigger notification alerts
    minStock: 5,
    images: [
      "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: null,
    adVideoUrl: null,
    colors: ["Transparan"],
    sizes: ["30ml Bottle"],
    discount: 25,
    isActive: true,
    label: "bestseller",
    category: "Kecantikan",
    subCategory: "Skincare"
  },
  {
    id: "prod-5",
    name: "Kacamata Retro Acetate Anti-UV",
    sku: "QZ-ACC-SUN-RET",
    barcode: "8992039120935",
    description: "Kacamata retro modis bergaya klasik Eropa dengan bingkai Acetate tebal berkualitas tinggi. Dilengkapi lensa UV400 untuk perlindungan mata penuh, engsel logam berlapis, dan kelengkapan box kulit premium.",
    costPrice: 80000,
    price: 199000,
    promoPrice: null,
    weight: 45,
    stock: 50,
    minStock: 4,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: null,
    adVideoUrl: null,
    colors: ["Piano Black", "Tortoise Brown", "Clear Amber"],
    sizes: ["Unisex Standard"],
    discount: 0,
    isActive: true,
    label: "biasa",
    category: "Aksesoris",
    subCategory: "Sunglasses"
  },
  {
    id: "prod-6",
    name: "Keyboard Mechanical RGB Gasket 75%",
    sku: "QZ-ELE-KEY-G75",
    barcode: "8997034920192",
    description: "Keyboard mekanikal premium bertingkat gasket-mounted dengan layout 75% ringkas. Dilengkapi dengan switch linear pra-lubrikasi, konektivitas triple-mode (Kabel, Bluetooth, 2.4Ghz), dumper foam tebal, dan pencahayaan RGB customizable.",
    costPrice: 380000,
    price: 750000,
    promoPrice: 629000,
    weight: 950,
    stock: 18,
    minStock: 3,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: null,
    adVideoUrl: null,
    colors: ["Frost White Switch", "Dark Knight Coiled"],
    sizes: ["Linear Yellow", "Tactile Brown"],
    discount: 16,
    isActive: true,
    label: "baru",
    category: "Elektronik",
    subCategory: "Aksesoris Komputer"
  }
];

// Adjusting compilation costPrice
seedProducts[5].costPrice = 380000;

const seedPromos: Promo[] = [
  { id: "prm-1", code: "PROMOINDONESIA", type: "percentage", value: 10, minPurchase: 150000, isActive: true, description: "Diskon 10% dengan minimal transaksi Rp 150.000" },
  { id: "prm-2", code: "ONGIKIRGRATIS", type: "free_shipping", value: 20000, minPurchase: 100000, isActive: true, description: "Subsidi ongkir Rp 20.000 dengan minimal belanja Rp 100.000" },
  { id: "prm-3", code: "QEIZAPREMIUM", type: "fixed", value: 50000, minPurchase: 500000, isActive: true, description: "Potongan harga langsung Rp 50.000 khusus transaksi minimal Rp 500.000" }
];

const seedBlogPosts: BlogPost[] = [
  {
    id: "blg-1",
    title: "5 Tips Memilih Pakaian Berbahan Linen Agar Tetap Nyaman Seharian",
    slug: "tips-memilih-pakaian-linen",
    content: `Kain linen telah menjadi salah satu jenis kain premium terfavorit untuk iklim tropis seperti Indonesia. Bahan alami serat tanaman rami ini memiliki karakteristik sirkulasi udara yang luar biasa, sehingga sangat adem dan nyaman dipakai. Berikut adalah 5 cara memilih pakaian linen berkualitas:
1. **Perhatikan Ketebalan Jalinan Benang**: Linen murni berkualitas memiliki pola anyaman benang yang sedikit tidak teratur yang khas, tetapi tetap padat dan tidak terawang.
2. **Cek Campurannya**: Linen 100% sangat direkomendasikan untuk kenyamanan maksimal, namun linen-cotton blend juga baik untuk mengurangi kekusutan.
3. **PILIH SIZING YANG AGAK LONGGAR**: Karakter linen adalah non-stretch, memilih model oversized seperti kemeja linen premium Qeiza Mall adalah langkah super modis yang nyaman.
4. **Pilih Warna-warna Alam (Earth Tones)**: Mengeluarkan tekstur natural rami yang mewah.
5. **Perawatan Benar**: Cuci dengan tangan atau putaran mesin lembut, hindari deterjen pemutih keras agar serat tetap halus.`,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
    createdAt: "2026-06-19T10:00:00Z"
  },
  {
    id: "blg-2",
    title: "Mengapa Memasak Menggunakan Smart Air Fryer Lebih Menyehatkan?",
    slug: "kelebihan-smart-air-fryer",
    content: "Gaya hidup sehat kini sedang menjadi tren global. Salah satu investasi dapur paling fungsional saat ini adalah Smart Air Fryer. Alat ini bekerja dengan mensirkulasikan udara super panas secara cepat di sekitar makanan. Hasilnya? Tekstur gurih renyah di luar, lembut di dalam, tanpa perlu rendaman minyak goreng! Penggunaan Air Fryer terbukti mengurangi asupan kalori dan lemak jenuh hingga 85%. Ditambah fitur kontrol digital otomatis pada tipe terbaru, memasak sehat kini semudah mengklik layar handphone Anda.",
    imageUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=500&q=80",
    createdAt: "2026-06-21T15:20:00Z"
  }
];

const seedStockLogs: StockLog[] = [
  { id: "log-1", productId: "prod-1", productName: "iPhone 15 Pro Max 256GB Titanium", type: "in", quantity: 15, reason: "Stok Awal Inventaris Gudang", createdAt: "2026-06-18T08:00:00Z" },
  { id: "log-2", productId: "prod-2", productName: "Kemeja Oversized Linen Premium", type: "in", quantity: 50, reason: "Stok Produksi Vendor Bandung", createdAt: "2026-06-18T08:15:00Z" },
  { id: "log-3", productId: "prod-3", productName: "Smart Air Fryer LED Touch 4.5L", type: "in", quantity: 25, reason: "Restock QC Selesai", createdAt: "2026-06-18T08:30:00Z" },
  { id: "log-4", productId: "prod-4", productName: "Serum Niacinamide 10% Brightening Booster", type: "in", quantity: 5, reason: "Stok Awal Toko", createdAt: "2026-06-18T08:50:00Z" }
];

const seedOrders: Order[] = [
  {
    id: "ord-1",
    invoice: "INV-20260619-0001",
    createdAt: "2026-06-19T14:30:00Z",
    customerName: "Ahmad Subarjo",
    customerPhone: "08122334455",
    address: {
      street: "Jl. Diponegoro No. 45",
      kelurahan: "Cihapit",
      kecamatan: "Bandung Wetan",
      kabupaten: "Bandung",
      provinsi: "Jawa Barat",
      postalCode: "40114"
    },
    items: [
      { productId: "prod-2", productName: "Kemeja Oversized Linen Premium", price: 189000, costPrice: 110000, quantity: 2, color: "Off-White", size: "L" },
      { productId: "prod-4", productName: "Serum Niacinamide 10% Brightening Booster", price: 89000, costPrice: 45000, quantity: 1, color: "Transparan", size: "30ml Bottle" }
    ],
    shippingCourier: "JNE",
    shippingCost: 15000,
    shippingOption: "REG",
    estimatedDays: "2-3 Hari",
    paymentMethod: "Transfer Bank",
    paymentBank: "BCA",
    paymentStatus: "paid",
    status: "completed",
    totalWeight: 620,
    subtotal: 467000,
    discountAmount: 20000, // ONGIKIRGRATIS voucher
    total: 462000,
    notes: "Kirim sebelum sore ya gan makasih",
    trackingNo: "JNEJT183021950",
    voucherCode: "ONGIKIRGRATIS"
  },
  {
    id: "ord-2",
    invoice: "INV-20260620-0001",
    createdAt: "2026-06-20T09:12:00Z",
    customerName: "Siti Rahmawati",
    customerPhone: "08569876543",
    address: {
      street: "Komp. Perumahan Lestari Blok C9",
      kelurahan: "Sukamaju",
      kecamatan: "Sako",
      kabupaten: "Palembang",
      provinsi: "Sumatera Selatan",
      postalCode: "30164"
    },
    items: [
      { productId: "prod-3", productName: "Smart Air Fryer LED Touch 4.5L", price: 729000, costPrice: 420000, quantity: 1, color: "Hitam Onyx", size: "Standard 4.5L" }
    ],
    shippingCourier: "SiCepat",
    shippingCost: 45000,
    shippingOption: "GOKIL",
    estimatedDays: "3-4 Hari",
    paymentMethod: "COD",
    paymentBank: null,
    paymentStatus: "unpaid",
    status: "shipping",
    totalWeight: 4200,
    subtotal: 729000,
    discountAmount: 0,
    total: 774000,
    notes: "Tolong wrap bubble tebal",
    trackingNo: "SIS80340129210",
    voucherCode: null
  },
  {
    id: "ord-3",
    invoice: "INV-20260621-0001",
    createdAt: "2026-06-21T11:45:00Z",
    customerName: "Budi Gunawan",
    customerPhone: "08192837465",
    address: {
      street: "Apartemen Medit Green Tower C Lantai 22",
      kelurahan: "Tanjung Duren Selatan",
      kecamatan: "Grogol Petamburan",
      kabupaten: "Jakarta Barat",
      provinsi: "DKI Jakarta",
      postalCode: "11470"
    },
    items: [
      { productId: "prod-2", productName: "Kemeja Oversized Linen Premium", price: 189000, costPrice: 110000, quantity: 3, color: "Sage Green", size: "XL" }
    ],
    shippingCourier: "J&T",
    shippingCost: 9000,
    shippingOption: "EZ",
    estimatedDays: "1-2 Hari",
    paymentMethod: "Transfer Bank",
    paymentBank: "Mandiri",
    paymentStatus: "unpaid",
    status: "processing",
    totalWeight: 750,
    subtotal: 567000,
    discountAmount: 56700, // PROMOINDONESIA 10%
    total: 519300,
    notes: "",
    trackingNo: null,
    voucherCode: "PROMOINDONESIA"
  }
];

// Initialize DB file
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBStructure = {
      products: seedProducts,
      orders: seedOrders,
      settings: defaultSettings,
      promos: seedPromos,
      stockLogs: seedStockLogs,
      blogPosts: seedBlogPosts
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log("Database initialized successfully!");
  } else {
    // Read and merge any missing fields if exist
    try {
      const current = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      let updated = false;
      if (!current.products) { current.products = seedProducts; updated = true; }
      if (!current.orders) { current.orders = seedOrders; updated = true; }
      if (!current.settings) { current.settings = defaultSettings; updated = true; }
      if (!current.promos) { current.promos = seedPromos; updated = true; }
      if (!current.stockLogs) { current.stockLogs = seedStockLogs; updated = true; }
      if (!current.blogPosts) { current.blogPosts = seedBlogPosts; updated = true; }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2));
      }
    } catch (e) {
      console.error("Error reading db, recreating...");
      const initialData: DBStructure = {
        products: seedProducts,
        orders: seedOrders,
        settings: defaultSettings,
        promos: seedPromos,
        stockLogs: seedStockLogs,
        blogPosts: seedBlogPosts
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  }
}

initDB();

function getDB(): DBStructure {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    initDB();
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
}

function saveDB(db: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// REST API Endpoints

// 1. Settings
app.get("/api/settings", (req, res) => {
  const db = getDB();
  res.json(db.settings);
});

app.put("/api/settings", (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// 2. Products
app.get("/api/products", (req, res) => {
  const db = getDB();
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const db = getDB();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    ...req.body,
    stock: Number(req.body.stock || 0),
    costPrice: Number(req.body.costPrice || 0),
    price: Number(req.body.price || 0),
    promoPrice: req.body.promoPrice ? Number(req.body.promoPrice) : null,
    weight: Number(req.body.weight || 0),
    minStock: Number(req.body.minStock || 5),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : true,
  };

  db.products.push(newProduct);

  // Record Stock Log
  const stockLog: StockLog = {
    id: `log-${Date.now()}`,
    productId: newProduct.id,
    productName: newProduct.name,
    type: "in",
    quantity: newProduct.stock,
    reason: "Pendaftaran produk baru",
    createdAt: new Date().toISOString()
  };
  db.stockLogs.unshift(stockLog);

  saveDB(db);
  res.status(201).json({ success: true, product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const db = getDB();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const oldProduct = db.products[index];
  const updatedProduct: Product = {
    ...oldProduct,
    ...req.body,
    stock: Number(req.body.stock ?? oldProduct.stock),
    costPrice: Number(req.body.costPrice ?? oldProduct.costPrice),
    price: Number(req.body.price ?? oldProduct.price),
    promoPrice: req.body.promoPrice === null ? null : (req.body.promoPrice ? Number(req.body.promoPrice) : oldProduct.promoPrice),
    weight: Number(req.body.weight ?? oldProduct.weight),
    minStock: Number(req.body.minStock ?? oldProduct.minStock),
  };

  db.products[index] = updatedProduct;

  // Handle stock movement logs if discrepancy occurs
  const stockDiff = updatedProduct.stock - oldProduct.stock;
  if (stockDiff !== 0) {
    const stockLog: StockLog = {
      id: `log-${Date.now()}`,
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      type: stockDiff > 0 ? "in" : "out",
      quantity: Math.abs(stockDiff),
      reason: req.body.stockReason || "Koreksi stok manual oleh administrator",
      createdAt: new Date().toISOString()
    };
    db.stockLogs.unshift(stockLog);
  }

  saveDB(db);
  res.json({ success: true, product: updatedProduct });
});

app.delete("/api/products/:id", (req, res) => {
  const db = getDB();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Soft delete / Filter out
  const removed = db.products.splice(index, 1)[0];

  // Stock Log for wipe out
  const stockLog: StockLog = {
    id: `log-${Date.now()}`,
    productId: removed.id,
    productName: removed.name,
    type: "out",
    quantity: removed.stock,
    reason: "Penghapusan produk (stok ditiadakan)",
    createdAt: new Date().toISOString()
  };
  db.stockLogs.unshift(stockLog);

  saveDB(db);
  res.json({ success: true, message: "Product deleted" });
});

// 3. Orders
app.get("/api/orders", (req, res) => {
  const db = getDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = getDB();

  // Create Invoice number (INV-YYYYMMDD-XXXX)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `INV-${yyyy}${mm}${dd}`;

  const countToday = db.orders.filter(o => o.invoice.startsWith(prefix)).length;
  const seqSuffix = String(countToday + 1).padStart(4, "0");
  const invoiceNum = `${prefix}-${seqSuffix}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    invoice: invoiceNum,
    createdAt: new Date().toISOString(),
    customerName: req.body.customerName,
    customerPhone: req.body.customerPhone,
    address: req.body.address,
    items: req.body.items,
    shippingCourier: req.body.shippingCourier,
    shippingCost: Number(req.body.shippingCost || 0),
    shippingOption: req.body.shippingOption || "REG",
    estimatedDays: req.body.estimatedDays || "2-3 Hari",
    paymentMethod: req.body.paymentMethod,
    paymentBank: req.body.paymentBank || null,
    paymentStatus: req.body.paymentMethod === "COD" ? "unpaid" : "unpaid",
    status: "pending",
    totalWeight: Number(req.body.totalWeight || 0),
    subtotal: Number(req.body.subtotal || 0),
    discountAmount: Number(req.body.discountAmount || 0),
    total: Number(req.body.total || 0),
    notes: req.body.notes || "",
    trackingNo: null,
    voucherCode: req.body.voucherCode || null
  };

  db.orders.unshift(newOrder);

  // Decrement Stock & create log for each item
  newOrder.items.forEach(item => {
    const pIdx = db.products.findIndex(p => p.id === item.productId);
    if (pIdx !== -1) {
      const p = db.products[pIdx];
      p.stock = Math.max(0, p.stock - item.quantity);

      const stockLog: StockLog = {
        id: `log-${Date.now()}-${item.productId}`,
        productId: p.id,
        productName: p.name,
        type: "out",
        quantity: item.quantity,
        reason: `Pembelian online, Invoice #${newOrder.invoice}`,
        createdAt: new Date().toISOString()
      };
      db.stockLogs.unshift(stockLog);
    }
  });

  saveDB(db);
  res.status(201).json({ success: true, order: newOrder });
});

app.put("/api/orders/:id", (req, res) => {
  const db = getDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const oldOrder = db.orders[index];
  const updatedOrder: Order = {
    ...oldOrder,
    ...req.body
  };

  // If status changed to cancelled of failed, retrieve stocks back
  if ((updatedOrder.status === "cancelled" || updatedOrder.status === "failed") &&
      (oldOrder.status !== "cancelled" && oldOrder.status !== "failed")) {
    updatedOrder.items.forEach(item => {
      const pIdx = db.products.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        const p = db.products[pIdx];
        p.stock += item.quantity;

        const stockLog: StockLog = {
          id: `log-${Date.now()}-${item.productId}`,
          productId: p.id,
          productName: p.name,
          type: "in",
          quantity: item.quantity,
          reason: `Pembatalan order, Invoice #${updatedOrder.invoice}`,
          createdAt: new Date().toISOString()
        };
        db.stockLogs.unshift(stockLog);
      }
    });
  }

  db.orders[index] = updatedOrder;
  saveDB(db);
  res.json({ success: true, order: updatedOrder });
});

app.delete("/api/orders/:id", (req, res) => {
  const db = getDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  db.orders.splice(index, 1);
  saveDB(db);
  res.json({ success: true });
});

// 4. Promos
app.get("/api/promos", (req, res) => {
  const db = getDB();
  res.json(db.promos);
});

app.post("/api/promos", (req, res) => {
  const db = getDB();
  const isEditing = req.body.id;

  if (isEditing) {
    const idx = db.promos.findIndex(p => p.id === req.body.id);
    if (idx !== -1) {
      db.promos[idx] = {
        ...db.promos[idx],
        ...req.body,
        value: Number(req.body.value),
        minPurchase: Number(req.body.minPurchase)
      };
      saveDB(db);
      return res.json({ success: true, promo: db.promos[idx] });
    }
  }

  const newPromo: Promo = {
    id: `prm-${Date.now()}`,
    code: req.body.code.toUpperCase(),
    type: req.body.type,
    value: Number(req.body.value || 0),
    minPurchase: Number(req.body.minPurchase || 0),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : true,
    description: req.body.description || ""
  };

  db.promos.push(newPromo);
  saveDB(db);
  res.status(201).json({ success: true, promo: newPromo });
});

app.delete("/api/promos/:id", (req, res) => {
  const db = getDB();
  db.promos = db.promos.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 5. Stock Logs
app.get("/api/stock-logs", (req, res) => {
  const db = getDB();
  res.json(db.stockLogs);
});

// 6. Blogs
app.get("/api/blog-posts", (req, res) => {
  const db = getDB();
  res.json(db.blogPosts);
});

app.get("/api/blog", (req, res) => {
  const db = getDB();
  res.json(db.blogPosts);
});

app.post("/api/blog-posts", (req, res) => {
  const db = getDB();
  const isEditing = req.body.id;

  if (isEditing) {
    const idx = db.blogPosts.findIndex(b => b.id === req.body.id);
    if (idx !== -1) {
      db.blogPosts[idx] = {
        ...db.blogPosts[idx],
        ...req.body,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      };
      saveDB(db);
      return res.json({ success: true, post: db.blogPosts[idx] });
    }
  }

  const newPost: BlogPost = {
    id: `blg-${Date.now()}`,
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
    slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    createdAt: new Date().toISOString()
  };

  db.blogPosts.unshift(newPost);
  saveDB(db);
  res.status(201).json({ success: true, post: newPost });
});

app.post("/api/blog", (req, res) => {
  const db = getDB();
  const isEditing = req.body.id;

  if (isEditing) {
    const idx = db.blogPosts.findIndex(b => b.id === req.body.id);
    if (idx !== -1) {
      db.blogPosts[idx] = {
        ...db.blogPosts[idx],
        ...req.body,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      };
      saveDB(db);
      return res.json({ success: true, post: db.blogPosts[idx] });
    }
  }

  const newPost: BlogPost = {
    id: `blg-${Date.now()}`,
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
    slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    createdAt: new Date().toISOString()
  };

  db.blogPosts.unshift(newPost);
  saveDB(db);
  res.status(201).json({ success: true, post: newPost });
});

app.delete("/api/blog-posts/:id", (req, res) => {
  const db = getDB();
  db.blogPosts = db.blogPosts.filter(b => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.delete("/api/blog/:id", (req, res) => {
  const db = getDB();
  db.blogPosts = db.blogPosts.filter(b => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Live shipping courier simulation rate calculations for Biteship & Rajaongkir
app.post("/api/shipping/rates", (req, res) => {
  const { weight, destination } = req.body;
  const inputWeight = Number(weight || 250);

  // Simulated postage rates based on courier
  const baseRates: Record<string, { serviceName: string, multiplier: number, days: string }[]> = {
    "JNE": [
      { serviceName: "JNE OKE (Ongkos Kirim Ekonomis)", multiplier: 9, days: "3-5 Hari" },
      { serviceName: "JNE REG (Reguler)", multiplier: 12, days: "2-3 Hari" },
      { serviceName: "JNE YES (Yakin Esok Sampai)", multiplier: 22, days: "1 Hari" }
    ],
    "J&T": [
      { serviceName: "J&T EZ (Ekspres Reguler)", multiplier: 11, days: "2-3 Hari" },
      { serviceName: "J&T Super (Kilat)", multiplier: 19, days: "1-2 Hari" }
    ],
    "SiCepat": [
      { serviceName: "SiCepat SIUNTUNG", multiplier: 10, days: "2-3 Hari" },
      { serviceName: "SiCepat GOKIL (Kargo)", multiplier: 6, days: "4-7 Hari" },
      { serviceName: "SiCepat BEST (Besok Sampai)", multiplier: 18, days: "1 Hari" }
    ],
    "AnterAja": [
      { serviceName: "AnterAja Regular", multiplier: 10, days: "2-3 Hari" },
      { serviceName: "AnterAja NextDay", multiplier: 18, days: "1 Hari" }
    ],
    "Ninja Express": [
      { serviceName: "Ninja Standard", multiplier: 11, days: "2-4 Hari" }
    ],
    "Pos Indonesia": [
      { serviceName: "Pos Kilat Khusus", multiplier: 8, days: "2-5 Hari" },
      { serviceName: "Pos Nextday", multiplier: 17, days: "1-2 Hari" }
    ],
    "TIKI": [
      { serviceName: "TIKI REG (Reguler)", multiplier: 11, days: "2-3 Hari" },
      { serviceName: "TIKI ONS (Over Night Service)", multiplier: 19, days: "1 Hari" }
    ]
  };

  // Determine multiplier based on location factors
  let locFactor = 1.0;
  const destString = JSON.stringify(destination || "").toLowerCase();
  
  if (destString.includes("jakarta") || destString.includes("dki")) {
    locFactor = 0.8;
  } else if (destString.includes("jawa barat") || destString.includes("banten") || destString.includes("bandung")) {
    locFactor = 0.95;
  } else if (destString.includes("jawa tengah") || destString.includes("jawa timur") || destString.includes("yogyakarta")) {
    locFactor = 1.1;
  } else if (destString.includes("sumatera")) {
    locFactor = 1.4;
  } else if (destString.includes("kalimantan") || destString.includes("sulawesi")) {
    locFactor = 1.8;
  } else if (destString.includes("papua") || destString.includes("maluku") || destString.includes("ntt") || destString.includes("ntb")) {
    locFactor = 2.4;
  }

  const results: any[] = [];
  const weightKg = Math.ceil(inputWeight / 1000);

  Object.entries(baseRates).forEach(([courier, services]) => {
    services.forEach((srv) => {
      const priceVal = Math.round(srv.multiplier * 1000 * weightKg * locFactor);
      results.push({
        courier,
        service: srv.serviceName,
        price: priceVal,
        estimatedDays: srv.days
      });
    });
  });

  res.json({ rates: results });
});

// Setup server and dev configurations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qeiza Mall Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
