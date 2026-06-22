/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order, OrderStatus } from "../types";
import { X, Search, Truck, MapPin, ClipboardList, CheckCircle2, Navigation, ShoppingBag } from "lucide-react";

interface OrderTrackingModalProps {
  orders: Order[];
  onClose: () => void;
  initialInvoice?: string;
  onUpdateOrderStatus?: (orderId: string, updates: Partial<Order>) => void;
}

export default function OrderTrackingModal({ orders, onClose, initialInvoice = "", onUpdateOrderStatus }: OrderTrackingModalProps) {
  const [invoiceInput, setInvoiceInput] = useState(initialInvoice);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(
    initialInvoice ? orders.find(o => o.invoice === initialInvoice) || null : null
  );
  const [searchError, setSearchError] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeOrder = selectedTrackOrder ? (orders.find(o => o.id === selectedTrackOrder.id) || selectedTrackOrder) : null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const code = invoiceInput.trim().toUpperCase();
    if (!code) return;

    const matched = orders.find(o => o.invoice.toUpperCase() === code || (o.trackingNo && o.trackingNo.toUpperCase() === code));
    if (!matched) {
      setSearchError("Pesanan atau Nomor Resi tidak ditemukan. Silakan periksa kembali.");
      setSelectedTrackOrder(null);
      return;
    }

    setSelectedTrackOrder(matched);
  };

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofImage) {
      alert("Silakan pilih foto atau screenshot bukti transfer terlebih dahulu.");
      return;
    }

    if (!onUpdateOrderStatus || !activeOrder) return;

    setIsUploading(true);
    try {
      onUpdateOrderStatus(activeOrder.id, {
        paymentProof: proofImage,
        status: "processing"
      });
      alert("Selesai! Bukti pembayaran berhasil diupload.\n\nStatus pesanan otomatis diupdate ke 'Diproses'. Admin Qeiza Mall segera memverifikasi kiriman Anda.");
      setProofImage(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi masalah saat mengupload bukti pembayaran.");
    } finally {
      setIsUploading(false);
    }
  };

  // Timeline Milestones based on status
  const getMilestones = (status: OrderStatus, trackingNo: string | null, courier: string) => {
    const list = [
      { id: "pending", title: "Menunggu Pembayaran", desc: "Pesanan masuk sistem Qeiza Mall.", activeAt: "Menerima", isDone: true },
      { id: "processing", title: "Pesanan Diproses", desc: "Verifikasi pembayaran & sedang disiapkan.", activeAt: "Admin", isDone: false },
      { id: "packaging", title: "Barang Dikemas", desc: "Sedang dikemas aman di Gudang Utama.", activeAt: "Warehouse", isDone: false },
      { id: "shipping", title: "Dalam Pengiriman", desc: `Diserahkan ke kurir ${courier} - Resi: ${trackingNo || "Menunggu Resi"}`, activeAt: "Logistics", isDone: false },
      { id: "completed", title: "Selesai Diterima", desc: "Barang telah sukses diterima oleh pembeli.", activeAt: "Customer", isDone: false }
    ];

    // Mark steps completed sequentially
    const statusIdxMap: Record<OrderStatus, number> = {
      "pending": 0,
      "processing": 1,
      "packaging": 2,
      "shipping": 3,
      "completed": 4,
      "cancelled": -1,
      "failed": -1
    };

    const currentIdx = statusIdxMap[status] ?? 0;
    
    return list.map((item, idx) => {
      return {
        ...item,
        isDone: currentIdx >= idx,
        isCurrent: currentIdx === idx,
      };
    });
  };

  return (
    <div id="tracking-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="tracking-modal-card" 
        className="bg-gray-100 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close trigger */}
        <button 
          id="tracking-modal-close"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10.5 h-10.5 rounded-full bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center shadow-md transition-colors border border-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Slogan */}
        <div className="text-center max-w-xl mx-auto">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold leading-none px-3.5 py-1.5 rounded-full uppercase tracking-widest block w-max mx-auto mb-3">
            Lacak Kiriman
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Cek Status Pesanan Secara Realtime</h2>
          <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1.5">
            Masukkan Nomor Invoice (cth: INV-20260621-0001) atau Nomor Resi Pengiriman untuk melacak pesanan Anda secara live.
          </p>
        </div>

        {/* Search form bar */}
        <form onSubmit={handleSearchOrder} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              required
              type="text"
              placeholder="Masukkan Nomor Invoice atau Suffix Resi..."
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
              className="w-full text-sm font-semibold p-4 border border-gray-250 bg-white rounded-2xl focus:outline-none focus:border-emerald-500 pl-11 shadow-xs"
            />
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            id="track-submit-btn"
            type="submit"
            className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-1"
          >
            <span>Lacak</span>
          </button>
        </form>

        {searchError && <p className="text-center text-xs text-rose-500 font-semibold">{searchError}</p>}

        {/* Active Order tracing elements */}
        {activeOrder ? (
          <div id="tracking-result-panel" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left box: Order parameters & Products (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
              <div className="border-b border-gray-50 pb-4">
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">Nomor Invoice</span>
                <h4 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">{activeOrder.invoice}</h4>
                <p className="text-[11px] text-gray-400 mt-1">Dibuat: {new Date(activeOrder.createdAt).toLocaleString("id-ID", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}</p>
              </div>

              {/* Recipient card summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Alamat Penerima</span>
                <p className="text-xs font-bold text-gray-900">{activeOrder.customerName} ({activeOrder.customerPhone})</p>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  {activeOrder.address.street}, {activeOrder.address.kelurahan}, Kec. {activeOrder.address.kecamatan}, {activeOrder.address.kabupaten}, {activeOrder.address.provinsi} {activeOrder.address.postalCode}
                </p>
              </div>

              {/* Items in purchase */}
              <div className="border-t border-gray-150 pt-4 space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Rincian Paket</span>
                <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                  {activeOrder.items.map((it, itIdx) => (
                    <div id={`track-item-card-${itIdx}`} key={itIdx} className="flex justify-between items-center text-xs">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-gray-800 line-clamp-1">{it.productName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Varian: {it.color || "-"} / {it.size || "-"} ({it.quantity} Pcs)</p>
                      </div>
                      <span className="font-bold text-gray-950">{formatIDR(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial calculations */}
              <div className="border-t border-gray-150 pt-4 text-xs space-y-1.5 bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span>Subtotal Belanja</span>
                  <span className="font-semibold">{formatIDR(activeOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir ({activeOrder.shippingCourier})</span>
                  <span className="font-semibold">{formatIDR(activeOrder.shippingCost)}</span>
                </div>
                {activeOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Potongan Diskon</span>
                    <span className="font-semibold">-{formatIDR(activeOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5 text-sm items-baseline">
                  <span>Total Transaksi</span>
                  <span className="text-emerald-600">{formatIDR(activeOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 pt-1 border-t border-gray-100">
                  <span>Cara Bayar:</span>
                  <span className="font-bold uppercase text-gray-700">{activeOrder.paymentMethod} {activeOrder.paymentBank ? `(${activeOrder.paymentBank})` : ""}</span>
                </div>
              </div>

              {/* Pembeli Unggah Bukti Transfer / Pembayaran */}
              {activeOrder.paymentMethod !== "COD" && (
                <div className="border border-emerald-100 bg-emerald-50/10 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Bukti Transfer Pembayaran</span>
                  
                  {activeOrder.paymentProof ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <span>✓ Bukti transfer berhasil dikirim</span>
                      </p>
                      <a href={activeOrder.paymentProof} target="_blank" rel="noreferrer" className="block relative group aspect-video w-32 border border-emerald-200 rounded-lg overflow-hidden bg-white shadow-xs">
                        <img src={activeOrder.paymentProof} alt="Bukti Transfer Pembeli" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-all">
                          Lihat Bukti
                        </div>
                      </a>
                      <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
                        Pesanan saat ini berada dalam antrian verifikasi Admin Qeiza Mall ("Diproses").
                      </p>
                    </div>
                  ) : activeOrder.status === "pending" ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-gray-650 font-medium leading-relaxed">
                        Silakan unggah foto/screenshot bukti transfer bank atau scan QRIS Anda di bawah ini untuk memulai proses pengemasan:
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          id="buyer-payment-proof-upload"
                          accept="image/*"
                          onChange={handleProofImageChange}
                          className="text-[11px] font-medium text-gray-650 cursor-pointer w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        
                        {proofImage && (
                          <div className="relative w-max border border-emerald-200 rounded-lg p-0.5 bg-white">
                            <img src={proofImage} alt="Preview Bukti Transfer" className="w-20 h-20 object-cover rounded-md" />
                            <button
                              type="button"
                              onClick={() => setProofImage(null)}
                              className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs animate-bounce"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={!proofImage || isUploading}
                          onClick={handleSubmitProof}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-xs uppercase tracking-wider cursor-pointer"
                        >
                          {isUploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">
                      Lakukan transaksi pembayaran terlebih dahulu. Jika butuh bantuan hubungi WhatsApp Support.
                    </p>
                  )}
                </div>
              )}

              {/* Foto Resi Fisik / Bukti Pengiriman */}
              {activeOrder.trackingImage && (
                <div className="border-t border-gray-150 pt-4 space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Foto Resi Fisik / Bukti Pengiriman</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1.5 shadow-xs">
                    <a href={activeOrder.trackingImage} target="_blank" rel="noreferrer" className="block relative group aspect-video w-full bg-zinc-100">
                      <img src={activeOrder.trackingImage} alt="Foto Resi Pengiriman" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        Klik untuk memperbesar gambar
                      </div>
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    *Foto fisik di atas diunggah langsung oleh admin gudang sebagai bukti penyerahan barang belanjaan ke pihak kurir/logistik.
                  </p>
                </div>
              )}
            </div>

            {/* Right box: Timeline tracker & Graphics (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              {/* Timeline layout card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                    <span>Perjalanan Paket Live</span>
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    activeOrder.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    activeOrder.status === "cancelled" || activeOrder.status === "failed" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                    "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {activeOrder.status === "completed" ? "Selesai Diterima" :
                     activeOrder.status === "cancelled" ? "Transaksi Dibatalkan" :
                     activeOrder.status === "failed" ? "Transaksi Gagal" :
                     activeOrder.status === "shipping" ? "Dalam Pengiriman" : "Sedang Diproses"}
                  </span>
                </div>

                {/* Cancelled/Failed explanation banner */}
                {(activeOrder.status === "cancelled" || activeOrder.status === "failed") ? (
                  <div className="p-4 bg-rose-50 border border-rose-100/60 rounded-xl">
                    <h5 className="text-xs font-bold text-rose-800 uppercase">Informasi Pembatalan</h5>
                    <p className="text-xs text-rose-700 mt-1">
                      Mohon maaf, transaksi Anda dibatalkan atau terindikasi gagal. Silakan lakukan pembelian ulang atau hubungi layanan bantuan WhatsApp kami.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6.5 space-y-6 border-l-2 border-gray-100">
                    {getMilestones(activeOrder.status, activeOrder.trackingNo, activeOrder.shippingCourier).map((mil, mIdx) => (
                      <div id={`milestone-step-${mil.id}`} key={mil.id} className="relative">
                        {/* Bullets pointers */}
                        <span className={`absolute -left-[35px] top-0.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                          mil.isCurrent ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30 scale-125" :
                          mil.isDone ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-300"
                        }`}>
                          {mil.isDone && !mil.isCurrent && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </span>

                        <div>
                          <h4 className={`text-xs font-extrabold ${mil.isCurrent ? "text-emerald-700" : mil.isDone ? "text-gray-900" : "text-gray-400"}`}>
                            {mil.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{mil.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulated Map Route Graphic */}
              {activeOrder.status === "shipping" && activeOrder.trackingNo && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="relative h-28 w-full bg-slate-50 border-dashed border border-slate-250 rounded-xl flex items-center justify-between px-8">
                    {/* SVG map visual lines decoration */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
                        <MapPin className="w-4 h-4 fill-emerald-100" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-extrabold">Warehouse</span>
                    </div>

                    {/* Animated connector road */}
                    <div className="flex-1 h-1.5 mx-2 bg-gray-150 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-2/3 bg-emerald-500 rounded-full animate-pulse" />
                      <Truck className="absolute left-[54%] -top-1 w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                    </div>

                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <Navigation className="w-4 h-4 rotate-45" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-extrabold">Pembeli</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-[10.5px] text-emerald-700 font-semibold bg-emerald-50/60 p-2 rounded-lg">
                      📍 Kurir sedang mengantar ke kecamatan {activeOrder.address.kecamatan}, {activeOrder.address.kabupaten}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty placeholder look */
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center max-w-xl mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="font-extrabold text-gray-800 text-sm">Belum Ada Pencarian Lacak</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Silakan masukkan ID invoice atau nomor resi Anda pada kotak pencarian di atas untuk mendapatkan rincian pelacakan kiriman dan audit pesanan secara lengkap.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
