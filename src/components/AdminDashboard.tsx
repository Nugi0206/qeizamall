/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Order, Product, StockLog, Promo, Settings } from "../types";
import AdminOverview from "./admin/AdminOverview";
import AdminOrders from "./admin/AdminOrders";
import AdminStock from "./admin/AdminStock";
import AdminPromosAndCustomers from "./admin/AdminPromosAndCustomers";
import AdminSettings from "./admin/AdminSettings";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

import { 
  X, LogIn, LayoutDashboard, ShoppingCart, 
  Boxes, Tag, Settings as SettingsIcon, LogOut, Lock, Mail, Play, ArrowLeft, Menu
} from "lucide-react";

// Initialize Firebase client
const firebaseClientApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseClientApp);

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  stockLogs: StockLog[];
  promos: Promo[];
  settings: Settings;
  onRefreshData: () => void;
  onUpdateOrderStatus: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => Promise<boolean>;
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAddPromo: (promo: Omit<Promo, "id"> & { id?: string }) => void;
  onDeletePromo: (id: string) => void;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  onExitAdmin?: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  stockLogs,
  promos,
  settings,
  onRefreshData,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddPromo,
  onDeletePromo,
  onUpdateSettings,
  onExitAdmin
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "stock" | "promos" | "settings">("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const allowedEmails = ["muhamadnugiandri@gmail.com", "admin@qeiza.com"];
        if (user.email && allowedEmails.includes(user.email.toLowerCase().trim())) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setLoginError("");
        } else {
          setLoginError(`Akses ditolak: ${user.email} tidak terdaftar sebagai administrator.`);
          setIsAuthenticated(false);
          setCurrentUser(null);
          signOut(auth).catch(err => console.error("Sign out error:", err));
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Standard credentials login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError("");
    setTimeout(() => {
      if (email.trim() === "admin@qeiza.com" && password === "admin123") {
        setIsAuthenticated(true);
        setCurrentUser({ email: "admin@qeiza.com", displayName: "Default Admin" } as User);
      } else if (email.trim().toLowerCase() === "muhamadnugiandri@gmail.com") {
        setLoginError("Untuk email muhamadnugiandri@gmail.com, silakan gunakan tombol 'Login Instan dengan Google Akun' di bawah.");
      } else {
        setLoginError("Email atau password administrator salah! (Gunakan tombol Google Sign-In atau kredensial default)");
      }
      setLoadingLogin(false);
    }, 600);
  };

  const handleGoogleLogin = async () => {
    setLoadingLogin(true);
    setLoginError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const allowedEmails = ["muhamadnugiandri@gmail.com", "admin@qeiza.com"];
      if (user.email && allowedEmails.includes(user.email.toLowerCase().trim())) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setLoginError(`Akses ditolak: ${user.email} tidak terdaftar sebagai administrator.`);
        setIsAuthenticated(false);
        setCurrentUser(null);
        await signOut(auth);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        setLoginError(`Gagal masuk dengan Google: ${error.message}`);
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Analisa Keuangan", icon: LayoutDashboard },
    { id: "orders", label: "Daftar Pesanan", icon: ShoppingCart },
    { id: "stock", label: "Manajemen Stok", icon: Boxes },
    { id: "promos", label: "Kupon & Pelanggan", icon: Tag },
    { id: "settings", label: "Kelola Toko / Sistem", icon: SettingsIcon },
  ] as const;

  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-8 border border-zinc-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <span className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xl mx-auto">
              Q
            </span>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight uppercase">QEIZA PORTAL ERP</h1>
            <p className="text-[11px] text-zinc-400 font-medium">Masuk untuk mengelola stok, status order, laporan keuangan, dan promo secara aman.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Email Administrator</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="admin@qeiza.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 pl-10 bg-zinc-50"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Kata Sandi (Password)</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 pl-10 bg-zinc-50"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-400" />
              </div>
            </div>

            <button
              id="confirm-login-btn"
              type="submit"
              disabled={loadingLogin}
              className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-300 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md shadow-zinc-950/10 flex items-center justify-center gap-2"
            >
              {loadingLogin ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  <span>Masuk dengan Kredensial</span>
                </>
              )}
            </button>
          </form>

          {/* Social Google log-in mock */}
          <div className="space-y-4 border-t border-zinc-150 pt-5">
            <div className="relative flex py-1 items-center justify-center">
              <div className="flex-grow border-t border-zinc-150"></div>
              <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Atau</span>
              <div className="flex-grow border-t border-zinc-150"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loadingLogin}
              type="button"
              className="w-full py-3 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.44-.63-.74-1.34-.84-2.09l3.65-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Login Instan dengan Google Akun</span>
            </button>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-950 font-semibold underline underline-offset-4 transition-colors pt-2 block"
              >
                Kembali ke Halaman Utama Toko
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row font-sans">
      {/* MOBILE TOPBAR HEADER - only visible on mobile/tablet screens (< lg) */}
      <header className="lg:hidden h-16 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg text-zinc-950 flex items-center justify-center font-extrabold text-sm">
            Q
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-tight block">QEIZA PORTAL ERP</span>
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">Control Panel</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION: Admin Layout - hidden during browser printing */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-zinc-950 text-zinc-400 p-6 flex flex-col justify-between shrink-0 no-print border-r border-zinc-800 transform lg:transform-none transition-transform duration-300 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-8">
          {/* Brand header Logo details */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg text-zinc-950 flex items-center justify-center font-extrabold text-base">
                Q
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-tight block">QEIZA PORTAL ERP</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mt-0.5">Control Panel</span>
              </div>
            </div>
            {/* Close button inside drawer for better UX on mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Admin user block */}
          {currentUser && (
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-indigo-500/20">
                {currentUser.photoURL ? (
                  <img referrerPolicy="no-referrer" src={currentUser.photoURL} alt="Admin" className="w-full h-full rounded-full" />
                ) : (
                  (currentUser.displayName || currentUser.email || "A").slice(0, 1)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block leading-none">Aktif Sebagai</span>
                <span className="text-xs font-bold text-white block truncate mt-1">
                  {currentUser.displayName || "Administrator"}
                </span>
                <span className="text-[9px] text-zinc-400 block truncate font-medium">
                  {currentUser.email}
                </span>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

              return (
                <button
                  id={`tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold font-sans transition-all leading-none ${
                    activeTab === tab.id 
                      ? "bg-zinc-800 text-white shadow-xs" 
                      : "hover:bg-zinc-900/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className="w-5 h-5 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === "orders" && pendingOrdersCount > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shrink-0">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sync and logouts bottom action buttons */}
        <div className="space-y-3 pt-6 border-t border-zinc-900">
          <button
            onClick={() => {
              onRefreshData();
              alert("Data backend toko berhasil disegarkan!");
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <Play className="w-4 h-4 text-zinc-400" />
            <span>Segarkan Database</span>
          </button>
          
          {onExitAdmin && (
            <button
              onClick={() => {
                onExitAdmin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400" />
              <span>Kembali ke Toko</span>
            </button>
          )}

          <button
            onClick={() => {
              signOut(auth).catch(err => console.error("Sign out error:", err));
              setIsAuthenticated(false);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE AREA: Dynamic tabs content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {/* Render active workspace panel */}
        {activeTab === "overview" && (
          <AdminOverview 
            orders={orders} 
            products={products}
            stockLogs={stockLogs}
          />
        )}

        {activeTab === "orders" && (
          <AdminOrders 
            orders={orders} 
            onUpdateOrderStatus={onUpdateOrderStatus}
            onDeleteOrder={onDeleteOrder}
          />
        )}

        {activeTab === "stock" && (
          <AdminStock 
            products={products}
            stockLogs={stockLogs}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
          />
        )}

        {activeTab === "promos" && (
          <AdminPromosAndCustomers 
            orders={orders}
            promos={promos}
            onAddPromo={onAddPromo}
            onDeletePromo={onDeletePromo}
          />
        )}

        {activeTab === "settings" && (
          <AdminSettings 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            products={products}
          />
        )}
      </main>
    </div>
  );
}
