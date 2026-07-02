/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product, StockLog } from "../../types";
import { Search, Plus, Trash2, Edit2, AlertTriangle, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle, X } from "lucide-react";

const compressImage = (file: File, callback: (result: string) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Set max dimension to 1000px for web display
      const MAX_WIDTH = 1000;
      const MAX_HEIGHT = 1000;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Export to highly compressed JPEG with 0.75 quality (greatly reduces file size)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        callback(dataUrl);
      } else {
        callback(event.target?.result as string);
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

interface AdminStockProps {
  products: Product[];
  stockLogs: StockLog[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (id: string, updates: Partial<Product> & { stockReason?: string }) => void;
  onDeleteProduct: (id: string) => void;
}

export default function AdminStock({ products, stockLogs, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminStockProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "logs">("inventory");

  // State for adding manual stock adjustment modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState(1);
  const [adjustType, setAdjustType] = useState<"in" | "out">("in");
  const [adjustReason, setAdjustReason] = useState("");

  // Product Editor/Creator form states (combined modal)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [subCategory, setSubCategory] = useState("");
  const [costPrice, setCostPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [weight, setWeight] = useState(250); // grams
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [label, setLabel] = useState<Product["label"]>("biasa");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // New customizable fields for Tokopedia Mall Verification & Shipping City and Variant Photos
  const [isMall, setIsMall] = useState(true);
  const [shippingCity, setShippingCity] = useState("Jakarta Pusat");
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [tempColorImage, setTempColorImage] = useState<string | null>(null);
  const [variantPrices, setVariantPrices] = useState<Record<string, { price: number; promoPrice: number | null; stock: number; costPrice?: number }>>({});

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleOpenEditor = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreating(false);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode);
    setDescription(prod.description);
    setCategory(prod.category);
    setSubCategory(prod.subCategory || "");
    setCostPrice(prod.costPrice);
    setPrice(prod.price);
    setPromoPrice(prod.promoPrice);
    setWeight(prod.weight);
    setStock(prod.stock);
    setMinStock(prod.minStock);
    setImages(prod.images || []);
    setColors(prod.colors || []);
    setSizes(prod.sizes || []);
    setLabel(prod.label);
    setVideoUrl(prod.videoUrl || null);
    setIsMall(prod.isMall !== false);
    setShippingCity(prod.shippingCity || "Jakarta Pusat");
    setColorImages(prod.colorImages || {});
    setTempColorImage(null);
    setVariantPrices(prod.variantPrices || {});
  };

  const handleOpenCreator = () => {
    setEditingProduct(null);
    setIsCreating(true);
    setName("");
    setSku("");
    setBarcode("");
    setDescription("");
    setCategory("Fashion");
    setSubCategory("");
    setCostPrice(0);
    setPrice(0);
    setPromoPrice(null);
    setWeight(250);
    setStock(10);
    setMinStock(5);
    setImages([]);
    setColors(["Kombinasi"]);
    setSizes(["All Size"]);
    setLabel("baru");
    setVideoUrl(null);
    setIsMall(true);
    setShippingCity("Jakarta Pusat");
    setColorImages({});
    setTempColorImage(null);
    setVariantPrices({});
  };

  const getActiveVariantsList = () => {
    const list: string[] = [];
    const activeColors = colors.filter(c => c && c.trim() !== "");
    const activeSizes = sizes.filter(s => s && s.trim() !== "");
    
    if (activeColors.length > 0 && activeSizes.length > 0) {
      activeColors.forEach(c => {
        activeSizes.forEach(s => {
          if (c.trim() === "Kombinasi" && s.trim() === "All Size") {
            // skip
          } else if (c.trim() === "Kombinasi") {
            list.push(s.trim());
          } else if (s.trim() === "All Size") {
            list.push(c.trim());
          } else {
            list.push(`${c.trim()}-${s.trim()}`);
          }
        });
      });
    } else if (activeColors.length > 0) {
      activeColors.forEach(c => {
        if (c.trim() !== "Kombinasi") list.push(c.trim());
      });
    } else if (activeSizes.length > 0) {
      activeSizes.forEach(s => {
        if (s.trim() !== "All Size") list.push(s.trim());
      });
    }
    return list;
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku) {
      alert("Harap lengkapi setidaknya Nama & SKU Produk!");
      return;
    }

    // Filter out stale/inactive variant prices based on active combinations
    const activeVariants = getActiveVariantsList();
    const cleanedVariantPrices: Record<string, any> = {};
    if (variantPrices) {
      Object.entries(variantPrices).forEach(([k, v]) => {
        if (activeVariants.includes(k)) {
          cleanedVariantPrices[k] = v;
        }
      });
    }

    const payload = {
      name,
      sku,
      barcode,
      description,
      category,
      subCategory: subCategory || null,
      costPrice: Number(costPrice),
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      weight: Number(weight),
      stock: Number(stock),
      minStock: Number(minStock),
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"],
      colors,
      sizes,
      label,
      isActive: true,
      videoUrl: videoUrl,
      adVideoUrl: null,
      discount: promoPrice ? Math.round(((price - promoPrice) / price) * 100) : 0,
      isMall,
      shippingCity: shippingCity.trim() || "Jakarta Pusat",
      colorImages,
      variantPrices: cleanedVariantPrices
    };

    if (isCreating) {
      onAddProduct(payload);
      alert("Berhasil mendaftarkan produk baru!");
    } else if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
      alert("Detail produk berhasil diperbarui!");
    }

    setIsCreating(false);
    setEditingProduct(null);
  };

  const handleQuickAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const diff = Number(adjustQtyInput) * (adjustType === "in" ? 1 : -1);
    const nextStock = Math.max(0, adjustingProduct.stock + diff);

    onUpdateProduct(adjustingProduct.id, {
      stock: nextStock,
      stockReason: adjustReason.trim() || `Penyesuaian stok manual (${adjustType === "in" ? "Stok Masuk" : "Stok Rusak/Keluar"})`
    });

    setAdjustingProduct(null);
    setAdjustQtyInput(1);
    setAdjustReason("");
  };

  const handleAddColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed) {
      setColors([...colors, trimmed]);
      if (tempColorImage) {
        setColorImages(prev => ({ ...prev, [trimmed]: tempColorImage }));
      }
      setColorInput("");
      setTempColorImage(null);
    }
  };

  const handleAddSize = () => {
    if (sizeInput.trim()) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 no-print">
      {/* Sub Tabs controller */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "inventory" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          Katalog Stok & Barang
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "logs" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          Riwayat Transaksi Mutasi Stok
        </button>
      </div>

      {activeTab === "inventory" ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                required
                type="text"
                placeholder="Cari barang berdasarkan nama, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-250 bg-white rounded-2xl pl-10"
              />
              <Search className="absolute left-3.5 top-4 w-4 h-4 text-gray-400" />
            </div>

            <button
              id="add-product-trigger-btn"
              onClick={handleOpenCreator}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 shadow-sm"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Daftar Produk Baru</span>
            </button>
          </div>

          {/* Product Stocks ledger GRID table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100">
                    <th className="p-4 pl-6">Foto & Info Produk</th>
                    <th className="p-4">SKU / Kode SKU</th>
                    <th className="p-4">Kategori Produk</th>
                    <th className="p-4">Harga Modal</th>
                    <th className="p-4">Harga Jual</th>
                    <th className="p-4">Level Stok</th>
                    <th className="p-4 pr-6 text-right">Kelola Stok / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14 text-gray-400 font-medium">
                        Tidak ada komoditi terdaftar di gudang.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Photo details */}
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                            <img 
                              referrerPolicy="no-referrer"
                              src={p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">{p.name}</span>
                            <span className="text-[10px] font-mono text-gray-400 mt-0.5">Berat: {p.weight}g</span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="p-4 font-mono font-bold text-gray-800 uppercase tracking-wider">
                          {p.sku}
                        </td>

                        {/* Category */}
                        <td className="p-4 font-semibold text-gray-550">
                          {p.category}
                        </td>

                        {/* Cost Price */}
                        <td className="p-4 font-bold text-gray-900">
                          {formatIDR(p.costPrice)}
                        </td>

                        {/* Selling Price */}
                        <td className="p-4 font-bold text-emerald-600">
                          {formatIDR(p.promoPrice || p.price)}
                          {p.promoPrice && (
                            <span className="text-[9px] block text-gray-400 font-medium line-through">
                              {formatIDR(p.price)}
                            </span>
                          )}
                        </td>

                        {/* Inventory Levels */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                              p.stock <= p.minStock 
                                ? "bg-rose-50 text-rose-700 font-black border border-rose-100 animate-pulse" 
                                : "bg-emerald-50 text-emerald-800"
                            }`}>
                              {p.stock} pcs
                            </span>
                            {p.stock <= p.minStock && (
                              <span className="text-rose-500 font-semibold text-[10px] flex items-center gap-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 fill-current" />
                                <span>Tipis!</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] text-gray-400 mt-0.5 block"> सेफ्टी limit: {p.minStock} pcs</span>
                        </td>

                        {/* Actions buttons */}
                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Stock Adjust CTA */}
                            <button
                              onClick={() => {
                                setAdjustingProduct(p);
                                setAdjustType("in");
                                setAdjustQtyInput(1);
                              }}
                              className="px-2.5 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-gray-600 text-[10.5px] font-bold transition-colors"
                              title="Tambah/Kurang Stok"
                            >
                              Stok ±
                            </button>

                            {/* Standard Product Edit CTA */}
                            <button
                              onClick={() => handleOpenEditor(p)}
                              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg"
                              title="Edit Detail Barang"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Wipe complete commodity */}
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus produk "${p.name}" dari katalog? Semua data stock dan promo penjualan akan ditiadakan.`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* STOCK MUTATIONS LEDGER */
        <div id="stock-logs-ledger" className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100">
                  <th className="p-4 pl-6">Tanggal Transaksi</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Jenis Mutasi</th>
                  <th className="p-4">Banyak Perubahan</th>
                  <th className="p-4 pr-6">Pemicu & Alasan Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-gray-400 font-medium">
                      Belum terdapat catatan mutasi stok baru.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-4 pl-6 text-gray-400">
                        {new Date(log.createdAt).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {log.productName}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                          log.type === "in" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {log.type === "in" ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>STOK MASUK</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>STOK KELUAR</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 font-bold font-mono text-gray-950">
                        {log.type === "in" ? "+" : "-"}{log.quantity} Pcs
                      </td>
                      <td className="p-4 pr-6 text-gray-500 italic max-w-sm">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DIALOG A: Manual stock adjuster modal (Quick ±) */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleQuickAdjustStock} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button 
              type="button" 
              onClick={() => setAdjustingProduct(null)} 
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">KOREKSI MANUAL</span>
              <h3 className="text-base font-extrabold text-gray-900 mt-1">Ubah Stok "{adjustingProduct.name}"</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustType("in")}
                className={`py-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === "in" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "bg-white text-gray-500"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Stok Masuk (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustType("out")}
                className={`py-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === "out" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "bg-white text-gray-500"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Stok Keluar (-)</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Jumlah Pcs</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={adjustQtyInput}
                  onChange={(e) => setAdjustQtyInput(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm font-semibold p-3 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Alasan Penyesuaian</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Pengiriman barang PO, Rusak basah, dll"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Perbarui Inventaris & Catat Log
            </button>
          </form>
        </div>
      )}

      {/* DIALOG B: Expanded Product Creator & Editor Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveProduct} 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative space-y-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 flex items-center justify-center border"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block">QEIZA PRODUCT BUILDER</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {isCreating ? "Registrasi Produk Dagangan Baru" : `Ubah Detail "${editingProduct?.name}"`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form: text identifiers */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nama Produk Resmi</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Kemeja Linen Premium Sage"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">SKU (Stock Keeping Unit)</label>
                    <input
                      required
                      type="text"
                      placeholder="CTH: QZ-FSH-SGE"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Kode Barcode</label>
                    <input
                      type="text"
                      placeholder="Contoh: 8990132"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kategori Utama</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="Fashion">Fashion</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Peralatan Rumah">Peralatan Rumah</option>
                      <option value="Kecantikan">Kecantikan</option>
                      <option value="Aksesoris">Aksesoris</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Sub Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: Skincare, Kemeja"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kota Pengiriman Gudang</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta Pusat, Bandung..."
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center pl-1 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isMall}
                        onChange={(e) => setIsMall(e.target.checked)}
                        className="w-4.5 h-4.5 accent-emerald-500 rounded border-gray-300"
                      />
                      <span className="text-xs font-bold text-gray-700">Verifikasi Mall (Official Store)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Harga Modal (Rp)</label>
                    <input
                      required
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Harga Jual (Rp)</label>
                    <input
                      required
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Harga Promo (Rp)</label>
                    <input
                      type="number"
                      placeholder="Boleh kosong"
                      value={promoPrice || ""}
                      onChange={(e) => setPromoPrice(e.target.value ? Number(e.target.value) : null)}
                      className="w-full text-xs font-mono font-bold p-3 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Lengkap Produk</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tulis spesifikasi, keunggulan, material bahan, dll"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Form: Logistics and Gallery variants */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Stok Awal</label>
                    <input
                      required
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      disabled={!isCreating}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Batas Minimum</label>
                    <input
                      required
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Berat (Gram)</label>
                    <input
                      required
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Label Tagging</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value as any)}
                    className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="biasa">Normal / Biasa</option>
                    <option value="baru">New Arrival (BARU)</option>
                    <option value="bestseller font-bold">Best Selling (BESTSELLER)</option>
                    <option value="promo">Promo Diskon (PROMO)</option>
                  </select>
                </div>

                {/* File Upload for Images */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">Upload Foto Produk (File)</label>
                  <div className="border border-dashed border-gray-300 hover:border-[#03AC0E] rounded-xl p-4 bg-white text-center cursor-pointer transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          Array.from(files).forEach((file: any) => {
                            compressImage(file, (compressedBase64) => {
                              setImages((prev) => [...prev, compressedBase64]);
                            });
                          });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-500 block">Pilih File Foto (.png, .jpg, .jpeg)</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Maksimal total ukuran file 100MB. Seret & lepas atau klik untuk mencari berkas.</span>
                  </div>
                  
                  {/* Loaded images thumbnails */}
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {images.map((imgUrl, ix) => (
                        <div key={ix} className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden p-0.5 group shrink-0">
                          <img referrerPolicy="no-referrer" src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== ix))}
                            className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Upload for Video */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">Upload Video Demo Produk (File)</label>
                  <div className="border border-dashed border-gray-300 hover:border-[#03AC0E] rounded-xl p-4 bg-white text-center cursor-pointer transition-colors relative">
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => {
                        const file: any = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                              setVideoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-500 block">Pilih File Video (.mp4, .mov, .webm)</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Maksimal ukuran file 100MB, resolusi 1080p</span>
                  </div>
                  
                  {/* Loaded Video Indicator */}
                  {videoUrl && (
                    <div className="flex items-center gap-2 p-2 bg-[#E8F5E9] text-[#03AC0E] rounded-xl border border-[#C8E6C9] select-none text-xs font-bold">
                      <span className="text-sm">🎬</span>
                      <span className="flex-1 truncate">Video Produk Berhasil Diupload</span>
                      <button
                        type="button"
                        onClick={() => setVideoUrl(null)}
                        className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Colors Choice Input list */}
                <div className="bg-gray-50 p-4 rounded-2xl border space-y-3">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block font-bold">Varian Pilihan Warna & Foto</label>
                  
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-150">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Mint Cream, Sage..."
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        className="flex-1 text-xs font-semibold p-2.5 bg-white border border-gray-250 rounded-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Tambah Varian
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressImage(file, (compressedBase64) => {
                                setTempColorImage(compressedBase64);
                              });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-850 text-[10px] font-bold rounded-lg border cursor-pointer"
                        >
                          📷 Upload Foto Varian
                        </button>
                      </div>
                      
                      {tempColorImage ? (
                        <div className="flex items-center gap-1.5">
                          <img referrerPolicy="no-referrer" src={tempColorImage} alt="" className="w-6 h-6 object-cover rounded-md border" />
                          <span className="text-[10px] text-emerald-600 font-semibold">Foto siap ditambahkan</span>
                          <button type="button" onClick={() => setTempColorImage(null)} className="text-rose-500 font-bold text-xs hover:scale-110">✕</button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">Belum ada foto varian warna terpilih</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {colors.map((c, ix) => (
                      <span key={ix} className="text-[10px] bg-white border border-gray-200 font-bold text-gray-700 pl-2 pr-7 py-2 rounded-xl relative flex items-center gap-1.5 shadow-xs">
                        {colorImages[c] && (
                          <img referrerPolicy="no-referrer" src={colorImages[c]} alt="" className="w-5 h-5 object-cover rounded-md border" />
                        )}
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setColors(colors.filter((_, i) => i !== ix));
                            const nextImgs = { ...colorImages };
                            delete nextImgs[c];
                            setColorImages(nextImgs);
                          }}
                          className="absolute right-1 top-2.5 text-rose-500 text-[10px] font-black hover:scale-125 hover:text-rose-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sizes Choice Input list */}
                <div className="bg-gray-50 p-4 rounded-2xl border space-y-3">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block font-bold">Varian Pilihan Sizing</label>
                  <div className="flex gap-2 font-bold">
                    <input
                      type="text"
                      placeholder="Contoh: S, M, XL, 50ml, Standard..."
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-lg"
                    >
                      (+)
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s, ix) => (
                      <span key={ix} className="text-[10px] bg-white border font-bold text-gray-600 px-2 py-0.5 rounded-md relative pr-5">
                        {s}
                        <button
                          type="button"
                          onClick={() => setSizes(sizes.filter((_, i) => i !== ix))}
                          className="absolute right-1 top-1 text-rose-500 text-[8px] font-bold hover:scale-125"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Variant Prices Section */}
            {getActiveVariantsList().length > 0 && (
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4 my-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Atur Harga & Stok Per Varian</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Tentukan harga jual, harga modal, promo, dan stok spesifik untuk setiap pilihan variasi.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = getActiveVariantsList();
                      const next = { ...variantPrices };
                      list.forEach(v => {
                        if (!next[v]) {
                          next[v] = {
                            price: price || 0,
                            promoPrice: promoPrice || null,
                            stock: stock || 0,
                            costPrice: costPrice || 0
                          };
                        } else {
                          next[v] = {
                            ...next[v],
                            costPrice: next[v].costPrice ?? costPrice ?? 0
                          };
                        }
                      });
                      setVariantPrices(next);
                    }}
                    className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-wider bg-white px-3 py-2 rounded-lg border border-indigo-200 shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    ⚡ Salin dari Harga Utama
                  </button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {getActiveVariantsList().map((v) => {
                    const currentVariant = variantPrices[v] || { price: price || 0, promoPrice: promoPrice || null, stock: stock || 0, costPrice: costPrice || 0 };
                    return (
                      <div key={v} className="bg-white p-3.5 rounded-xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="min-w-0">
                          <span className="text-xs font-black text-zinc-700 uppercase bg-zinc-100 px-3 py-1.5 rounded-lg tracking-wider inline-block">
                            {v.replace("-", " / ")}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Cost price input */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Harga Modal Varian</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2.5 text-xs text-zinc-400 font-bold">Rp</span>
                              <input
                                type="number"
                                value={currentVariant.costPrice === undefined ? "" : currentVariant.costPrice}
                                onChange={(e) => {
                                  setVariantPrices({
                                    ...variantPrices,
                                    [v]: {
                                      ...currentVariant,
                                      costPrice: Number(e.target.value)
                                    }
                                  });
                                }}
                                placeholder="Contoh: 100000"
                                className="w-28 text-xs font-bold pl-8 pr-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-right"
                              />
                            </div>
                          </div>

                          {/* Jual price input */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Harga Jual Varian</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2.5 text-xs text-zinc-400 font-bold">Rp</span>
                              <input
                                type="number"
                                value={currentVariant.price || ""}
                                onChange={(e) => {
                                  setVariantPrices({
                                    ...variantPrices,
                                    [v]: {
                                      ...currentVariant,
                                      price: Number(e.target.value)
                                    }
                                  });
                                }}
                                placeholder="Contoh: 150000"
                                className="w-28 text-xs font-bold pl-8 pr-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-right"
                              />
                            </div>
                          </div>

                          {/* Promo price input */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Harga Promo Varian</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2.5 text-xs text-zinc-400 font-bold">Rp</span>
                              <input
                                type="number"
                                value={currentVariant.promoPrice === null ? "" : currentVariant.promoPrice}
                                onChange={(e) => {
                                  setVariantPrices({
                                    ...variantPrices,
                                    [v]: {
                                      ...currentVariant,
                                      promoPrice: e.target.value === "" ? null : Number(e.target.value)
                                    }
                                  });
                                }}
                                placeholder="Kosongkan jika tdk ada"
                                className="w-32 text-xs font-bold pl-8 pr-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-right"
                              />
                            </div>
                          </div>

                          {/* Stock input */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Stok Varian</span>
                            <input
                              type="number"
                              value={currentVariant.stock === undefined ? "" : currentVariant.stock}
                              onChange={(e) => {
                                setVariantPrices({
                                  ...variantPrices,
                                  [v]: {
                                    ...currentVariant,
                                    stock: Number(e.target.value)
                                  }
                                });
                              }}
                              placeholder="0"
                              className="w-16 text-xs font-bold px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              id="product-builder-submit-btn"
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-extrabold rounded-2xl transition-all shadow-md"
            >
              🚀 Simpan & Komit Produk Dagangan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
