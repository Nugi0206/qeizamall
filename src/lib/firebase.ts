import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { Product, Order, Settings, Promo, StockLog, BlogPost } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 1. Products
export async function fetchProductsClient(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products: Product[] = [];
  querySnapshot.forEach((doc) => {
    products.push(doc.data() as Product);
  });
  return products;
}

export async function saveProductClient(product: Product): Promise<void> {
  await setDoc(doc(db, "products", product.id), product);
}

export async function deleteProductClient(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

// 2. Orders
export async function fetchOrdersClient(): Promise<Order[]> {
  const querySnapshot = await getDocs(collection(db, "orders"));
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push(doc.data() as Order);
  });
  // Sort by invoice or date descending if possible
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveOrderClient(order: Order): Promise<void> {
  await setDoc(doc(db, "orders", order.id), order);
}

export async function deleteOrderClient(id: string): Promise<void> {
  await deleteDoc(doc(db, "orders", id));
}

// 3. Promos
export async function fetchPromosClient(): Promise<Promo[]> {
  const querySnapshot = await getDocs(collection(db, "promos"));
  const promos: Promo[] = [];
  querySnapshot.forEach((doc) => {
    promos.push(doc.data() as Promo);
  });
  return promos;
}

export async function savePromoClient(promo: Promo): Promise<void> {
  await setDoc(doc(db, "promos", promo.id), promo);
}

export async function deletePromoClient(id: string): Promise<void> {
  await deleteDoc(doc(db, "promos", id));
}

// 4. Settings
export async function fetchSettingsClient(): Promise<Settings | null> {
  const docSnap = await getDoc(doc(db, "settings", "global"));
  if (docSnap.exists()) {
    return docSnap.data() as Settings;
  }
  return null;
}

export async function saveSettingsClient(settings: Settings): Promise<void> {
  await setDoc(doc(db, "settings", "global"), settings);
}

// 5. Stock Logs
export async function fetchStockLogsClient(): Promise<StockLog[]> {
  const querySnapshot = await getDocs(collection(db, "stockLogs"));
  const logs: StockLog[] = [];
  querySnapshot.forEach((doc) => {
    logs.push(doc.data() as StockLog);
  });
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveStockLogClient(log: StockLog): Promise<void> {
  await setDoc(doc(db, "stockLogs", log.id), log);
}

// 6. Blog Posts
export async function fetchBlogPostsClient(): Promise<BlogPost[]> {
  const querySnapshot = await getDocs(collection(db, "blogPosts"));
  const posts: BlogPost[] = [];
  querySnapshot.forEach((doc) => {
    posts.push(doc.data() as BlogPost);
  });
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
