/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { Star, ShieldAlert, BadgePercent, ArrowRight, MapPin, Truck } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onBuyImmediate: (product: Product) => void;
  key?: any;
}

export default function ProductCard({ product, onViewDetail, onBuyImmediate }: ProductCardProps) {
  const storeTemplate = (typeof window !== "undefined" && (localStorage.getItem("qeiza_store_template") === "emerald" ? "tokopedia" : localStorage.getItem("qeiza_store_template")) as "tokopedia" | "cream" | "midnight") || "tokopedia";
  
  const st = {
    tokopedia: {
      cardBg: "bg-white",
      border: "border-gray-250/20 shadow-xs",
      textPrimary: "text-[#212121]",
      textSecondary: "text-[#6D7588]",
      accentText: "text-[#03AC0E]",
      buttonPrimary: "bg-[#03AC0E] hover:bg-[#028F0B] text-white",
      buttonSecondary: "bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#03AC0E]",
    },
    cream: {
      cardBg: "bg-white",
      border: "border-[#EFEBE4]",
      textPrimary: "text-[#2B231D]",
      textSecondary: "text-[#75685B]",
      accentText: "text-[#C2410C]",
      buttonPrimary: "bg-[#C2410C] hover:bg-[#9A3412] text-white",
      buttonSecondary: "bg-[#F3EFE9] hover:bg-[#EAE4DC] hover:text-[#C2410C] text-[#75685B]",
    },
    midnight: {
      cardBg: "bg-[#1F2937]",
      border: "border-gray-800",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-400",
      accentText: "text-cyan-400",
      buttonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black",
      buttonSecondary: "bg-gray-800 hover:bg-gray-750 hover:text-cyan-400 text-slate-300",
    }
  }[storeTemplate];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const hasDiscount = product.promoPrice !== null && product.promoPrice < product.price;
  const displayPrice = hasDiscount ? product.promoPrice! : product.price;
  const originalPrice = product.price;
  
  // Calculate percentage dynamically
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0;

  return (
    <div 
      id={`prod-card-${product.id}`}
      className={`group ${st.cardBg} rounded-2xl overflow-hidden border ${st.border} hover:shadow-lg transition-all duration-300 flex flex-col h-full relative select-none bg-white`}
    >
      {/* Discount Ribbon in Top-Left Corner matching screenshot (e.g. 72%) */}
      {hasDiscount && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-[#FF5A5F] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
          {discountPercent}%
        </span>
      )}

      {/* Image Gallery Trigger (Vibrant square container as screenshot) */}
      <div 
        className="w-full aspect-square relative bg-white overflow-hidden cursor-pointer border-b border-gray-100"
        onClick={() => onViewDetail(product)}
      >
        <img 
          referrerPolicy="no-referrer"
          src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Instant Buy hover action */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-gray-900 px-4 py-2 rounded-xl text-[11px] font-black shadow-md">
            Lihat Detail
          </span>
        </div>
      </div>

      {/* Product details as listed in User Screenshot */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag Category */}
          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-widest block mb-1">
            {product.category}
          </span>
          <h3 
            onClick={() => onViewDetail(product)}
            className="text-[12px] font-bold text-gray-800 line-clamp-2 cursor-pointer leading-snug tracking-tight hover:text-zinc-950 transition-colors"
          >
            {product.name}
          </h3>
          
          {/* Crisp Price tags - tight format */}
          <div className="mt-1.5 space-y-0.5">
            <div className="text-[15px] font-black text-[#212121] leading-none">
              {formatIDR(displayPrice).replace(/\s/g, "")}
            </div>
            
            {/* Promo cashback indicator beneath price (e.g. Hemat s.d 15% Pakai Bonus) */}
            <div className="text-[10px] font-bold text-[#FF5A5F]">
              Hemat s.d {discountPercent || 10}% Pakai Bonus
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-gray-100/60">
          {/* Ratings & Sold counts (e.g. 4.9 • 10rb+ terjual) */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-2">
            <div className="flex text-amber-400 items-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>4.8</span>
            <span className="text-gray-300">•</span>
            <span>10rb+ terjual</span>
          </div>

          {/* Store Verification & Location (e.g. Jakarta Pusat, Beas Ongkir) */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 select-none">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-3.5 h-3.5 bg-zinc-950 text-white rounded-full flex items-center justify-center font-black text-[8px]">✓</span>
              <span className="font-extrabold text-zinc-950">Mall</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="truncate font-semibold text-gray-500">Jakarta Pusat</span>
          </div>

          {/* Action grid button */}
          <div className="mt-3 flex items-center gap-1.5">
            <button
              id={`quick-buy-${product.id}`}
              disabled={product.stock === 0}
              onClick={() => onBuyImmediate(product)}
              className="flex-1 text-center py-2.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-[11px] font-bold transition-all"
            >
              Beli
            </button>
            <button
              id={`details-view-${product.id}`}
              onClick={() => onViewDetail(product)}
              className="w-9 h-9 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 flex items-center justify-center transition-all text-xs border border-zinc-200/40"
              title="Detail"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
