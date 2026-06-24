/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Settings, BankAccount, Address, Product } from "../../types";
import { 
  Settings as SettingsIcon, Truck, Building, Globe, Shield, RefreshCw, 
  Plus, Trash2, CheckCircle2, Save, Sparkles, Star, BookOpen, Search, Gift 
} from "lucide-react";

interface AdminSettingsProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  products: Product[];
}

export default function AdminSettings({ settings, onUpdateSettings, products = [] }: AdminSettingsProps) {
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [aboutText, setAboutText] = useState(settings.aboutText || "");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || "");

  // Custom Homepage Section Texts
  const [newArrivalTitle, setNewArrivalTitle] = useState(settings.newArrivalTitle || "Koleksi New Arrival Pilihan");
  const [newArrivalBadge, setNewArrivalBadge] = useState(settings.newArrivalBadge || "Koleksi Terbaru");
  const [collectionTitle, setCollectionTitle] = useState(settings.collectionTitle || "Lihat Koleksi Eksklusif Qeiza");
  const [collectionBadge, setCollectionBadge] = useState(settings.collectionBadge || "Inspirasi Gaya");

  // Custom Flash Sale Product Selection
  const [flashSaleProductIds, setFlashSaleProductIds] = useState<string[]>(settings.flashSaleProductIds || []);
  const [flashSearchQuery, setFlashSearchQuery] = useState("");

  // Custom Buyer Reviews Management
  const [reviews, setReviews] = useState<any[]>(settings.reviews || [
    { id: "rev-1", name: "Anisa Rahmawati", stars: 5, text: "Bahan kemeja linennya adem banget, pas di badan, jahitan rapi banget. Pengiriman cepat cuma sehari sampai Jakarta! Bakal langganan terus di Qeiza Mall.", product: "Kemeja Linen Premium" },
    { id: "rev-2", name: "Budi Santoso", stars: 5, text: "Sandal slide-nya empuk dan nyaman dipakai harian. Seller responsif dan verifikasi mall-nya bikin percaya belanja di sini.", product: "Sandal Slide Ergo" },
    { id: "rev-3", name: "Dewi Lestari", stars: 5, text: "Produk kecantikannya original 100%, ada barcode verifikasi resmi. Packaging tebal pakai bubble wrap ganda gratis.", product: "Skincare Glow Serum" }
  ]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewProduct, setNewReviewProduct] = useState("");

  // Blog Posts Management State for Inspirasi Edukasi
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogExcerpt, setNewBlogExcerpt] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [newBlogCategory, setNewBlogCategory] = useState("Lifestyle");
  const [newBlogImageUrl, setNewBlogImageUrl] = useState("");
  const [newBlogReadTime, setNewBlogReadTime] = useState("3 Min Read");

  const fetchBlogPosts = async () => {
    try {
      const res = await fetch("/api/blog-posts");
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data);
      }
    } catch (err) {
      console.error("Gagal mengambil ulasan:", err);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      alert("Harap lengkapi Judul dan Konten Artikel!");
      return;
    }

    const payload = {
      title: newBlogTitle.trim(),
      excerpt: newBlogExcerpt.trim() || newBlogContent.trim().substring(0, 100) + "...",
      content: newBlogContent.trim(),
      category: newBlogCategory,
      imageUrl: newBlogImageUrl.trim() || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
      readTime: newBlogReadTime || "3 Min Read",
      createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    };

    try {
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchBlogPosts();
        setNewBlogTitle("");
        setNewBlogExcerpt("");
        setNewBlogContent("");
        setNewBlogImageUrl("");
        alert("Artikel inspirasi edukasi berhasil dipublikasikan!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel edukasi ini?")) return;
    try {
      const res = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchBlogPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = () => {
    if (!newReviewName.trim() || !newReviewText.trim()) {
      alert("Harap isi nama pembeli dan ulasan!");
      return;
    }
    const newRev = {
      id: "rev-" + Date.now(),
      name: newReviewName.trim(),
      stars: Number(newReviewStars),
      text: newReviewText.trim(),
      product: newReviewProduct.trim() || "Produk Pilihan"
    };
    setReviews([...reviews, newRev]);
    setNewReviewName("");
    setNewReviewText("");
    setNewReviewProduct("");
  };

  const handleRemoveReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  // SEO
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || "");

  // Banner Editor states
  const [bannerBadge, setBannerBadge] = useState(settings.bannerBadge || "");
  const [bannerTitle, setBannerTitle] = useState(settings.bannerTitle || "");
  const [bannerDescription, setBannerDescription] = useState(settings.bannerDescription || "");
  const [bannerCtaText, setBannerCtaText] = useState(settings.bannerCtaText || "");
  const [bannerImageUrl, setBannerImageUrl] = useState(settings.bannerImageUrl || "");

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBannerImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      },
      bannerBadge: bannerBadge.trim(),
      bannerTitle: bannerTitle.trim(),
      bannerDescription: bannerDescription.trim(),
      bannerCtaText: bannerCtaText.trim(),
      bannerImageUrl: bannerImageUrl.trim(),
      newArrivalTitle: newArrivalTitle.trim(),
      newArrivalBadge: newArrivalBadge.trim(),
      collectionTitle: collectionTitle.trim(),
      collectionBadge: collectionBadge.trim(),
      flashSaleProductIds,
      reviews
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

      {/* 1B. HERO BANNER EXTRA CONFIGURATION EDITOR (NEW FEATURE) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Globe className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Hero Banner Beranda</span>
        </h3>
        
        <p className="text-xs text-gray-500 leading-relaxed">
          Kustomisasi tampilan banner utama di halaman beranda toko Anda. Anda dapat mengubah konten teks estetis maupun meng-upload gambar latar belakang (background) baru secara mudah yang akan langsung disimpan.
        </p>

        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Teks Badge / Subtitle Atas</label>
            <input
              type="text"
              placeholder="Contoh: ✦ ESENSI KEANGGUNAN MODERN ✦"
              value={bannerBadge}
              onChange={(e) => setBannerBadge(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Judul Utama Hero Banner (Mendukung Enter)</label>
            <textarea
              rows={1}
              placeholder="Contoh: Kurasi Gaya Hidup \nMinimalis Kreatif"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Singkat Banner</label>
            <textarea
              rows={3}
              placeholder="Masukkan deskripsi estetis koleksi atau promo Anda..."
              value={bannerDescription}
              onChange={(e) => setBannerDescription(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Teks Tombol CTA (Call to Action)</label>
              <input
                type="text"
                placeholder="Contoh: Jelajahi Produk"
                value={bannerCtaText}
                onChange={(e) => setBannerCtaText(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">URL Gambar Background Banner (Atau Upload di bawah)</label>
              <input
                type="text"
                placeholder="Masukkan link HTTPS gambar background..."
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Upload element */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Upload File Gambar Banner Baru</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="text-2xl mb-1 mt-1">📁</span>
              <span className="text-xs font-bold text-gray-700">Pilih berkas gambar banner Anda</span>
              <span className="text-[10px] text-gray-400 mt-1">Mendukung file PNG, JPG, JPEG, WEBP. Maksimal 3MB.</span>
            </div>
          </div>

          {/* Banner Live Miniature Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Draft Preview Tampilan Banner</span>
            <div 
              style={bannerImageUrl ? { backgroundImage: `url(${bannerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
              className="w-full min-h-[110px] rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-white relative overflow-hidden flex flex-col justify-between"
            >
              {bannerImageUrl && <div className="absolute inset-0 bg-black/55 z-0" />}
              
              <div className="relative z-10 text-left">
                <p className="text-[7px] tracking-[0.15em] font-bold text-zinc-400 uppercase">
                  {bannerBadge || "ESENSI KEANGGUNAN MODERN"}
                </p>
                <h4 className="text-xs font-black font-logo tracking-wider text-white mt-1 whitespace-pre-line leading-tight">
                  {bannerTitle || "Kurasi Gaya Hidup \nMinimalis Kreatif"}
                </h4>
                <p className="text-[8px] text-zinc-400 line-clamp-1 max-w-xs mt-1 leading-normal">
                  {bannerDescription || "Kurasi gaya hidup estetis dengan kualitas material premium..."}
                </p>
              </div>

              <div className="relative z-10 flex justify-between items-end mt-2">
                <span className="bg-white text-zinc-950 px-3 py-1 rounded text-[7px] font-bold uppercase tracking-wider">
                  {bannerCtaText || "Jelajahi Produk"}
                </span>
                {bannerImageUrl && (
                  <button
                    type="button"
                    onClick={() => setBannerImageUrl("")}
                    className="text-[9px] font-bold text-rose-400 bg-black/60 px-2 py-0.5 rounded hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Hapus Foto ✕
                  </button>
                )}
              </div>
            </div>
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

      {/* 4B. CUSTOM HOMEPAGE CONTENT SECTION (NEW ARRIVALS & LIHAT KOLEKSI) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Sparkles className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Konten Teks Beranda</span>
        </h3>
        <p className="text-xs text-gray-400">Sesuaikan judul, badge, dan teks promosi pada section "New Arrival" dan "Lihat Koleksi" di halaman depan.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Seksi New Arrival</h4>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Badge Section</label>
              <input
                type="text"
                placeholder="Contoh: Koleksi Terbaru"
                value={newArrivalBadge}
                onChange={(e) => setNewArrivalBadge(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Judul Section Utama</label>
              <input
                type="text"
                placeholder="Contoh: Koleksi New Arrival Pilihan"
                value={newArrivalTitle}
                onChange={(e) => setNewArrivalTitle(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Seksi Lihat Koleksi</h4>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Badge Section</label>
              <input
                type="text"
                placeholder="Contoh: Inspirasi Gaya"
                value={collectionBadge}
                onChange={(e) => setCollectionBadge(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Judul Section Utama</label>
              <input
                type="text"
                placeholder="Contoh: Lihat Koleksi Eksklusif Qeiza"
                value={collectionTitle}
                onChange={(e) => setCollectionTitle(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4C. DYNAMIC FLASH SALE PRODUCT SELECTOR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Gift className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Produk Flash Sale Kejutan</span>
        </h3>
        <p className="text-xs text-gray-400">Pilih secara fleksibel produk mana saja yang ingin Anda tampilkan dalam barisan Flash Sale Kejutan Qeiza Mall.</p>

        {/* Selected indicator */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-2">Terpilih Untuk Flash Sale ({flashSaleProductIds.length} Produk)</span>
          {flashSaleProductIds.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Belum ada produk spesifik terpilih. (Akan otomatis menampilkan produk berlabel "promo" atau berdiskon).</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {flashSaleProductIds.map(pId => {
                const matched = products.find(p => p.id === pId);
                return (
                  <span key={pId} className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                    <span>{matched ? matched.name : pId}</span>
                    <button
                      type="button"
                      onClick={() => setFlashSaleProductIds(flashSaleProductIds.filter(id => id !== pId))}
                      className="text-rose-500 hover:text-rose-600 font-extrabold text-xs"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Search for products to add to Flash Sale */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau SKU..."
              value={flashSearchQuery}
              onChange={(e) => setFlashSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 border border-gray-200 rounded-xl pl-10"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          </div>

          <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-2xl divide-y">
            {products
              .filter(p => p.name.toLowerCase().includes(flashSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(flashSearchQuery.toLowerCase()))
              .map(p => {
                const isSelected = flashSaleProductIds.includes(p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img referrerPolicy="no-referrer" src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded border" />
                      <div>
                        <span className="text-xs font-bold text-gray-800 block leading-tight">{p.name}</span>
                        <span className="text-[9px] font-mono text-gray-400">SKU: {p.sku} · Rp {p.price.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFlashSaleProductIds(flashSaleProductIds.filter(id => id !== p.id));
                        } else {
                          setFlashSaleProductIds([...flashSaleProductIds, p.id]);
                        }
                      }}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                        isSelected 
                          ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100" 
                          : "bg-zinc-900 text-white hover:bg-black"
                      }`}
                    >
                      {isSelected ? "Keluarkan" : "Ikut Flash Sale"}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 4D. CUSTOM BUYER REVIEWS PANEL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <Star className="text-emerald-500 fill-emerald-500 w-5 h-5" />
          <span>Pengaturan Ulasan Pembeli Puas</span>
        </h3>
        <p className="text-xs text-gray-400">Tambahkan, ubah, dan hapus ulasan kepuasan pelanggan yang ditampilkan di halaman beranda.</p>

        {/* Review list */}
        <div className="space-y-3 pt-2">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-800">{rev.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium">({rev.product})</span>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium italic">"{rev.text}"</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReview(rev.id)}
                className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new review */}
        <div className="bg-gray-50/60 p-4 rounded-2xl border border-dashed border-gray-200 space-y-3 pt-4">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest block">Input Ulasan Baru</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Lengkap Pembeli..."
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
              className="p-3 bg-white border rounded-xl text-xs font-semibold col-span-1"
            />
            <input
              type="text"
              placeholder="Nama Barang yang Dibeli..."
              value={newReviewProduct}
              onChange={(e) => setNewReviewProduct(e.target.value)}
              className="p-3 bg-white border rounded-xl text-xs font-semibold col-span-1"
            />
            <select
              value={newReviewStars}
              onChange={(e) => setNewReviewStars(Number(e.target.value))}
              className="p-3 bg-white border rounded-xl text-xs font-bold col-span-1"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
              <option value={3}>⭐⭐⭐ (3 Bintang)</option>
            </select>
          </div>
          <textarea
            rows={2}
            placeholder="Ketik isi komentar atau testimoni pembeli di sini..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            className="w-full p-3 bg-white border rounded-xl text-xs font-semibold resize-none"
          />
          <button
            type="button"
            onClick={handleAddReview}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-extrabold"
          >
            Tambahkan Ulasan Pembeli +
          </button>
        </div>
      </div>

      {/* 4E. EDUCATIONAL BLOG INSPIRATION POSTS PANEL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-950 border-b pb-3 flex items-center gap-2">
          <BookOpen className="text-emerald-500 w-5 h-5" />
          <span>Pengaturan Inspirasi Edukasi & Blog</span>
        </h3>
        <p className="text-xs text-gray-400">Tulis dan publikasikan artikel atau panduan edukasi baru untuk memikat minat para pembeli.</p>

        {/* Existing blog list */}
        <div className="space-y-3 pt-2">
          {blogPosts.map((post) => (
            <div key={post.id} className="p-3.5 rounded-2xl border border-gray-150 bg-white flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <img referrerPolicy="no-referrer" src={post.imageUrl} alt="" className="w-10 h-10 object-cover rounded-xl border shrink-0" />
                <div>
                  <span className="text-[9px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full font-bold uppercase">{post.category}</span>
                  <h4 className="text-xs font-extrabold text-gray-800 mt-1">{post.title}</h4>
                  <p className="text-[10px] text-gray-400">{post.readTime} · Dibuat {post.createdAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteBlog(post.id)}
                className="text-rose-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new blog form */}
        <div className="bg-gray-50/60 p-4 rounded-2xl border border-dashed border-gray-200 space-y-3 pt-4">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest block">Tulis Artikel Baru</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Judul Utama</label>
              <input
                type="text"
                placeholder="Contoh: 5 Kunci Memilih Ukuran Celana Linen..."
                value={newBlogTitle}
                onChange={(e) => setNewBlogTitle(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kategori Utama</label>
              <select
                value={newBlogCategory}
                onChange={(e) => setNewBlogCategory(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-xs font-bold"
              >
                <option value="Fashion">Fashion & Style</option>
                <option value="Edukasi">Inspirasi Edukasi</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Tips & Trik">Tips & Trik</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">URL Cover Foto</label>
              <input
                type="text"
                placeholder="Contoh: https://images.unsplash.com/..."
                value={newBlogImageUrl}
                onChange={(e) => setNewBlogImageUrl(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Estimasi Durasi Baca</label>
              <input
                type="text"
                placeholder="Contoh: 3 Min Read"
                value={newBlogReadTime}
                onChange={(e) => setNewBlogReadTime(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kutipan Ringkas (Excerpt)</label>
            <input
              type="text"
              placeholder="Isi satu kalimat rangkuman singkat..."
              value={newBlogExcerpt}
              onChange={(e) => setNewBlogExcerpt(e.target.value)}
              className="w-full p-3 bg-white border rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Isi Konten Artikel Lengkap</label>
            <textarea
              rows={4}
              placeholder="Tulis seluruh konten artikel secara lengkap..."
              value={newBlogContent}
              onChange={(e) => setNewBlogContent(e.target.value)}
              className="w-full p-3 bg-white border rounded-xl text-xs font-semibold"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleAddBlog(e as any);
            }}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-extrabold"
          >
            Publikasikan Artikel Edukasi +
          </button>
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
