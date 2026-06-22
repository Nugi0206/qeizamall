/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Product } from "../types";
import { X, ShoppingBag, Send, CreditCard, ChevronLeft, ChevronRight, Play, Info } from "lucide-react";

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onInstantBuy: (product: Product, selectedColor: string | null, selectedSize: string | null) => void;
  contactPhone: string;
}

export default function ProductDetailModal({ product, allProducts, onClose, onInstantBuy, contactPhone }: ProductDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [showVideo, setShowVideo] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const hasDiscount = product.promoPrice !== null && product.promoPrice < product.price;
  const currentPrice = hasDiscount ? product.promoPrice! : product.price;
  const originalPrice = product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Find related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id && p.isActive)
    .slice(0, 3);

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // WhatsApp helper text trigger
  const handleWhatsAppOrder = () => {
    const textPreset = `Halo Qeiza Mall, saya tertarik dengan produk berikut:
- *Nama*: ${product.name}
- *Kategori*: ${product.category}
- *Pilihan Warna*: ${selectedColor || "-"}
- *Pilihan Ukuran*: ${selectedSize || "-"}
- *Harga*: ${formatIDR(currentPrice)}

Mohon info ketersediaan stoknya. Terima kasih!`;
    const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(textPreset)}`, "_blank");
  };

  return (
    <div id="detail-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="detail-modal-card" 
        className="bg-gray-50 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button top-right */}
        <button 
          id="detail-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/95 text-gray-700 hover:bg-white hover:text-black flex items-center justify-center shadow-md transition-colors border border-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT AREA: Image Slider & Video Embed (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between">
            <div className="space-y-4">
              <div id="hd-slider-container" className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                {showVideo && product.videoUrl ? (
                  product.videoUrl.startsWith("data:video/") || product.videoUrl.includes("/uploads/") || product.videoUrl.endsWith(".mp4") || product.videoUrl.startsWith("blob:") ? (
                    <video
                      src={product.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full aspect-square object-cover"
                    />
                  ) : (
                    <iframe
                      src={product.videoUrl}
                      title="Product video showcase"
                      className="w-full h-full aspect-square"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <img 
                    referrerPolicy="no-referrer"
                    src={product.images[activeImageIdx] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Left-right Chevron controllers */}
                {!showVideo && product.images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-colors border border-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-colors border border-gray-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Video Play Mode absolute button */}
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                      showVideo 
                        ? "bg-rose-600 text-white" 
                        : "bg-white text-gray-950 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{showVideo ? "Lihat Foto" : "Video Iklan"}</span>
                  </button>
                )}
              </div>

              {/* Slider thumb indexes */}
              {!showVideo && product.images.length > 1 && (
                <div className="flex gap-2 justify-center overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIdx === idx ? "border-emerald-500 scale-95" : "border-gray-200"
                      }`}
                    >
                      <img 
                        referrerPolicy="no-referrer"
                        src={img} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* General specification highlights */}
            <div className="mt-6 pt-5 border-t border-gray-100 hidden lg:block">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Tambahan</h4>
              <div className="space-y-2.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Kode Barang (SKU)</span>
                  <span className="font-mono text-gray-800 font-semibold">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span>Barcode</span>
                  <span className="font-mono text-gray-800 font-semibold">{product.barcode || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Berat</span>
                  <span className="text-gray-800 font-semibold">{(product.weight / 1000).toFixed(2)} kg ({product.weight} gram)</span>
                </div>
                <div className="flex justify-between">
                  <span>Status Garansi</span>
                  <span className="text-emerald-600 font-semibold">Resmi 100% Original</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: Core Product details panel (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* labels & titles */}
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                  {product.category} {product.subCategory ? `/ ${product.subCategory}` : ""}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 leading-tight tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price elements banner */}
              <div className="bg-gray-100/60 p-4.5 rounded-2xl flex items-center justify-between border border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Harga Penjualan</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-gray-950">
                      {formatIDR(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                        Hemat {discountPercent}%
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-xs text-gray-400 line-through mt-0.5">
                      Sebelumnya {formatIDR(originalPrice)}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Kondisi Stok</span>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold mt-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      Ready ({product.stock} Unit)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full font-bold mt-1">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      Habis Terjual
                    </span>
                  )}
                </div>
              </div>

              {/* Variants choice colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Pilihan Warna</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs font-semibold px-4.5 py-2.5 rounded-xl border transition-all ${
                          selectedColor === color 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants choice sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Pilihan Ukuran</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs font-semibold px-4.5 py-2.5 rounded-xl border transition-all ${
                          selectedSize === size 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description body */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Deskripsi Produk</label>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-gray-100 font-sans">
                  {product.description}
                </p>
              </div>

              {/* Mobile Spec Info Table */}
              <div className="lg:hidden p-4 rounded-2xl bg-white border border-gray-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">SKU</span>
                  <span className="font-mono font-semibold text-gray-800">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Berat Bruto</span>
                  <span className="font-semibold text-gray-800">{product.weight} gram</span>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                id="modal-direct-buy-btn"
                disabled={product.stock === 0}
                onClick={() => onInstantBuy(product, selectedColor, selectedSize)}
                className="flex-1 py-4.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[15px] transition-all shadow-lg hover:shadow-emerald-600/10 flex items-center justify-center gap-2.5 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Beli Sekarang (Checkout Cepat)</span>
              </button>
              
              <button
                id="modal-wa-buy-btn"
                onClick={handleWhatsAppOrder}
                className="py-4.5 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 font-extrabold text-[15px] transition-all border-2 border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5 rotate-[15deg] fill-current" />
                <span>Order via WA</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Automatic Related Products recommendation bar */}
        {relatedProducts.length > 0 && (
          <div id="related-panel" className="bg-white border-t border-gray-100 p-6 sm:p-8 rounded-b-3xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              <span>Rekomendasi Produk Terkait</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relHasDisc = rel.promoPrice !== null && rel.promoPrice < rel.price;
                const relPrice = relHasDisc ? rel.promoPrice! : rel.price;
                return (
                  <div 
                    id={`related-card-${rel.id}`}
                    key={rel.id}
                    className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-emerald-500/20 hover:bg-gray-50/50 cursor-pointer transition-all"
                    onClick={() => {
                      // Switch to looking at this related target
                      // Force updates inside parent container
                      onInstantBuy(rel, null, null); // Will trigger cart but we can also handle refresh in app level
                    }}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img 
                        referrerPolicy="no-referrer"
                        src={rel.images[0]} 
                        alt={rel.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">{rel.name}</h4>
                      <p className="text-xs font-bold text-emerald-600 mt-1">{formatIDR(relPrice)}</p>
                      <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{rel.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
