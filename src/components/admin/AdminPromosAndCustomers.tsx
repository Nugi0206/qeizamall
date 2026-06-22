/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Order, Promo } from "../../types";
import { Search, Tag, Users, Award, Trash2, ArrowUpDown, CreditCard, ShoppingBag, Plus, X, ListCollapse } from "lucide-react";

interface AdminPromosAndCustomersProps {
  orders: Order[];
  promos: Promo[];
  onAddPromo: (promo: Omit<Promo, "id"> & { id?: string }) => void;
  onDeletePromo: (id: string) => void;
}

export default function AdminPromosAndCustomers({ orders, promos, onAddPromo, onDeletePromo }: AdminPromosAndCustomersProps) {
  const [activeTab, setActiveTab] = useState<"promos" | "customers">("promos");
  const [searchPromoQuery, setSearchPromoQuery] = useState("");
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");

  // Promo build form states
  const [showPromoCreate, setShowPromoCreate] = useState(false);
  const [promoId, setPromoId] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<Promo["type"]>("percentage");
  const [value, setValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(100000);
  const [description, setDescription] = useState("");

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleOpenPromoEditor = (p: Promo) => {
    setPromoId(p.id);
    setCode(p.code);
    setType(p.type);
    setValue(p.value);
    setMinPurchase(p.minPurchase);
    setDescription(p.description);
    setShowPromoCreate(true);
  };

  const handleOpenPromoCreator = () => {
    setPromoId("");
    setCode("");
    setType("percentage");
    setValue(10);
    setMinPurchase(100000);
    setDescription("");
    setShowPromoCreate(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      alert("Harap masukkan Kode Kupon!");
      return;
    }

    const payload: any = {
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minPurchase: Number(minPurchase),
      description: description.trim(),
      isActive: true
    };

    if (promoId) {
      payload.id = promoId;
    }

    onAddPromo(payload);
    setShowPromoCreate(false);
    alert("Kupon Promo tersimpan!");
  };

  // Profiles and aggregates real customer details (CRM database compilation)
  const compileCustomersList = () => {
    const registry: Record<string, {
      name: string;
      phone: string;
      totalSpent: number;
      orderCount: number;
      lastCity: string;
      lastOrderDate: string;
    }> = {};

    orders.forEach(o => {
      // Normalize phone number coordinates
      const key = o.customerPhone.trim();
      if (!registry[key]) {
        registry[key] = {
          name: o.customerName,
          phone: o.customerPhone,
          totalSpent: 0,
          orderCount: 0,
          lastCity: o.address.kabupaten,
          lastOrderDate: o.createdAt
        };
      }

      // Add sums on non-cancelled orders
      if (o.status !== "cancelled" && o.status !== "failed") {
        registry[key].totalSpent += o.total;
        registry[key].orderCount += 1;
      }

      // Keep most recent date
      if (new Date(o.createdAt).getTime() > new Date(registry[key].lastOrderDate).getTime()) {
        registry[key].lastOrderDate = o.createdAt;
        registry[key].lastCity = o.address.kabupaten;
      }
    });

    return Object.values(registry);
  };

  const customersList = compileCustomersList();

  // Search filter
  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(searchPromoQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchPromoQuery.toLowerCase())
  );

  const filteredCustomers = customersList.filter(c => 
    c.name.toLowerCase().includes(searchCustomerQuery.toLowerCase()) ||
    c.phone.includes(searchCustomerQuery) ||
    c.lastCity.toLowerCase().includes(searchCustomerQuery.toLowerCase())
  );

  // Top Spender VIP sorting
  const sortedVIPCustomers = [...filteredCustomers].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6 no-print">
      {/* Tab controls */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("promos")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "promos" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          Kupon & Voucher Diskon
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "customers" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          Database Pelanggan Qeiza (CRM)
        </button>
      </div>

      {activeTab === "promos" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                required
                type="text"
                placeholder="Cari kode promo, kupon..."
                value={searchPromoQuery}
                onChange={(e) => setSearchPromoQuery(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-250 bg-white rounded-2xl pl-10"
              />
              <Tag className="absolute left-3.5 top-4 w-4 h-4 text-gray-400" />
            </div>

            <button
              onClick={handleOpenPromoCreator}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Daftar Kode Kupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromos.length === 0 ? (
              <div className="col-span-full text-center py-14 bg-white rounded-3xl border text-gray-400 font-medium">
                Belum terdapat kode kupon promo aktif.
              </div>
            ) : (
              filteredPromos.map(p => (
                <div 
                  id={`promo-card-${p.id}`}
                  key={p.id} 
                  className="bg-white p-5 rounded-3xl border border-dashed border-emerald-500/30 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Decorative circular notch layout */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border-r border-dashed border-emerald-500/20" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border-l border-dashed border-emerald-500/20" />
                  
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono font-black tracking-widest px-3 py-1 rounded-full uppercase block w-max">
                      {p.code}
                    </span>
                    <h4 className="text-[15px] font-extrabold text-gray-900 mt-3">{p.description}</h4>
                    <p className="text-[11px] text-gray-400 leading-normal mt-1.5 font-sans">
                      Diskon: <strong className="text-gray-900">{p.type === "percentage" ? `${p.value}%` : p.type === "free_shipping" ? `Ongkir s/d ${formatIDR(p.value)}` : formatIDR(p.value)}</strong> · Min. Belanja: <strong className="text-gray-900">{formatIDR(p.minPurchase)}</strong>
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-gray-50 flex justify-between items-center text-xs">
                    <button
                      onClick={() => handleOpenPromoEditor(p)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                    >
                      Ubah Voucher
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus voucher [${p.code}]?`)) onDeletePromo(p.id);
                      }}
                      className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* CRM CUSTOMER DATABASE TABLE */
        <div className="space-y-4">
          <div className="relative">
            <input
              required
              type="text"
              placeholder="Cari database pelanggan (Nama, nomor whatsapp, kota...)"
              value={searchCustomerQuery}
              onChange={(e) => setSearchCustomerQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-250 bg-white rounded-2xl pl-10"
            />
            <Users className="absolute left-3.5 top-4 w-4 h-4 text-gray-400" />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100">
                    <th className="p-4 pl-6">Profil Nama Pelanggan</th>
                    <th className="p-4">No. WhatsApp</th>
                    <th className="p-4">Kota Terakhir</th>
                    <th className="p-4 text-center">Jumlah Belanjaan</th>
                    <th className="p-4 text-right pr-6">Lifetime Spent (Omset Toko)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                  {sortedVIPCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-14 text-gray-400 font-medium">
                        Belum terdaftar profil database kontak pelanggan.
                      </td>
                    </tr>
                  ) : (
                    sortedVIPCustomers.map((cust, cIdx) => (
                      <tr key={cust.phone} className="hover:bg-gray-50/50">
                        {/* Name Profile details */}
                        <td className="p-4 pl-6 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                            {cust.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{cust.name}</span>
                            {cIdx < 2 && cust.totalSpent > 300000 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-800 border-amber-100 border px-1.5 py-0.2 rounded-md font-extrabold uppercase">
                                <Award className="w-3 h-3 fill-current" />
                                <span>VIP Pelanggan Terbaik</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* WA Phone Number */}
                        <td className="p-4 font-mono font-bold text-emerald-600 select-all">
                          {cust.phone}
                        </td>

                        {/* City */}
                        <td className="p-4 font-medium text-gray-550">
                          {cust.lastCity || "Kabupaten"}
                        </td>

                        {/* Total Transaction counts */}
                        <td className="p-4 text-center font-bold font-mono text-gray-950">
                          {cust.orderCount} Transaksi
                        </td>

                        {/* Accumulated total money spent */}
                        <td className="p-4 text-right pr-6 font-black text-gray-950">
                          {formatIDR(cust.totalSpent)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG C: Promo Kupon form creator modal */}
      {showPromoCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSavePromo} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button 
              type="button" 
              onClick={() => setShowPromoCreate(false)} 
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">QEIZA DISCOUNTS</span>
              <h3 className="text-base font-extrabold text-gray-900 mt-1">
                {promoId ? "Ubah Parameter Kupon" : "Daftarkan Kupon Baru"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kode Kupon / Voucher</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: MERDEKASALE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-black p-3.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Jenis Kupon</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs font-bold p-3.5 border border-gray-200 bg-white rounded-xl"
                >
                  <option value="percentage">Diskon Persentase (%)</option>
                  <option value="fixed">Potongan Flat Nominal (Rp)</option>
                  <option value="free_shipping">Potongan/Subsidi Ongkos Kirim (Flat)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nilai Diskon</label>
                  <input
                    required
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full text-xs font-bold p-3.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Minimal Belanja (Rp)</label>
                  <input
                    required
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full text-xs font-bold p-3.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Singkat Kupon</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Potongan harga Rp 15.000 minimal belanja Rp 100.000"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Komit Voucher Diskon
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
