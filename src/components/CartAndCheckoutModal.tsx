/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product, Promo, Address, OrderItem, Settings } from "../types";
import { X, Trash2, Plus, Minus, Tag, ShieldCheck, Truck, CreditCard, ChevronDown, CheckCircle, Info, ShoppingBag, ArrowLeft, HelpCircle } from "lucide-react";

interface RegionData {
  [province: string]: {
    [city: string]: {
      [kecamatan: string]: string[];
    };
  };
}

const REGION_DATA: RegionData = {
  "DKI Jakarta": {
    "Kota Jakarta Selatan": {
      "Tebet": ["Menteng Dalam", "Tebet Barat", "Tebet Timur", "Kebon Baru", "Manggarai"],
      "Cilandak": ["Cilandak Barat", "Cipete Selatan", "Pondok Labu", "Lebak Bulus"],
      "Kebayoran Baru": ["Gandaria Utara", "Melawai", "Senayan", "Selong", "Kramat Pela"],
      "Pasar Minggu": ["Pejaten Barat", "Pejaten Timur", "Pasar Minggu", "Kebagusan", "Ragunan", "Cilandak Timur", "Jati Padang"]
    },
    "Kota Jakarta Pusat": {
      "Gambir": ["Cideng", "Gambir", "Petojo Utara", "Petojo Selatan", "Duri Pulo"],
      "Menteng": ["Cikini", "Menteng", "Gondangdia", "Pegangsaan", "Kebon Sirih"],
      "Tanah Abang": ["Kebon Kacang", "Kebon Melati", "Petamburan", "Bendungan Hilir", "Kampung Bali", "Gelora", "Karet Tengsin"]
    },
    "Kota Jakarta Utara": {
      "Kelapa Gading": ["Kelapa Gading Barat", "Kelapa Gading Timur", "Pegangsaan Dua"],
      "Tanjung Priok": ["Sunter Agung", "Sunter Jaya", "Tanjung Priok", "Kebon Bawang", "Sungai Bambu", "Warakas"]
    },
    "Kota Jakarta Barat": {
      "Kembangan": ["Kembangan Utara", "Kembangan Selatan", "Meruya Utara", "Joglo", "Srengseng", "Meruya Selatan"],
      "Palmerah": ["Slipi", "Kemanggisan", "Palmerah", "Bambu Selatan", "Kota Bambu Utara", "Jatipulo"]
    },
    "Kota Jakarta Timur": {
      "Jatinegara": ["Bidara Cina", "Kampung Melayu", "Cipinang Muara", "Cipinang Cempedak", "Bali Mester", "Rawa Bunga"],
      "Duren Sawit": ["Pondok Kelapa", "Duren Sawit", "Klender", "Pondok Kopi", "Pondok Bambu", "Malaka Jaya"]
    }
  },
  "Jawa Barat": {
    "Kab. Cirebon": {
      "Arjawinangun": ["Arjawinangun", "Jungjang", "Tegalgubug", "Kebonturi"],
      "Astanajapura": ["Astanajapura", "Buntet", "Japura Bakti", "Kanci"],
      "Babakan": ["Babakan", "Babakan Gebang", "Gembongan", "Kudumulya"],
      "Beber": ["Beber", "Cipinang", "Kondangsari", "Wanayasa"],
      "Ciledug": ["Ciledug Kulon", "Ciledug Lor", "Ciledug Tengah", "Damarguna"],
      "Ciwaringin": ["Ciwaringin", "Galagamba", "Gombang", "Beringin"],
      "Depok": ["Depok", "Kasugengan Kidul", "Kasugengan Lor", "Waruroyom"],
      "Dukupuntang": ["Dukupuntang", "Cangkoak", "Cisaat", "Sindangjawa"],
      "Gebang": ["Gebang", "Gebang Kulon", "Gebang Ilir", "Gebang Udik"],
      "Gegesik": ["Gegesik Kidul", "Gegesik Lor", "Gegesik Wetan", "Sibubut"],
      "Gempol": ["Gempol", "Cupang", "Kempek", "Kedungbunder"],
      "Greged": ["Greged", "Durajaya", "Gumulunglebak", "Sindangkempeng"],
      "Gunungjati": ["Gunungjati", "Benda", "Klayan", "Jadimulya"],
      "Jamblang": ["Jamblang", "Boit", "Bakung Kidul", "Bakung Lor"],
      "Japura Kidul": ["Japura Kidul", "Japura Lor"],
      "Kapetakan": ["Kapetakan", "Bungko", "Dukuh", "Purwawinangun"],
      "Karangsembung": ["Karangsembung", "Karangsuwung", "Kubangkarang", "Tambelang"],
      "Karangwareng": ["Karangwareng", "Blasari", "Karangwuni", "Sumurkondang"],
      "Kedawung": ["Kedawung", "Kertawinangun", "Sutawinangun", "Pilangsari"],
      "Klangenan": ["Klangenan", "Jemaras Kidul", "Jemaras Lor", "Kreyo"],
      "Lemahabang": ["Lemahabang", "Cipeujeuh Wetan", "Cipeujeuh Kulon", "Sindanglaut"],
      "Losari": ["Losari Kidul", "Losari Lor", "Ambro", "Mulyasari"],
      "Mundu": ["Mundu Pesisir", "Bandengan", "Citemu", "Suci"],
      "Pabedilan": ["Pabedilan Kidul", "Pabedilan Lor", "Babakan Losari", "Siliwangi"],
      "Pabuaran": ["Pabuaran Kidul", "Pabuaran Lor", "Hulubanteng", "Jatiseeng"],
      "Palimanan": ["Palimanan", "Balerante", "Ciawi", "Tegalkarang"],
      "Panguragan": ["Panguragan", "Panguragan Kulon", "Panguragan Lor", "Gujeg"],
      "Pasaleman": ["Pasaleman", "Cilengkrang", "Cilengkrang Girang", "Tonjong"],
      "Plered": ["Plered", "Tegalsari", "Kaliwulu", "Weru Lor"],
      "Plumbon": ["Plumbon", "Pabuaran", "Gombang", "Bode Lor"],
      "Sedong": ["Sedong Kidul", "Sedong Lor", "Winduhaji", "Karangwuni"],
      "Sumber": ["Sumber", "Babakan", "Gegunung", "Watubelah"],
      "Suranenggala": ["Suranenggala", "Suranenggala Kidul", "Suranenggala Lor", "Keraton"],
      "Susukan": ["Susukan", "Bunder", "Kedungbunder", "Ujunggebang"],
      "Susukanlebak": ["Susukanlebak", "Ciawi Gajah", "Karangmangu", "Pasawahan"],
      "Talun": ["Talun", "Cirebon Girang", "Kecomberan", "Wanasaba Kidul"],
      "Tengah Tani": ["Tengah Tani", "Gesik", "Kalibaru", "Kemlaka Gede"],
      "Waled": ["Waled Kota", "Cibogo", "Gunungsari", "Karangsari"],
      "Weru": ["Weru Kidul", "Weru Lor", "Megu Gede", "Megu Cilik"]
    },
    "Kota Cirebon": {
      "Kesambi": ["Kesambi", "Drajat", "Karyamulya", "Pekiringan", "Sunyaragi"],
      "Kejaksan": ["Kejaksan", "Kebonbaru", "Sukapura", "Kesenden"],
      "Harjamukti": ["Harjamukti", "Kalijaga", "Argasunya", "Kecapi", "Larangan"],
      "Lemahwungkuk": ["Lemahwungkuk", "Panjunan", "Pegambiran", "Kasepuhan"],
      "Pekalipan": ["Pekalipan", "Pekalangan", "Jagasatru", "Sukalila"]
    },
    "Kota Bandung": {
      "Coblong": ["Dago", "Sadang Serang", "Sekeloa", "Lebak Siliwangi", "Cipaganti"],
      "Lengkong": ["Samoja", "Malabar", "Cikawao", "Turangga", "Burangrang"],
      "Andir": ["Campaka", "Ciroyom", "Dunur", "Kebon Jeruk", "Maleber"],
      "Antapani": ["Antapani Kidul", "Antapani Kulon", "Antapani Wetan", "Antapani Tengah"],
      "Arcamanik": ["Cisaranten Binangkit", "Cisaranten Endah", "Cisaranten Kulon", "Sukamiskin"],
      "Cibeunying Kaler": ["Cihaur Geulis", "Cigadung", "Sukaluyu", "Neglasari"],
      "Cibeunying Kidul": ["Cicadas", "Cikutra", "Padasuka", "Pasirlayung"],
      "Cicendo": ["Arjuna", "Husen Sastranegara", "Pajajaran", "Pamoyanan", "Pasirkaliki"],
      "Kiaracondong": ["Babakan Surabaya", "Cicaheum", "Kebon Jayanti", "Kebon Kangkung", "Sukapura"]
    },
    "Kota Depok": {
      "Beji": ["Pondok Cina", "Kukusan", "Kemiri Muka", "Beji East", "Beji"],
      "Pancoran Mas": ["Depok", "Depok Jaya", "Pancoran Mas", "Rangkapan Jaya"]
    },
    "Kota Bogor": {
      "Bogor Tengah": ["Babakan", "Cibogor", "Paledang", "Sempur", "Tegal Lega"],
      "Bogor Timur": ["Baranangsiang", "Katulampa", "Sindangsari", "Tajur"]
    },
    "Kota Bekasi": {
      "Bekasi Barat": ["Bintara", "Kranji", "Kota Baru", "Bintara Jaya"],
      "Bekasi Selatan": ["Jakasetia", "Pekayon Jaya", "Jakamulya", "Margajaya"]
    }
  },
  "Banten": {
    "Kota Tangerang": {
      "Cipondoh": ["Poris Plawad", "Cipondoh", "Gondrong", "Kenanga"],
      "Karawaci": ["Cimone", "Karawaci", "Boen Tek", "Pabuaran Sub-District"]
    },
    "Kota Tangerang Selatan": {
      "Serpong": ["BSD", "Serpong", "Cilenggang", "Rawa Buntu"],
      "Pamulang": ["Pamulang Barat", "Pamulang Timur", "Pondok Cabe", "Benda Baru"]
    }
  },
  "Jawa Tengah": {
    "Kota Semarang": {
      "Semarang Tengah": ["Sekayu", "Miroto", "Pindrikan Kidul", "Brumbungan"],
      "Semarang Barat": ["Krobokan", "Tawangsari", "Manyaran", "Gisikdrono"]
    },
    "Kota Surakarta (Solo)": {
      "Banjarsari": ["Kadipiro", "Nusukan", "Gilingan", "Keprabon"],
      "Laweyan": ["Purwosari", "Sondakan", "Penumping", "Kerten"]
    }
  },
  "Jawa Timur": {
    "Kota Surabaya": {
      "Tegalsari": ["Kedungdoro", "Dr. Soetomo", "Tegalsari", "Keputran"],
      "Wonokromo": ["Darmo", "Sawunggaling", "Wonokromo", "Ngagel"]
    },
    "Kota Malang": {
      "Lowokwaru": ["Dinoyo", "Tlogomas", "Tunggulwulung", "Jatimulyo"],
      "Klojen": ["Penanggungan", "Klojen", "Oro-oro Dowo", "Bareng"]
    }
  },
  "D.I. Yogyakarta": {
    "Kota Yogyakarta": {
      "Umbulharjo": ["Muja Muju", "Semaki", "Tahunan", "Sorosutan"],
      "Gondokusuman": ["Kotabaru", "Klitren", "Terban", "Baciro"]
    },
    "Kab. Sleman": {
      "Depok": ["Caturtunggal", "Condongcatur", "Maguwoharjo"],
      "Mlati": ["Sinduadi", "Sendangadi", "Tlogoadi"]
    }
  },
  "Bali": {
    "Kota Denpasar": {
      "Denpasar Barat": ["Pemecutan", "Dauh Puri", "Padangsambian"],
      "Denpasar Timur": ["Kesiman", "Sumerta", "Penatih"]
    },
    "Kab. Badung": {
      "Kuta": ["Seminyak", "Legian", "Kuta", "Tuban"],
      "Mengwi": ["Canggu", "Mengwi", "Seseh", "Kapal"]
    }
  },
  "Sumatera Utara": {
    "Kota Medan": {
      "Medan Baru": ["Padang Bulan", "Darat", "Babura", "Merdeka"],
      "Medan Selayang": ["Padang Bulan Selayang II", "Beringin", "Sempakata"]
    }
  },
  "Papua Barat Daya": {
    "Kota Sorong": {
      "Sorong": ["Sorong", "Remu", "Klademak", "Malaingkedi"]
    }
  },
  "Papua Tengah": {
    "Kab. Nabire": {
      "Nabire": ["Oyehe", "Girimulyo", "Karang Mulia", "Kali Bobo"]
    }
  }
};

const normalizeStr = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/^(kab\.|kabupaten|kota|provinsi|desa|kelurahan|kecamatan)\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getPostalCodeForKecamatan = (kec: string, kab: string = ""): string => {
  const norm = normalizeStr(kec);
  const normKab = normalizeStr(kab);

  // Resolve overlaps (e.g. Depok as a kabupaten vs Sleman district vs Cirebon district)
  if (norm === "depok") {
    if (normKab.includes("sleman")) return "55281";
    if (normKab.includes("cirebon")) return "45155";
    return "16424"; // Default to Kota Depok
  }

  // Papua
  if (norm === "sorong") return "98413";
  if (norm === "nabire") return "98811";

  // Kabupaten Cirebon
  if (norm === "arjawinangun") return "45162";
  if (norm === "astanajapura") return "45181";
  if (norm === "babakan") return "45191";
  if (norm === "beber") return "45172";
  if (norm === "ciledug") return "45197";
  if (norm === "ciwaringin") return "45167";
  if (norm === "dukupuntang") return "45612";
  if (norm === "gebang") return "45194";
  if (norm === "gegesik") return "45164";
  if (norm === "gempol") return "45161";
  if (norm === "greged") return "45172";
  if (norm === "gunungjati") return "45151";
  if (norm === "jamblang") return "45156";
  if (norm === "japura kidul") return "45181";
  if (norm === "kapetakan") return "45152";
  if (norm === "karangsembung") return "45186";
  if (norm === "karangwareng") return "45186";
  if (norm === "kedawung") return "45153";
  if (norm === "klangenan") return "45156";
  if (norm === "lemahabang") return "45183";
  if (norm === "losari") return "45174";
  if (norm === "mundu") return "45173";
  if (norm === "pabedilan") return "45193";
  if (norm === "pabuaran") return "45188";
  if (norm === "palimanan") return "45161";
  if (norm === "panguragan") return "45163";
  if (norm === "pasaleman") return "45197";
  if (norm === "plered") return "45154";
  if (norm === "plumbon") return "45155";
  if (norm === "sedong") return "45187";
  if (norm === "sumber") return "45611";
  if (norm === "suranenggala") return "45151";
  if (norm === "susukan") return "45166";
  if (norm === "susukanlebak") return "45185";
  if (norm === "talun") return "45171";
  if (norm === "tengah tani") return "45153";
  if (norm === "waled") return "45187";
  if (norm === "weru") return "45154";

  // Kota Cirebon
  if (norm === "kesambi") return "45134";
  if (norm === "kejaksan") return "45123";
  if (norm === "harjamukti") return "45143";
  if (norm === "lemahwungkuk") return "45111";
  if (norm === "pekalipan") return "45117";

  // Jakarta, Bandung, Banten, dsb.
  if (norm === "tebet") return "12810";
  if (norm === "cilandak") return "12430";
  if (norm === "kebayoran baru") return "12110";
  if (norm === "pasar minggu") return "12510";
  if (norm === "gambir") return "10110";
  if (norm === "menteng") return "10310";
  if (norm === "tanah abang") return "10210";
  if (norm === "kelapa gading") return "14240";
  if (norm === "tanjung priok") return "14310";
  if (norm === "kembangan") return "11610";
  if (norm === "palmerah") return "11480";
  if (norm === "jatinegara") return "13310";
  if (norm === "duren sawit") return "13440";
  if (norm === "coblong") return "40135";
  if (norm === "lengkong") return "40262";
  if (norm === "andir") return "40181";
  if (norm === "antapani") return "40291";
  if (norm === "arcamanik") return "40293";
  if (norm === "cibeunying kaler") return "40122";
  if (norm === "cibeunying kidul") return "40124";
  if (norm === "cicendo") return "40171";
  if (norm === "kiaracondong") return "40281";
  if (norm === "beji") return "16424";
  if (norm === "pancoran mas") return "16431";
  if (norm === "bogor tengah") return "16122";
  if (norm === "bogor timur") return "16142";
  if (norm === "bekasi barat") return "17133";
  if (norm === "bekasi selatan") return "17148";
  if (norm === "cipondoh") return "15148";
  if (norm === "karawaci") return "15115";
  if (norm === "serpong") return "15310";
  if (norm === "pamulang") return "15417";
  if (norm === "semarang tengah") return "50131";
  if (norm === "semarang barat") return "50141";
  if (norm === "banjarsari") return "57131";
  if (norm === "laweyan") return "57141";
  if (norm === "tegalsari") return "60261";
  if (norm === "wonokromo") return "60241";
  if (norm === "lowokwaru") return "65141";
  if (norm === "klojen") return "65111";
  if (norm === "umbulharjo") return "55161";
  if (norm === "mlati") return "55284";
  if (norm === "denpasar barat") return "80119";
  if (norm === "denpasar timur") return "80239";
  if (norm === "kuta") return "80361";
  if (norm === "mengwi") return "80351";
  if (norm === "medan baru") return "20153";
  if (norm === "medan selayang") return "20131";
  return "";
};

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
  isOfflineMode?: boolean;
}

export default function CartAndCheckoutModal({
  cartItems,
  settings,
  promos,
  onUpdateQty,
  onRemoveItem,
  onClose,
  onCheckoutSuccess,
  isOfflineMode = false
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

  const [validationError, setValidationError] = useState("");

  // Promo Engine
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState("");

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
    } else if (appliedPromo.type === "free_shipping") {
      discountAmount = 0; // No courier fees exist to discount
    }
  }

  const shippingCost = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

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
      shippingCourier: "WA Admin",
      shippingCost: 0,
      shippingOption: "TBD via Chat",
      estimatedDays: "TBD via Chat",
      paymentMethod,
      paymentBank: paymentMethod === "Transfer Bank" ? selectedBank : null,
      totalWeight,
      subtotal,
      discountAmount,
      total: finalTotal,
      notes,
      voucherCode: appliedPromo ? appliedPromo.code : null
    };

    if (isOfflineMode) {
      setTimeout(() => {
        setLoadingCheckout(false);
        onCheckoutSuccess(payload);
      }, 800);
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid response JSON");
      }
      if (response.ok && data.success) {
        onCheckoutSuccess(data.order);
      } else {
        console.warn("Server checkout returned unsuccessful state. Processing locally instead.", data);
        onCheckoutSuccess({ ...payload, isFallbackOffline: true });
      }
    } catch (err) {
      console.warn("Local network fetch error. Processing checkout locally as fallback.", err);
      // Fallback seamlessly
      onCheckoutSuccess({ ...payload, isFallbackOffline: true });
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
                  src={(item.product.images && item.product.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"} 
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
          <span className="text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
            Dihitung via WhatsApp Admin
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
                <div className="flex justify-between items-center pb-1">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Alamat Pengiriman</h3>
                </div>
                
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
                      placeholder="Provinsi (Contoh: Jawa Timur)"
                      value={provinsi}
                      onChange={(e) => setProvinsi(e.target.value)}
                      className="w-full text-xs font-semibold py-3.5 px-4 bg-zinc-50/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder-zinc-400 focus:bg-white transition-all"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Kabupaten / Kota (Contoh: Surabaya)"
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
              {validationError && (
                <div className="p-3.5 bg-red-50 border border-red-250 text-red-900 rounded-md text-xs font-semibold leading-relaxed flex items-start gap-2.5 mt-8">
                  <span className="text-sm mt-0.5 select-none text-red-600">❌</span>
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wider text-[10px] text-red-800 mb-1">Peringatan Alamat Wilayah</p>
                    <p className="text-[11.5px] text-red-700 leading-normal">{validationError}</p>
                  </div>
                </div>
              )}

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
