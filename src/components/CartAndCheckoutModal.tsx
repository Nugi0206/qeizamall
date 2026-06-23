/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product, Promo, Address, OrderItem, Settings } from "../types";
import { X, Trash2, Plus, Minus, Tag, ShieldCheck, Truck, CreditCard, ChevronDown, CheckCircle, Info, ShoppingBag, ArrowLeft, HelpCircle } from "lucide-react";

interface CartAndCheckoutModalProps {
  cartItems: {
    product: Product;
    quantity: number;
    color: string | null;
    size: string | null;
  }[];
  settings: Settings;
  promos: Promo[];
  onUpdateQty: (idx: number, newQty: number) => void;
  onRemoveItem: (idx: number) => void;
  onClose: () => void;
  onCheckoutSuccess: (orderData: any) => void;
}

export default function CartAndCheckoutModal({
  cartItems,
  settings,
  promos,
  onUpdateQty,
  onRemoveItem,
  onClose,
  onCheckoutSuccess
}: CartAndCheckoutModalProps) {
  // Checkout Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Address details state
  const [street, setStreet] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Promo Engine
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState("");

  // Shipping cost states
  const [loadingRates, setLoadingRates] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<any | null>(null);

  const getFallbackRates = () => {
    const couriers = settings?.activeCouriers && settings.activeCouriers.length > 0 
      ? settings.activeCouriers 
      : ["JNE", "J&T", "SiCepat"];
    
    return couriers.map((courier) => {
      let price = 15000;
      if (courier.toUpperCase().includes("JNE")) price = 15000;
      else if (courier.toUpperCase().includes("J&T")) price = 16000;
      else if (courier.toUpperCase().includes("SICEPAT")) price = 14000;
      else if (courier.toUpperCase().includes("GOJEK") || courier.toUpperCase().includes("GRAB")) price = 25000;
      
      return {
        courier: courier,
        service: "Reguler (Manual)",
        price: price,
        estimatedDays: "2-4 Hari"
      };
    });
  };

  // Populate standard flat rates immediately on load so the checkout is never blocked
  useEffect(() => {
    const fallback = getFallbackRates();
    setShippingRates(fallback);
    setSelectedRate(fallback[0]);
  }, [settings]);

  // Payments
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Transfer Bank" | "QRIS">("Transfer Bank");
  const [selectedBank, setSelectedBank] = useState<string>("");

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [showSummaryOnMobile, setShowSummaryOnMobile] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const totalWeight = cartItems.reduce((acc, item) => acc + item.product.weight * item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const activePrice = item.product.promoPrice !== null ? item.product.promoPrice : item.product.price;
    return acc + activePrice * item.quantity;
  }, 0);

  // Trigger postage rates fetching when province/kabupaten/weight updates
  useEffect(() => {
    if (provinsi.trim().length > 2 && kabupaten.trim().length > 2 && totalWeight > 0) {
      fetchShippingRates();
    }
  }, [provinsi, kabupaten, totalWeight]);

  const fetchShippingRates = async () => {
    setLoadingRates(true);
    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: totalWeight,
          destination: { street, kelurahan, kecamatan, kabupaten, provinsi, postalCode }
        })
      });
      const data = await response.json();
      if (data.rates && data.rates.length > 0) {
        // Filter rates based on Admin enabled couriers in dashboard!
        const filteredRates = data.rates.filter((rate: any) => 
          settings.activeCouriers.some((activeC) => rate.courier.toLowerCase().includes(activeC.toLowerCase()))
        );
        if (filteredRates.length > 0) {
          setShippingRates(filteredRates);
          setSelectedRate(filteredRates[0]);
        } else {
          const fallback = getFallbackRates();
          setShippingRates(fallback);
          if (!selectedRate) setSelectedRate(fallback[0]);
        }
      } else {
        const fallback = getFallbackRates();
        setShippingRates(fallback);
        if (!selectedRate) setSelectedRate(fallback[0]);
      }
    } catch (err) {
      console.error("Error fetching rates", err);
      const fallback = getFallbackRates();
      setShippingRates(fallback);
      if (!selectedRate) setSelectedRate(fallback[0]);
    } finally {
      setLoadingRates(false);
    }
  };

  // Promo Apply logic
  const handleApplyPromo = () => {
    setPromoError("");
    if (!promoCode.trim()) return;

    const matched = promos.find(p => p.code.toUpperCase() === promoCode.toUpperCase().trim() && p.isActive);
    if (!matched) {
      setPromoError("Kode Promo tidak valid atau sudah kadaluarsa.");
      setAppliedPromo(null);
      return;
    }

    if (subtotal < matched.minPurchase) {
      setPromoError(`Minimal belanja Rp ${matched.minPurchase.toLocaleString("id-ID")} untuk kode ini.`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(matched);
  };

  const removeAppliedPromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  // Calculate discount figures
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else if (appliedPromo.type === "fixed") {
      discountAmount = appliedPromo.value;
    } else if (appliedPromo.type === "free_shipping" && selectedRate) {
      discountAmount = Math.min(selectedRate.price, appliedPromo.value);
    }
  }

  const shippingCost = selectedRate ? selectedRate.price : 0;
  const finalTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  // Auto set bank choice if bank transfers is active
  useEffect(() => {
    if (settings.activePayments.transferBank.isActive && settings.activePayments.transferBank.accounts.length > 0) {
      setSelectedBank(settings.activePayments.transferBank.accounts[0].bankName);
    }
  }, [settings]);

  // Handle Checkout submission
  const handleSumbitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    if (!customerName || !customerPhone || !street || !kelurahan || !kecamatan || !kabupaten || !provinsi || !postalCode) {
      alert("Silakan lengkapi seluruh formulir pengiriman sebelum melanjutkan checkout!");
      return;
    }

    if (!selectedRate) {
      alert("Silakan pilih ekspedisi kurir yang sesuai!");
      return;
    }

    setLoadingCheckout(true);

    const itemsPayload: OrderItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.promoPrice !== null ? item.product.promoPrice : item.product.price,
      costPrice: item.product.costPrice,
      quantity: item.quantity,
      color: item.color,
      size: item.size
    }));

    const addressPayload: Address = {
      street,
      kelurahan,
      kecamatan,
      kabupaten,
      provinsi,
      postalCode
    };

    const payload = {
      customerName,
      customerPhone,
      address: addressPayload,
      items: itemsPayload,
      shippingCourier: selectedRate.courier,
      shippingCost,
      shippingOption: selectedRate.service,
      estimatedDays: selectedRate.estimatedDays,
      paymentMethod,
      paymentBank: paymentMethod === "Transfer Bank" ? selectedBank : null,
      totalWeight,
      subtotal,
      discountAmount,
      total: finalTotal,
      notes,
      voucherCode: appliedPromo ? appliedPromo.code : null
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        onCheckoutSuccess(data.order);
      } else {
        alert("Gagal memproses pesanan: " + (data.error || "Kesalahan internal"));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung dengan server checkout.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const OrderSummaryPanel = () => (
    <div className="space-y-6">
      {/* Product List */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {cartItems.map((item, idx) => {
          const activePrice = item.product.promoPrice !== null ? item.product.promoPrice : item.product.price;
          return (
            <div key={idx} className="flex items-center gap-4 py-1 relative">
              {/* Product Image with Shopify corner badge layout */}
              <div className="w-16 h-16 rounded-lg border border-zinc-200 bg-white relative flex-shrink-0">
                <img 
                  referrerPolicy="no-referrer"
                  src={item.product.images[0]} 
                  alt={item.product.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
                <span className="absolute -top-2.5 -right-2.5 bg-zinc-500/90 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {item.quantity}
                </span>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-zinc-800 truncate pr-6 leading-tight">
                  {item.product.name}
                </h4>
                {/* Variant tags */}
                {(item.color || item.size) && (
                  <p className="text-[10px] text-zinc-450 mt-1 uppercase tracking-wider font-semibold">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </p>
                )}

                {/* Edit Qty in summary row */}
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 border border-zinc-200 bg-white rounded-md p-0.5 scale-90 origin-left">
                    <button 
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      className="w-4 h-4 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] font-bold text-zinc-800 w-3 text-center">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      className="w-4 h-4 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="text-[10px] text-zinc-400 hover:text-red-600 font-semibold uppercase tracking-wider transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {/* Product Price */}
              <span className="text-xs font-bold text-zinc-900 shrink-0">
                {formatIDR(activePrice * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Coupon / Promo Field */}
      <div className="border-t border-zinc-200/80 pt-5 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Kode diskon"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full text-xs font-semibold py-3 px-4 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 uppercase tracking-wider"
            />
            <Tag className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={handleApplyPromo}
            className="px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-md transition-colors uppercase tracking-widest"
          >
            Terapkan
          </button>
        </div>
        {promoError && <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>}
        {appliedPromo && (
          <div className="flex items-center justify-between text-xs text-zinc-800 bg-zinc-100 px-3 py-2 rounded-md border border-zinc-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Tag className="w-3.5 h-3.5 text-zinc-650" />
              <span>{appliedPromo.code}</span>
              <span className="text-[10px] text-zinc-500 font-normal">({appliedPromo.description})</span>
            </span>
            <button 
              type="button" 
              onClick={removeAppliedPromo}
              className="text-zinc-400 hover:text-zinc-900 font-bold transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Pricing Ledger */}
      <div className="border-t border-zinc-200/80 pt-5 space-y-3">
        <div className="flex justify-between text-xs text-zinc-500 font-medium">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-800">{formatIDR(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-xs text-zinc-500 font-medium">
          <span>Berat Total Kirim</span>
          <span className="font-mono text-zinc-600">{(totalWeight / 1000).toFixed(2)} kg</span>
        </div>

        <div className="flex justify-between text-xs text-zinc-500 font-medium pb-1">
          <span>Pengiriman</span>
          <span className="text-zinc-700">
            {selectedRate ? formatIDR(shippingCost) : <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Dihitung pada tahap berikutnya</span>}
          </span>
        </div>

        {appliedPromo && discountAmount > 0 && (
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>Diskon Promosi</span>
            <span className="font-bold text-zinc-900">-{formatIDR(discountAmount)}</span>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-200/80 flex justify-between items-center">
          <div>
            <span className="text-sm font-black text-zinc-900 block leading-none">Total</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1 block">IDR Rupiah</span>
          </div>
          <span className="text-xl font-black text-zinc-950 tracking-tight">{formatIDR(finalTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 bg-white md:bg-zinc-900/65 md:backdrop-blur-sm z-50 overflow-y-auto outline-none select-none">
      <div 
        id="checkout-modal-card" 
        className="min-h-screen bg-white max-w-7xl mx-auto flex flex-col md:flex-row relative"
      >
        {/* Back / Close button for the full screen modal experience */}
        <button 
          id="checkout-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 left-4 md:left-8 z-40 flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-wider p-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Toko</span>
        </button>

        {/* ==============================================
            LEFT PANEL: Shopify-style Checkout Forms (60%)
            ============================================== */}
        <div className="w-full md:w-[58%] lg:w-[62%] px-4 py-20 pb-16 sm:px-8 lg:px-16 bg-white flex flex-col justify-between max-h-none">
          <div className="max-w-xl w-full mx-auto space-y-8">
            
            {/* Store Branding Header */}
            <div className="space-y-2 border-b border-zinc-150 pb-5">
              <span className="font-black text-2xl tracking-tighter text-zinc-950 font-sans block uppercase">QEIZA MALL</span>
              
              {/* Shopify typical breadcrumbs */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <span className="text-zinc-950">Keranjang</span>
                <span>/</span>
                <span className="text-zinc-950">Informasi</span>
                <span>/</span>
                <span className="text-zinc-450">Pengiriman</span>
                <span>/</span>
                <span>Pembayaran</span>
              </div>
            </div>

            {/* Mobile-only Collapsible Order Summary Accordion (Exactly like Shopify Mobile Checkout) */}
            <div className="md:hidden border-b border-zinc-250 py-3 bg-zinc-50 -mx-4 px-4 sticky top-0 z-30 shadow-xs">
              <button 
                type="button" 
                onClick={() => setShowSummaryOnMobile(!showSummaryOnMobile)}
                className="w-full flex justify-between items-center text-xs font-bold text-zinc-700"
              >
                <span className="flex items-center gap-1.5 text-zinc-900">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{showSummaryOnMobile ? "Sembunyikan ringkasan pesanan" : "Tampilkan ringkasan pesanan"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSummaryOnMobile ? "rotate-180" : ""}`} />
                </span>
                <span className="text-sm font-black text-zinc-900">{formatIDR(finalTotal)}</span>
              </button>
              {showSummaryOnMobile && (
                <div className="mt-4 pt-4 border-t border-zinc-200 transition-all duration-200">
                  <OrderSummaryPanel />
                </div>
              )}
            </div>

            {/* The Checkout fields form */}
            <form onSubmit={handleSumbitCheckout} className="space-y-6">
              
              {/* BLOCK 1: Kontak Informasi */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Kontak Penerima</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="Nama Lengkap"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="tel"
                      placeholder="Nomor WhatsApp (Contoh: 08123..)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 2: Alamat Pengiriman */}
              <div className="space-y-3 pt-4 border-t border-zinc-150">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Alamat Pengiriman</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      required
                      type="text"
                      placeholder="Alamat Jalan, Blok & Nomor Rumah"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Provinsi (Contoh: Jawa Barat)"
                      value={provinsi}
                      onChange={(e) => setProvinsi(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Kabupaten / Kota (Kota Bandung)"
                      value={kabupaten}
                      onChange={(e) => setKabupaten(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Kecamatan"
                      value={kecamatan}
                      onChange={(e) => setKecamatan(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Kelurahan"
                      value={kelurahan}
                      onChange={(e) => setKelurahan(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Kode Pos"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Catatan Pengiriman (Opsional: warna cadangan, titipkan barang ke ...)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 3: Biteship Live Courier Rates Selector */}
              <div className="space-y-3 pt-4 border-t border-zinc-150">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Metode Pengiriman</h3>
                  <span className="text-[9px] bg-zinc-950 text-white font-black px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono">
                    Biteship API
                  </span>
                </div>

                {loadingRates ? (
                  <div className="py-8 bg-zinc-50 rounded-md border border-zinc-200 flex flex-col items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Menghitung tarif ongkos kirim otomatis...</span>
                  </div>
                ) : shippingRates.length === 0 ? (
                  <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-md flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Silakan tulis **Provinsi** & **Kabupaten / Kota** di formulir atas untuk memicu perhitungan kurir otomatis yang didukung Biteship.
                    </p>
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-md divide-y divide-zinc-200 overflow-hidden shadow-xs">
                    {shippingRates.map((rate, rIdx) => (
                      <label
                        key={rIdx}
                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                          selectedRate && selectedRate.service === rate.service && selectedRate.courier === rate.courier
                            ? "bg-zinc-50"
                            : "hover:bg-zinc-50/40 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingRate"
                            className="accent-zinc-950 w-4 h-4"
                            checked={selectedRate && selectedRate.service === rate.service && selectedRate.courier === rate.courier}
                            onChange={() => setSelectedRate(rate)}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">{rate.courier}</span>
                              <span className="text-[10px] text-zinc-400 font-medium font-sans">({rate.service})</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">Estimasi sampai: {rate.estimatedDays}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-zinc-900">
                          {formatIDR(rate.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* BLOCK 4: Metode Pembayaran (Clean Modern Style) */}
              <div className="space-y-3 pt-4 border-t border-zinc-150">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Metode Pembayaran</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {settings.activePayments.cod && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`py-3 px-4 rounded-md border text-xs font-extrabold transition-all uppercase tracking-wider ${
                        paymentMethod === "COD"
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      Bayar COD
                    </button>
                  )}

                  {settings.activePayments.transferBank.isActive && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Transfer Bank")}
                      className={`py-3 px-4 rounded-md border text-xs font-extrabold transition-all uppercase tracking-wider ${
                        paymentMethod === "Transfer Bank"
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      Transfer Bank
                    </button>
                  )}

                  {settings.activePayments.qris.isActive && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("QRIS")}
                      className={`py-3 px-4 rounded-md border text-xs font-extrabold transition-all uppercase tracking-wider ${
                        paymentMethod === "QRIS"
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      Scan QRIS
                    </button>
                  )}
                </div>

                {/* Sub-block options details */}
                <div className="pt-2 bg-white rounded-md mt-2">
                  {paymentMethod === "Transfer Bank" && settings.activePayments.transferBank.isActive && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Pilih Rekening Tujuan</label>
                        <div className="relative">
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full text-xs font-bold p-3 bg-white border border-zinc-200 rounded-md focus:outline-none appearance-none cursor-pointer pr-10"
                          >
                            {settings.activePayments.transferBank.accounts.map((acc, aIdx) => (
                              <option key={aIdx} value={acc.bankName}>
                                {acc.bankName} - No: {acc.accountNo} ({acc.holderName})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      {settings.activePayments.transferBank.accounts.find(a => a.bankName === selectedBank) && (
                        <div className="bg-white p-4 rounded-md border border-zinc-200 space-y-2">
                          <p className="text-[10px] text-zinc-450 uppercase font-black tracking-widest">Instruksi Rekening:</p>
                          {(() => {
                            const tgt = settings.activePayments.transferBank.accounts.find(a => a.bankName === selectedBank)!;
                            return (
                              <div className="text-xs text-zinc-800 space-y-1">
                                <div>Bank Tujuan: <strong className="font-extrabold text-zinc-950">{tgt.bankName}</strong></div>
                                <div>Nomor Rekening: <strong className="font-mono text-sm text-zinc-950 font-bold select-all tracking-wide">{tgt.accountNo}</strong></div>
                                <div>Atas Nama: <strong className="font-semibold text-zinc-800">{tgt.holderName}</strong></div>
                              </div>
                            );
                          })()}
                          <p className="text-[10px] text-zinc-400 leading-snug">
                            *Harap lakukan transfer sesuai nominal tagihan akhir. Pesanan akan segera diproses setelah konfirmasi manual oleh admin.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "QRIS" && settings.activePayments.qris.isActive && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md flex flex-col items-center justify-center gap-3">
                      <div className="w-40 aspect-square rounded-md overflow-hidden bg-white p-2 border border-zinc-200 flex items-center justify-center shadow-xs">
                        <img 
                          referrerPolicy="no-referrer"
                          src={settings.activePayments.qris.qrisUrl} 
                          alt="Scan QRIS Qeiza Mall" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div className="text-center">
                        <h5 className="text-[11px] font-black text-zinc-800 uppercase tracking-wider">QRIS Gateway</h5>
                        <p className="text-[10px] text-zinc-400 max-w-xs leading-normal mt-1">
                          Scan QRIS resmi Qeiza Mall di atas via ShopeePay, GoPay, OVO, Dana, LinkAja atau m-Banking Anda.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "COD" && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-zinc-950 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Cash on Delivery (COD)</h5>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                          Bayar langsung secara tunai ke petugas kurir eksklusif saat kiriman tiba di kediaman Anda.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FINAL SUBMIT ACTION BUTTON */}
              <button
                id="finalize-checkout-btn"
                type="submit"
                disabled={loadingCheckout || cartItems.length === 0}
                className="w-full py-4.5 bg-zinc-950 hover:bg-neutral-800 disabled:bg-zinc-300 text-white font-black text-xs uppercase tracking-widest rounded-md transition-all shadow-md flex items-center justify-center gap-2 mt-8"
              >
                {loadingCheckout ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sistem Memproses Pesanan Anda...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span>Selesaikan Pemesanan ({formatIDR(finalTotal)})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ==============================================
            RIGHT PANEL: Sticky Side Order Summary & Ledger (40%)
            ============================================== */}
        <div className="hidden md:block w-full md:w-[42%] lg:w-[38%] bg-zinc-50 px-6 py-20 pb-16 sm:px-8 lg:px-12 border-l border-zinc-200">
          <div className="max-w-md w-full mx-auto sticky top-20">
            <h3 className="text-xs font-black text-zinc-450 uppercase tracking-widest mb-6 font-sans">Ringkasan Pembelian</h3>
            <OrderSummaryPanel />
            
            {/* Shopify standard footer trust badge */}
            <div className="mt-12 pt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Enskripsi SSL 256-bit Aman</span>
              </span>
              <span>Qeiza Mall © 2026</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
