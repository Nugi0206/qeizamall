/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Order, Product, StockLog } from "../../types";
import { TrendingUp, DollarSign, ShoppingCart, Award, AlertTriangle, ArrowUpRight, Calendar, ArrowDownRight, RefreshCw, FileSpreadsheet } from "lucide-react";

interface AdminOverviewProps {
  orders: Order[];
  products: Product[];
  stockLogs: StockLog[];
}

export default function AdminOverview({ orders, products, stockLogs }: AdminOverviewProps) {
  const [filterRange, setFilterRange] = useState<"hari" | "minggu" | "bulan" | "tahun" | "custom">("bulan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Core KPIs calculations based on dates
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Low stock products warnings
  const lowStockThresholdProducts = products.filter(p => p.stock <= p.minStock);

  // Filter orders for active analytics range
  const filterOrdersByRange = () => {
    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      
      if (filterRange === "hari") {
        return orderTime >= startOfDay;
      }
      if (filterRange === "minggu") {
        const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        return orderTime >= oneWeekAgo;
      }
      if (filterRange === "bulan") {
        return orderTime >= startOfMonth;
      }
      if (filterRange === "tahun") {
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
        return orderTime >= startOfYear;
      }
      if (filterRange === "custom" && startDate && endDate) {
        const start = new Date(startDate).getTime();
        // Include till end of day
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000; 
        return orderTime >= start && orderTime <= end;
      }
      return true; // Default to all if range isn't restricted
    });
  };

  const activeRangeOrders = filterOrdersByRange();

  // Overviews calculations
  const totalOrdersCount = activeRangeOrders.length;
  const completedOrders = activeRangeOrders.filter(o => o.status === "completed");
  const processingOrders = activeRangeOrders.filter(o => ["processing", "packaging", "shipping"].includes(o.status));
  const failedOrders = activeRangeOrders.filter(o => ["failed", "cancelled"].includes(o.status));

  // Revenue (omset)
  const revenueTotal = activeRangeOrders
    .filter(o => o.status !== "cancelled" && o.status !== "failed")
    .reduce((acc, o) => acc + o.total, 0);

  // Cost total for sold items to compute Net Profit (Laba Bersih)
  const totalCostOfProductsSold = activeRangeOrders
    .filter(o => o.status !== "cancelled" && o.status !== "failed")
    .reduce((acc, o) => {
      const orderCosts = o.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      return acc + orderCosts;
    }, 0);

  const totalShippingCost = activeRangeOrders
    .filter(o => o.status !== "cancelled" && o.status !== "failed")
    .reduce((acc, o) => acc + o.shippingCost, 0);

  const totalDiscounts = activeRangeOrders
    .filter(o => o.status !== "cancelled" && o.status !== "failed")
    .reduce((acc, o) => acc + o.discountAmount, 0);

  // Net Profit = (Product sales - Product cost - Shipping subsidies / discount subtractions if any)
  // Our system: Client pays order.total which consists of: subtotal + shippingCost - discountAmount.
  // The store receives this total but has to pay the courier shippingCost itself.
  // So Net Store Income is: (Order Totals received) - (Product Cost price) - (Courier Shipment fee).
  // Yes: net profit = revenueTotal - totalCostOfProductsSold - totalShippingCost.
  const netProfitTotal = Math.max(0, revenueTotal - totalCostOfProductsSold - totalShippingCost);

  // Arus Kas Segments calculations
  // 1. "Uang Dalam Perjalanan": Orders diproses/dikemas/dikirim but not complete yet
  const cashInTransit = orders
    .filter(o => ["processing", "packaging", "shipping"].includes(o.status))
    .reduce((acc, o) => acc + o.total, 0);

  // 2. "Uang Cair": Finished completed orders
  const cashLiquid = orders
    .filter(o => o.status === "completed")
    .reduce((acc, o) => acc + o.total, 0);

  // 3. "Piutang": Unpaid Bank Transfers
  const receivables = orders
    .filter(o => o.paymentMethod === "Transfer Bank" && o.paymentStatus === "unpaid" && o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);

  // Products sold count in active range
  const totalProductsSoldQty = activeRangeOrders
    .filter(o => o.status === "completed" || o.status === "shipping")
    .reduce((acc, o) => acc + o.items.reduce((itSum, item) => itSum + item.quantity, 0), 0);

  // 2. CSV exporter generator
  const exportFinanceCSV = () => {
    const headers = ["Tanggal", "Nama Pelanggan", "Invoice", "Metode Pembayaran", "Subtotal", "Ongkos Kirim", "Promo Diskon", "Total Omset", "Status Pesanan"];
    const rows = activeRangeOrders.map((o) => [
      new Date(o.createdAt).toLocaleDateString("id-ID"),
      o.customerName,
      o.invoice,
      o.paymentMethod,
      o.subtotal,
      o.shippingCost,
      o.discountAmount,
      o.total,
      o.status
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_Qeiza_${filterRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Render bespoke premium SVG Chart diagram
  const renderTrendsChart = () => {
    // Let's draw a nice bar comparison representing last 5 orders or harian
    const chartOrders = [...orders].slice(0, 7).reverse();
    if (chartOrders.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed">
          Belum ada grafik penjualan tersedia.
        </div>
      );
    }

    const maxVal = Math.max(...chartOrders.map(o => o.total), 100000);
    const chartHeight = 160;
    const chartWidth = 500;
    const itemWidth = Math.floor(chartWidth / chartOrders.length);

    return (
      <div className="w-full overflow-x-auto pb-1 mt-6">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
          {/* Grid lines background */}
          <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="70" x2={chartWidth} y2="70" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="#cbd5e1" strokeWidth="1.5" />

          {chartOrders.map((ord, idx) => {
            const pct = ord.total / maxVal;
            const barH = Math.round(pct * (chartHeight - 40));
            const xPos = idx * itemWidth + (itemWidth / 4);
            const barW = itemWidth / 2;
            const yPos = chartHeight - 10 - barH;

            return (
              <g key={ord.id} className="group cursor-pointer">
                <title>{`${ord.invoice}: ${formatIDR(ord.total)}`}</title>
                {/* Emerald column bar with subtle hover transition */}
                <rect
                  x={xPos}
                  y={yPos}
                  width={barW}
                  height={barH}
                  rx="4"
                  fill="#10B981"
                  className="fill-emerald-500 group-hover:fill-emerald-600 transition-colors"
                />
                
                {/* Labels tag text */}
                <text
                  x={xPos + barW / 2}
                  y={chartHeight + 10}
                  textAnchor="middle"
                  className="fill-gray-400 text-[9px] font-mono tracking-tighter"
                >
                  {ord.invoice.split("-")[2] || "O"}
                </text>
                
                <text
                  x={xPos + barW / 2}
                  y={yPos - 6}
                  textAnchor="middle"
                  className="fill-gray-900 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {Math.round(ord.total / 1000)}k
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 no-print">
      {/* Date Filters Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span>Pengatur Jangkauan Analisa</span>
          </h2>
          <p className="text-xs text-gray-400 font-medium">Filter seluruh omset, modal, laba bersih, dan volume penjualan toko.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 text-xs">
            {(["hari", "minggu", "bulan", "tahun", "custom"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRange(r)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all ${
                  filterRange === r 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {filterRange === "custom" && (
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg text-xs"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          )}

          <button
            onClick={exportFinanceCSV}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5.5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Omset Kotor ({filterRange})</span>
            <h3 className="text-xl font-black text-gray-950 mt-1">{formatIDR(revenueTotal)}</h3>
            <span className="text-[10px] text-gray-400 font-medium">Total dana kotor masuk</span>
          </div>
        </div>

        <div className="p-5.5 bg-white rounded-3xl border border-[#10B981]/15 shadow-sm flex items-center gap-4 bg-gradient-to-br from-white to-emerald-50/5 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest block">Laba Bersih ({filterRange})</span>
            <h3 className="text-xl font-black text-emerald-700 mt-1">{formatIDR(netProfitTotal)}</h3>
            <span className="text-[10px] text-emerald-600/70 font-semibold">Toko Bersih (Omset - Modal)</span>
          </div>
        </div>

        <div className="p-5.5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Volume Pesanan ({filterRange})</span>
            <h3 className="text-xl font-black text-gray-950 mt-1">{totalOrdersCount} Transaksi</h3>
            <span className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 font-sans">
              <span className="text-emerald-600 font-bold">{completedOrders.length} Selesai</span> · 
              <span className="text-amber-500 font-bold">{processingOrders.length} Proses</span>
            </span>
          </div>
        </div>

        <div className="p-5.5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Keluaran Stok ({filterRange})</span>
            <h3 className="text-xl font-black text-gray-950 mt-1">{totalProductsSoldQty} Pcs</h3>
            <span className="text-[10px] text-gray-400 font-medium">Banyak barang terjual</span>
          </div>
        </div>
      </div>

      {/* Warnings & Live Cashflow breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Assets segments (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center justify-between">
            <span>Pembagian Arus Kas Bisnis</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full lowercase tracking-normal">ERP Ledgers</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block">Uang Dalam Perjalanan</span>
              <p className="text-sm sm:text-base font-black text-gray-900 mt-1">{formatIDR(cashInTransit)}</p>
              <p className="text-[9.5px] text-amber-600 font-medium mt-1 leading-normal">*Pesanan dipaket / dikirim</p>
            </div>
            <div className="p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-2xl">
              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest block">Uang Cair (Selesai)</span>
              <p className="text-sm sm:text-base font-black text-emerald-700 mt-1">{formatIDR(cashLiquid)}</p>
              <p className="text-[9.5px] text-emerald-600 font-medium mt-1 leading-normal">✓ Selesai diterima</p>
            </div>
            <div className="p-4 bg-rose-50/30 border border-rose-100/30 rounded-2xl">
              <span className="text-[9px] text-rose-600 font-extrabold uppercase tracking-widest block">Piutang (Unpaid)</span>
              <p className="text-sm sm:text-base font-black text-rose-700 mt-1">{formatIDR(receivables)}</p>
              <p className="text-[9.5px] text-gray-400 font-medium mt-1 leading-normal">*Belum bayar transfer</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide mb-2 line-clamp-1">Grafik Tren Penjualan (Pesanan Terakhir)</h4>
            {renderTrendsChart()}
          </div>
        </div>

        {/* Mini alerts notifications + stock alerts warnings (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Pemberitahuan Sistem Stok</span>
          </h3>

          {lowStockThresholdProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <span className="text-2xl">🏆</span>
              <h5 className="text-xs font-bold text-gray-800">Semua Stok Aman!</h5>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Tidak ada produk yang berada di bawah level batas minimum keselamatan inventaris Anda.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[295px] overflow-y-auto pr-1">
              {lowStockThresholdProducts.map(p => (
                <div id={`low-stock-alert-${p.id}`} key={p.id} className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-amber-200">
                    <img 
                      referrerPolicy="no-referrer"
                      src={p.images[0]} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-amber-900 line-clamp-1">{p.name}</h5>
                    <p className="text-[10px] text-amber-700 mt-0.5">Sisa: <strong className="font-extrabold">{p.stock} pcs</strong> (Batas min: {p.minStock})</p>
                    <span className="text-[9px] bg-white text-rose-500 border border-rose-100 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      SKU: {p.sku}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
