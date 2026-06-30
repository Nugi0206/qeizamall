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
import { getAuth } from "firebase/auth";
import { Product, Order, Settings, Promo, StockLog, BlogPost } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Products
export async function fetchProductsClient(): Promise<Product[]> {
  const path = "products";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data() as Product);
    });
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return []; // fallback but unreachable since handleFirestoreError throws
  }
}

export async function saveProductClient(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, "products", product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductClient(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Orders
export async function fetchOrdersClient(): Promise<Order[]> {
  const path = "orders";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveOrderClient(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, "orders", order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderClient(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    await deleteDoc(doc(db, "orders", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Promos
export async function fetchPromosClient(): Promise<Promo[]> {
  const path = "promos";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const promos: Promo[] = [];
    querySnapshot.forEach((doc) => {
      promos.push(doc.data() as Promo);
    });
    return promos;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function savePromoClient(promo: Promo): Promise<void> {
  const path = `promos/${promo.id}`;
  try {
    await setDoc(doc(db, "promos", promo.id), promo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePromoClient(id: string): Promise<void> {
  const path = `promos/${id}`;
  try {
    await deleteDoc(doc(db, "promos", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Settings
export async function fetchSettingsClient(): Promise<Settings | null> {
  const path = "settings/global";
  try {
    const docSnap = await getDoc(doc(db, "settings", "global"));
    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveSettingsClient(settings: Settings): Promise<void> {
  const path = "settings/global";
  try {
    await setDoc(doc(db, "settings", "global"), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Stock Logs
export async function fetchStockLogsClient(): Promise<StockLog[]> {
  const path = "stockLogs";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const logs: StockLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as StockLog);
    });
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveStockLogClient(log: StockLog): Promise<void> {
  const path = `stockLogs/${log.id}`;
  try {
    await setDoc(doc(db, "stockLogs", log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Blog Posts
export async function fetchBlogPostsClient(): Promise<BlogPost[]> {
  const path = "blogPosts";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const posts: BlogPost[] = [];
    querySnapshot.forEach((doc) => {
      posts.push(doc.data() as BlogPost);
    });
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}
