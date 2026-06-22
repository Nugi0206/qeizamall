/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Settings, BankAccount, Address } from "../../types";
import { Settings as SettingsIcon, Truck, Building, Globe, Shield, RefreshCw, Plus, Trash2, CheckCircle2, Save } from "lucide-react";

interface AdminSettingsProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
}

export default function AdminSettings({ settings, onUpdateSettings }: AdminSettingsProps) {
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [aboutText, setAboutText] = useState(settings.aboutText || "");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || "");

  // Warehouse Address details states
  const [street, setStreet] = useState(settings.warehouseAddress.street || "");
  const [kelurahan, setKelurahan] = useState(settings.warehouseAddress.kelurahan || "");
  const [kecamatan, setKecamatan] = useState(settings.warehouseAddress.kecamatan || "");
  const [kabupaten, setKabupaten] = useState(settings.warehouseAddress.kabupaten || "");
  const [provinsi, setProvinsi] = useState(settings.warehouseAddress.provinsi || "");
  const [postalCode, setPostalCode] = useState(settings.warehouseAddress.postalCode || "");

  // Bank lists builder
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
    settings.activePayments.transferBank.accounts || []
  );
  const [newBankName, setNewBankName] = useState("BCA");
  const [newAccountNo, setNewAccountNo] = useState("");
  const [newHolderName, setNewHolderName] = useState("");

  // Payment status triggers
  const [isCODActive, setIsCODActive] = useState<boolean>(settings.activePayments.cod);
  const [isBankActive, setIsBankActive] = useState<boolean>(
    settings.activePayments.transferBank.isActive
  );
  const [isQRISActive, setIsQRISActive] = useState<boolean>(settings.activePayments.qris.isActive);
  const [qrisUrl, setQrisUrl] = useState<string>(settings.activePayments.qris.qrisUrl || "");

  // Shipping active triggers
  const [selectedCouriers, setSelectedCouriers] = useState<string[]>(
    settings.activeCouriers || []
  );

  const availableCarriers = [
    "JNE", "J&T", "SiCepat", "AnterAja", "Ninja Express", "Pos Indonesia", "TIKI"
  ];

  const handleCourierToggle = (courierName: string) => {
    if (selectedCouriers.includes(courierName)) {
      setSelectedCouriers(selectedCouriers.filter(c => c !== courierName));
    } else {
      setSelectedCouriers([...selectedCouriers, courierName]);
    }
  };

  const handleCreateBankAccount = () => {
    if (newAccountNo.trim() && newHolderName.trim()) {
      const newAcc: BankAccount = {
        bankName: newBankName,
        accountNo: newAccountNo.trim(),
        holderName: newHolderName.trim()
      };
      setBankAccounts([...bankAccounts, newAcc]);
      setNewAccountNo("");
      setNewHolderName("");
    }
  };

  const handleRemoveBankAccount = (indexIdx: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== indexIdx));
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const whAddress: Address = {
      street: street.trim(),
      kelurahan: kelurahan.trim(),
      kecamatan: kecamatan.trim(),
      kabupaten: kabupaten.trim(),
      provinsi: provinsi.trim(),
      postalCode: postalCode.trim()
    };

    const updates: Partial<Settings> = {
      logoUrl: logoUrl.trim(),
      aboutText: aboutText.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      warehouseAddress: whAddress,
      activeCouriers: selectedCouriers,
      activePayments: {
        cod: isCODActive,
        transferBank: {
          isActive: isBankActive,
          accounts: bankAccounts
        },
        qris: {
          isActive: isQRISActive,
          qrisUrl: qrisUrl.trim()
        }
      }
    };

    onUpdateSettings(updates);
    alert("Semua konfigurasi brand Qeiza Mall berhasil disimpan!");
  };

  return (
    <form onSubmit={handleSaveAllSettings} className="space-y-8 pb-12 no-print">
      {/* 1. Shop Info & Support Coordinates */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Globe className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Identitas Toko & Brand</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Custom Logo Teks / URL Foto Logo</label>
            <input
              type="text"
              placeholder="Contoh: Qeiza Mall, atau https://photo-link..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">No. WhatsApp Hubungan Admin (CS)</label>
            <input
              required
              type="text"
              placeholder="Contoh: 081234567890"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Support Email Pembeli</label>
            <input
              required
              type="email"
              placeholder="Contoh: cs@qeizamall.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Ringkasan Deskripsi Tentang Kami</label>
            <input
              required
              type="text"
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Warehouse Coordinates details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Building className="text-emerald-500 w-5 h-5" />
          <span>Alamat Lokasi Gudang Penjual (Origin Gudang)</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Alamat Lengkap Gudang</label>
            <input
              required
              type="text"
              placeholder="Contoh: Komplek Industri Kelapa Gading Kav 18"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Provinsi</label>
              <input
                required
                type="text"
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kabupaten / Kota</label>
              <input
                required
                type="text"
                value={kabupaten}
                onChange={(e) => setKabupaten(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kecamatan</label>
              <input
                required
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kelurahan</label>
              <input
                required
                type="text"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Kode Pos</label>
              <input
                required
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full text-xs font-mono font-bold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Shipping Active Carrier Partners */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Truck className="text-emerald-500 w-5 h-5" />
          <span>Kemitraan Logistik Aktif (Cek Ongkir Otomatis)</span>
        </h3>
        <p className="text-xs text-gray-400">Aktifkan atau matikan ekspedisi kurir pengiriman yang didukung di halaman kasir.</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {availableCarriers.map(carrier => {
            const isActive = selectedCouriers.includes(carrier);
            return (
              <button
                key={carrier}
                type="button"
                onClick={() => handleCourierToggle(carrier)}
                className={`px-5 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                  isActive 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                }`}
              >
                {carrier} {isActive ? "✓" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Payment Gateway Channels config */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Building className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Jalur Transaksi Keuangan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* A. COD Column */}
          <div className="p-4 bg-gray-50 rounded-2xl border space-y-4.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCODActive}
                onChange={(e) => setIsCODActive(e.target.checked)}
                className="w-4.5 h-4.5 accent-emerald-500"
              />
              <span className="text-xs font-black uppercase tracking-tight">Aktifkan Bayar COD</span>
            </label>
            <p className="text-[10.5px] text-gray-400 leading-normal">Pembeli membayar uang tunai lunas ke kurir pengirim langsung saat barang diterima di lokasi.</p>
          </div>

          {/* B. Bank Transfer Column */}
          <div className="p-4 bg-gray-50 rounded-2xl border space-y-4.5 sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer select-none border-b pb-2">
              <input
                type="checkbox"
                checked={isBankActive}
                onChange={(e) => setIsBankActive(e.target.checked)}
                className="w-4.5 h-4.5 accent-emerald-500"
              />
              <span className="text-xs font-black uppercase tracking-tight">Aktifkan Bayar Transfer Bank</span>
            </label>

            {isBankActive && (
              <div className="space-y-4 pt-1">
                {/* Creation inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="p-2 border bg-white rounded-lg text-xs font-bold"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                    <option value="SeaBank">SeaBank</option>
                  </select>
                  <input
                    type="text"
                    placeholder="No. Rekening"
                    value={newAccountNo}
                    onChange={(e) => setNewAccountNo(e.target.value)}
                    className="p-2 border bg-white rounded-lg text-xs font-semibold col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Pemilik"
                    value={newHolderName}
                    onChange={(e) => setNewHolderName(e.target.value)}
                    className="p-2 border bg-white rounded-lg text-xs font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateBankAccount}
                  className="px-4 py-2 bg-gray-950 text-white rounded-lg text-xs font-extrabold"
                >
                  Tambahkan Rekening +
                </button>

                {/* Recs active list */}
                <div className="space-y-2 pt-2 border-t">
                  {bankAccounts.map((acc, aIdx) => (
                    <div id={`bank-rec-card-${aIdx}`} key={aIdx} className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border">
                      <div>
                        <strong className="font-extrabold text-indigo-800">{acc.bankName}</strong> · No: <strong className="font-mono text-gray-800">{acc.accountNo}</strong> ({acc.holderName})
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBankAccount(aIdx)}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. QRIS Block Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-5">
          <div className="space-y-3.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isQRISActive}
                onChange={(e) => setIsQRISActive(e.target.checked)}
                className="w-4.5 h-4.5 accent-emerald-500"
              />
              <span className="text-xs font-black uppercase tracking-tight">Aktifkan QRIS Digital</span>
            </label>
            <p className="text-[11px] text-gray-400 leading-normal">Scan QR di kasir untuk checkout cepat GOBIZ/OVO/Dana.</p>
            {isQRISActive && (
              <input
                type="text"
                placeholder="Masukkan Link Gambar QRIS Anda..."
                value={qrisUrl}
                onChange={(e) => setQrisUrl(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl"
              />
            )}
          </div>

          {isQRISActive && qrisUrl && (
            <div className="flex border rounded-2xl p-3 gap-3 bg-gray-50 max-w-sm align-middle h-max items-center">
              <div className="w-14 aspect-square rounded-lg bg-white border shrink-0 overflow-hidden">
                <img referrerPolicy="no-referrer" src={qrisUrl} alt="Preview QRIS" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                Tampilan preview QRIS pada halaman pembayaran kasir. Pastikan link di samping tersambung pada gambar beresolusi tinggi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. SEO Optimization metadata details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Globe className="text-emerald-500 w-5 h-5" />
          <span>Optimasi SEO Google & Meta Crawlers</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Meta Title</label>
            <input
              type="text"
              placeholder="Contoh: Qeiza Mall - Pusat Perlengkapan Premium Murah"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Meta Description</label>
            <textarea
              rows={2}
              placeholder="Deskripsi ringkas pencarian Google agar banyak pembeli tertarik berkunjung..."
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl font-semibold resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save Trigger Button */}
      <button
        id="settings-save-submit-btn"
        type="submit"
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/10 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4.5 h-4.5" />
        <span>Simpan & Sinkronisasi Pengaturan Qeiza Mall</span>
      </button>
    </form>
  );
}
