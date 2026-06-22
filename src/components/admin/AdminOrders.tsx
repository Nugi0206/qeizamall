/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order, OrderStatus } from "../../types";
import { Search, Filter, Printer, RefreshCw, Truck, Clipboard, Banknote, Edit, Eye, X, CheckSquare, Trash2 } from "lucide-react";

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => Promise<boolean>;
}

export default function AdminOrders({ orders, onUpdateOrderStatus, onDeleteOrder }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // States for updating tracking info inside selected order
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState("");
  const [trackingImageInput, setTrackingImageInput] = useState<string | null>(null);

  const handleTrackingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTrackingImageInput(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // States for printer template render trigger
  const [printType, setPrintType] = useState<"invoice" | "label" | "slip" | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Status Badge styling helper
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-blue-50 text-blue-700 border border-blue-100";
      case "processing": return "bg-orange-50 text-orange-700 border border-orange-100";
      case "packaging": return "bg-amber-50 text-amber-700 border border-amber-100";
      case "shipping": return "bg-purple-50 text-purple-700 border border-purple-100";
      case "completed": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-700 border border-rose-100";
      case "failed": return "bg-red-50 text-red-700 border border-red-100";
      default: return "bg-gray-150 text-gray-700";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Menunggu Bayar";
      case "processing": return "Diproses";
      case "packaging": return "Dikemas";
      case "shipping": return "Dikirim";
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      case "failed": return "Transaksi Gagal";
      default: return status;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.invoice.toUpperCase().includes(searchQuery.toUpperCase()) ||
      o.customerName.toUpperCase().includes(searchQuery.toUpperCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle tracking submission
  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    onUpdateOrderStatus(selectedOrder.id, {
      trackingNo: trackingInput.trim() || null,
      shippingCourier: courierInput.trim() || selectedOrder.shippingCourier,
      trackingImage: trackingImageInput
    });

    // Sync selected states
    setSelectedOrder({
      ...selectedOrder,
      trackingNo: trackingInput.trim() || null,
      shippingCourier: courierInput.trim() || selectedOrder.shippingCourier,
      trackingImage: trackingImageInput
    });

    alert("Nomor resi & kurir pengiriman berhasil diperbarui!");
  };

  // Status transitions
  const handleTransitionStatus = (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;

    const updates: Partial<Order> = { status: nextStatus };
    
    // Automatically flag payment status if order goes to completed or shipping (for COD)
    if (nextStatus === "completed") {
      updates.paymentStatus = "paid";
    }

    onUpdateOrderStatus(selectedOrder.id, updates);
    setSelectedOrder({ ...selectedOrder, ...updates });
  };

  const handlePrint = (type: "invoice" | "label" | "slip", order: Order) => {
    setPrintOrder(order);
    setPrintType(type);
    
    // Allow React state to flush and re-render the view, then load browser print dialog!
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const handleDeleteClick = async (orderId: string, invoice: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan dengan Invoice ${invoice} secara permanen dari database?`)) {
      const success = await onDeleteOrder(orderId);
      if (success) {
        alert(`Pesanan ${invoice} berhasil dihapus.`);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        alert(`Gagal menghapus pesanan ${invoice}.`);
      }
    }
  };

  return (
    <>
      <div className="space-y-6 no-print">
      {/* Search & Filter Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <input
            required
            type="text"
            placeholder="Cari Pesanan (Nama penerima, invoice, wa...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold p-3.5 border border-gray-255 bg-gray-50 rounded-2xl focus:outline-none focus:border-emerald-500 pl-10"
          />
          <Search className="absolute left-3.5 top-4 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 border p-1 rounded-xl text-xs font-bold">
            <span className="text-gray-400 px-2 pl-2">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2 py-1 bg-white border rounded-lg text-xs"
            >
              <option value="ALL">Semua Pesanan</option>
              <option value="pending">Menunggu Bayar</option>
              <option value="processing">Diproses</option>
              <option value="packaging">Dikemas</option>
              <option value="shipping">Dikirim</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid/Table layout */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100">
                <th className="p-4 pl-6">Nomor Invoice</th>
                <th className="p-4">Hubungan Pelanggan</th>
                <th className="p-4">Tanggal Pesan</th>
                <th className="p-4">Model & Jumlah Item</th>
                <th className="p-4">Total Tagihan</th>
                <th className="p-4">Logistics</th>
                <th className="p-4">Status & Bayar</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400 font-medium">
                    Tidak ditemukan data riwayat pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Invoice ID */}
                    <td className="p-4 pl-6">
                      <span className="font-mono font-extrabold block text-gray-950 truncate max-w-28">{o.invoice}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">{o.paymentMethod}</span>
                    </td>
                    
                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-bold text-gray-900 line-clamp-1">{o.customerName}</p>
                      <p className="font-mono text-[10px] text-emerald-600 mt-0.5">{o.customerPhone}</p>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      <div className="font-semibold text-gray-950">
                        {new Date(o.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit", minute: "2-digit"
                        })} WIB
                      </div>
                    </td>

                    {/* Quantity & brief product summary */}
                    <td className="p-4 max-w-44">
                      <p className="font-semibold line-clamp-1 text-gray-800">{o.items[0]?.productName || "Produk"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">
                        {o.items.reduce((acc, it) => acc + it.quantity, 0)} Items total
                      </p>
                    </td>

                    {/* Total Pay value */}
                    <td className="p-4 font-black text-gray-950 whitespace-nowrap">
                      {formatIDR(o.total)}
                    </td>

                    {/* Logistics Courier */}
                    <td className="p-4">
                      <p className="font-extrabold text-[#111827] uppercase tracking-tight">{o.shippingCourier}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide truncate max-w-32">{o.shippingOption}</p>
                    </td>

                    {/* Fulfilment Status & Payments status indicator badges */}
                    <td className="p-4 whitespace-nowrap space-y-1">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider block w-max ${getStatusBadgeClass(o.status)}`}>
                        {getStatusLabel(o.status)}
                      </span>
                      <span className={`text-[9px] font-mono uppercase block ${
                        o.paymentStatus === "paid" ? "text-emerald-600 font-extrabold" : "text-amber-600 font-bold"
                      }`}>
                        {o.paymentStatus === "paid" ? "✓ Terbayar" : "⚡ Belum Lunas"}
                      </span>
                    </td>

                    {/* Actions dropdown quick triggers */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setTrackingInput(o.trackingNo || "");
                            setCourierInput(o.shippingCourier);
                            setTrackingImageInput(o.trackingImage || null);
                          }}
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl"
                          title="Review & Update Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Printers triggers inside cell */}
                        <button
                          onClick={() => handlePrint("invoice", o)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg"
                          title="Cetak Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Danger delete trigger */}
                        <button
                          onClick={() => handleDeleteClick(o.id, o.invoice)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* DETAILED DIALOG MODAL: Edit fulfilment and track numbers (Backoffice ERP style) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 flex items-center justify-center border"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title details */}
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider block w-max">
                  ERP ORDER CONTROL
                </span>
                <span className="text-[10px] bg-zinc-100 text-zinc-650 font-bold px-3 py-1 rounded-full uppercase tracking-wider block w-max">
                  📅 {new Date(selectedOrder.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} • ⏰ {new Date(selectedOrder.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                  <span>Rincian Transaksi {selectedOrder.invoice}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(selectedOrder.id, selectedOrder.invoice)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pesanan</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
              {/* Product items lists list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Barang Belanjaan</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it, idx) => (
                    <div id={`order-detail-row-${idx}`} key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex-1 pr-3">
                        <p className="font-bold text-gray-900 line-clamp-1">{it.productName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Varian: {it.color || "-"} / {it.size || "-"} ({it.quantity} Pcs)</p>
                      </div>
                      <span className="font-bold text-gray-900 whitespace-nowrap">{formatIDR(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Details & address layout */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Informasi Pengiriman</h4>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-700 space-y-2">
                  <p>Nama: <strong className="font-bold">{selectedOrder.customerName}</strong></p>
                  <p>WhatsApp: <strong className="font-mono text-emerald-600 font-semibold">{selectedOrder.customerPhone}</strong></p>
                  <p className="leading-normal font-sans text-gray-500">
                    Alamat: {selectedOrder.address.street}, {selectedOrder.address.kelurahan}, Kec. {selectedOrder.address.kecamatan}, {selectedOrder.address.kabupaten}, {selectedOrder.address.provinsi} {selectedOrder.address.postalCode}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-[11px] bg-amber-50 rounded p-1.5 text-amber-700 border border-amber-100">
                      📝 Catatan: "{selectedOrder.notes}"
                    </p>
                  )}
                  {selectedOrder.paymentProof && (
                    <div className="mt-3 pt-3 border-t border-gray-150">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bukti Transfer Pembeli (TF):</p>
                      <a href={selectedOrder.paymentProof} target="_blank" rel="noreferrer" className="block relative group aspect-video w-32 border rounded-lg overflow-hidden bg-white shadow-xs">
                        <img src={selectedOrder.paymentProof} alt="Bukti Transfer Pembeli" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-all">
                          Lihat Detail
                        </div>
                      </a>
                    </div>
                  )}
                  {selectedOrder.trackingImage && (
                    <div className="mt-3 pt-3 border-t border-gray-150">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bukti Foto Resi Manual:</p>
                      <a href={selectedOrder.trackingImage} target="_blank" rel="noreferrer" className="block relative group aspect-video w-32 border rounded-lg overflow-hidden bg-white">
                        <img src={selectedOrder.trackingImage} alt="Bukti Resi" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-all">
                          Lihat Detail
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fulfilment Status Transitioning Actions and triggers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Alur Proses & Transisi Fulfilment</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTransitionStatus("pending")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "pending" ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Menunggu Pembayaran
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status === "cancelled"}
                  onClick={() => handleTransitionStatus("processing")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "processing" ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/10" : "bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  Proses Penjual
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status === "cancelled"}
                  onClick={() => handleTransitionStatus("packaging")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "packaging" ? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/10" : "bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  Kemas Barang
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status === "cancelled"}
                  onClick={() => handleTransitionStatus("shipping")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "shipping" ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/10" : "bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  Kirim (Input Resi)
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status === "cancelled"}
                  onClick={() => handleTransitionStatus("completed")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "completed" ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10" : "bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  Selesai Diterima
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status === "completed"}
                  onClick={() => handleTransitionStatus("cancelled")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === "cancelled" ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/10" : "bg-white text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  }`}
                >
                  Batalkan Order
                </button>
              </div>
            </div>

            {/* WhatsApp CRM Portal Section */}
            <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 rounded-md bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider">CRM</span>
                <span className="text-xs font-bold text-emerald-800">WhatsApp Follow-Up & Notifikasi Pembeli</span>
              </div>
              <p className="text-[11px] text-emerald-700/85 leading-normal">
                Kirim pesan konfirmasi otomatis sesuai status transaksi pesanan ini kepada pembeli lewat WhatsApp dengan format profesional.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    let cleaned = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                    if (cleaned.startsWith("0")) {
                      cleaned = "62" + cleaned.slice(1);
                    }
                    const totalFormatted = "Rp " + selectedOrder.total.toLocaleString("id-ID");
                    const message = `Halo Kak ${selectedOrder.customerName}, kami dari Qeiza Mall ingin mengonfirmasi pesanan Kakak dengan invoice *${selectedOrder.invoice}* senilai *${totalFormatted}*.\n\nApakah pembayaran sudah ditransfer Kak? Boleh dikirimkan bukti transfernya jika sudah ya. Terima kasih! 🙏`;
                    window.open(`https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">💸 Tagihan Pembayaran</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Kirim penagihan transfer</p>
                  </div>
                  <span className="text-emerald-600 text-[11px] font-bold shrink-0">Hubungi ➜</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let cleaned = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                    if (cleaned.startsWith("0")) {
                      cleaned = "62" + cleaned.slice(1);
                    }
                    const message = `Halo Kak ${selectedOrder.customerName}, pesanan Kakak dengan invoice *${selectedOrder.invoice}* telah kami terima pembayaran/konfirmasinya dan saat ini sedang *dalam proses pengemasan* oleh tim gudang Qeiza Mall.\n\nKami akan segera menginfokan resi kiriman jika paket sudah diserahkan ke kurir. Terima kasih! 📦🛍️`;
                    window.open(`https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">📦 Sedang Dikemas</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Kirim info progres kemasan</p>
                  </div>
                  <span className="text-emerald-600 text-[11px] font-bold shrink-0">Hubungi ➜</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let cleaned = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                    if (cleaned.startsWith("0")) {
                      cleaned = "62" + cleaned.slice(1);
                    }
                    const resi = selectedOrder.trackingNo || "belum diinput";
                    const kurir = selectedOrder.shippingCourier || "kurir mitra";
                    const message = `Halo Kak ${selectedOrder.customerName}, kabar baik! Pesanan Kakak dengan invoice *${selectedOrder.invoice}* telah diserahkan kepada kurir pengiriman.\n\nEkspedisi: *${kurir}*\nNo. Resi: *${resi}*\n\nKakak dapat memantau estimasi perjalanan paket melalui menu lacak pesanan pada web Qeiza Mall. Terima kasih! 🚚💨`;
                    window.open(`https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">🚚 Info Pengiriman (Resi)</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Notifikasi resi logistik</p>
                  </div>
                  <span className="text-emerald-600 text-[11px] font-bold shrink-0">Hubungi ➜</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let cleaned = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                    if (cleaned.startsWith("0")) {
                      cleaned = "62" + cleaned.slice(1);
                    }
                    const message = `Halo Kak ${selectedOrder.customerName}, pesanan Kakak dengan invoice *${selectedOrder.invoice}* telah dinyatakan *Selesai & Diterima*.\n\nTerima kasih banyak telah berbelanja di Qeiza Mall! Semoga barangnya memuaskan dan awet ya Kak. Ditunggu pesanan berikutnya! 😊🙏🛍️`;
                    window.open(`https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`, "_blank");
                  }}
                  className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">🌟 Pesanan Selesai</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Ucapkan terima kasih & ulasan</p>
                  </div>
                  <span className="text-emerald-600 text-[11px] font-bold shrink-0">Hubungi ➜</span>
                </button>
              </div>
            </div>

            {/* Tracking detail logs editor form */}
            <form onSubmit={handleSaveTracking} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Nomor Resi & Ekspedisi Logistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">No Resi Pengiriman (Live status tracing)</label>
                  <input
                    type="text"
                    placeholder="Contoh: JNEJT183021950"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Kurir Pengirim</label>
                  <input
                    type="text"
                    placeholder="Contoh: JNE, J&T, SiCepat"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 api-key-safe uppercase tracking-widest block mb-1.5">Foto Resi Fisik / Bukti Pengiriman (Format JPG/PNG)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 border border-gray-200 rounded-xl">
                    <input
                      type="file"
                      id="tracking-receipt-file-upload"
                      accept="image/*"
                      onChange={handleTrackingImageChange}
                      className="text-xs font-medium text-gray-700 cursor-pointer w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-emerald-50 hover:file:text-emerald-700"
                    />
                    {trackingImageInput && (
                      <div className="relative shrink-0 border border-emerald-100 rounded-lg p-0.5 bg-emerald-50/20">
                        <img src={trackingImageInput} alt="Preview Resi" className="w-14 h-14 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setTrackingImageInput(null)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gray-950 hover:bg-black text-white text-xs font-bold transition-all"
              >
                Simpan Detail Logistics
              </button>
            </form>

            {/* Print Action Links list panel representation */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5">
              <button
                onClick={() => handlePrint("invoice", selectedOrder)}
                className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Invoice</span>
              </button>
              <button
                onClick={() => handlePrint("label", selectedOrder)}
                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Cetak Label Kurir</span>
              </button>
              <button
                onClick={() => handlePrint("slip", selectedOrder)}
                className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Cetak Packing Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* RENDER DYNAMIC HIDDEN MONOCHROME PRINT DOCUMENTS COPIES (only visible on print mode, e.g. .print-only class in global index.css) */}
      {printOrder && printType && (
        <div className="hidden print-only print-card p-8 font-sans text-gray-900 border border-black max-w-2xl mx-auto">
          {printType === "invoice" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b-2 border-dashed border-gray-400 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase">QEIZA MALL</h1>
                  <p className="text-xs font-bold">Belanja Mudah, Cepat, dan Terpercaya</p>
                  <p className="text-xs text-gray-500">Jakarta Utara, Indonesia</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold">INVOICE PENJUALAN</h2>
                  <p className="text-xs font-mono font-bold">{printOrder.invoice}</p>
                  <p className="text-xs">Tanggal: {new Date(printOrder.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold uppercase border-b pb-1">Toko Pengirim</h4>
                  <p className="mt-1"><strong>Qeiza Mall Store</strong></p>
                  <p>{printOrder.address.street}</p>
                </div>
                <div>
                  <h4 className="font-bold uppercase border-b pb-1">Tujuan Penerima</h4>
                  <p className="mt-1"><strong>{printOrder.customerName}</strong></p>
                  <p>{printOrder.customerPhone}</p>
                  <p className="line-clamp-2">{printOrder.address.street}, {printOrder.address.kelurahan}, Kec. {printOrder.address.kecamatan}, {printOrder.address.kabupaten}, {printOrder.address.provinsi} {printOrder.address.postalCode}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-black font-bold">
                    <th className="py-2">Nama Barang</th>
                    <th className="py-2">Varian</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Harga Satuan</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {printOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-semibold">{it.productName}</td>
                      <td className="py-2">{it.color || "-"} / {it.size || "-"}</td>
                      <td className="py-2 text-center">{it.quantity}</td>
                      <td className="py-2 text-right">{formatIDR(it.price)}</td>
                      <td className="py-2 text-right">{formatIDR(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-black pt-4 flex flex-col items-end text-xs space-y-1">
                <div>Subtotal: <strong>{formatIDR(printOrder.subtotal)}</strong></div>
                <div>Ongkir ({printOrder.shippingCourier} - {printOrder.shippingOption}): <strong>{formatIDR(printOrder.shippingCost)}</strong></div>
                {printOrder.discountAmount > 0 && <div>Potongan Diskon: <strong>-{formatIDR(printOrder.discountAmount)}</strong></div>}
                <div className="text-sm font-black pt-2">Total Pembayaran: {formatIDR(printOrder.total)}</div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-6 text-center text-[10px] text-gray-500">
                <p>Terima kasih telah berbelanja di Qeiza Mall!</p>
                <p>Silakan hubungi customer service kami jika membutuhkan jaminan retur barang atau bantuan tambahan.</p>
              </div>
            </div>
          )}

          {printType === "label" && (
            <div className="border-4 border-black p-5 max-w-md mx-auto space-y-4 rounded text-xs">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <h1 className="text-base font-black tracking-tight">QEIZA MALL LOGISTICS</h1>
                <span className="text-xl font-black font-mono border-2 border-black px-2 py-0.5 uppercase">
                  {printOrder.shippingCourier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-3">
                <div>
                  <h4 className="font-extrabold uppercase text-[10px] text-gray-500">Pengirim (Origin)</h4>
                  <p className="font-bold mt-1">Qeiza Mall Official</p>
                  <p className="text-[10px]">Logistics Depok, Jawa Barat 16411</p>
                  <p className="text-[10px] font-semibold">HP: 081234567890</p>
                </div>
                <div>
                  <h4 className="font-extrabold uppercase text-[10px] text-gray-500">Penerima (Destination)</h4>
                  <p className="font-bold mt-1">{printOrder.customerName}</p>
                  <p className="text-[10.5px] leading-relaxed mt-0.5">{printOrder.address.street}, {printOrder.address.kelurahan}, Kec. {printOrder.address.kecamatan}, {printOrder.address.kabupaten}, {printOrder.address.provinsi} {printOrder.address.postalCode}</p>
                  <p className="font-bold text-[10.5px]">HP: {printOrder.customerPhone}</p>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-black block">NOMOR INVOICE / RESI</span>
                  <span className="font-mono text-sm font-black mt-0.5 block">{printOrder.invoice}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 uppercase font-black block">BERADA DI BERAT</span>
                  <strong className="text-sm font-black">{(printOrder.totalWeight / 1000).toFixed(2)} kg</strong>
                </div>
              </div>

              {/* Barcode representation line */}
              <div className="border-2 border-black py-4 flex flex-col items-center justify-center font-mono text-[9px] rounded-lg tracking-widest bg-gray-50">
                ||||||||||||||||||||||||||||||||||||||||||||||
                <span className="mt-1 font-bold">{printOrder.trackingNo || printOrder.invoice}</span>
              </div>

              <div className="text-center font-bold text-sm bg-black text-white p-2 rounded tracking-wider uppercase">
                {printOrder.paymentMethod} - Tagihan COD / Transfer: {formatIDR(printOrder.total)}
              </div>
            </div>
          )}

          {printType === "slip" && (
            <div className="space-y-6">
              <div className="border-b-2 pb-3 border-black text-center">
                <h1 className="text-lg font-black uppercase tracking-wider">PACKING SLIP / WAREHOUSE PREPARE</h1>
                <p className="text-xs font-mono">{printOrder.invoice} – {new Date(printOrder.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="text-xs bg-gray-50 p-4 border rounded-xl flex justify-between">
                <div>
                  <p className="text-gray-550 font-semibold">Tujuan Penerima:</p>
                  <p className="font-bold mt-1">{printOrder.customerName} ({printOrder.customerPhone})</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-550 font-semibold">Ekspedisi Kurir:</p>
                  <p className="font-bold mt-1 text-emerald-600">{printOrder.shippingCourier} - {printOrder.shippingOption}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Checklist Barang Kemasan:</h3>
                <table className="w-full text-xs text-left border-collapse border">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 border">✓ Kemas</th>
                      <th className="p-2 border">Nama Produk (SKU)</th>
                      <th className="p-2 border">Warna</th>
                      <th className="p-2 border">Ukuran</th>
                      <th className="p-2 border text-center">Jumlah Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printOrder.items.map((it, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2.5 border text-center font-mono w-14">
                          [ &nbsp; &nbsp; ]
                        </td>
                        <td className="p-2.5 border font-semibold">{it.productName}</td>
                        <td className="p-2.5 border">{it.color || "-"}</td>
                        <td className="p-2.5 border font-mono">{it.size || "-"}</td>
                        <td className="p-2.5 border text-center font-extrabold">{it.quantity} Unit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-300 pt-8 flex justify-between text-xs font-semibold">
                <div>Petugas Warehouse: ...............................</div>
                <div>Kurir Pengambil: ...............................</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
