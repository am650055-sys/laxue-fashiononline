import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from './firebase';
import { Product, Category, RakhiOfferConfig, StoreSettings, Order, Coupon, BannerConfig, PaymentSettingsRecord } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_RAKHI_OFFER,
  INITIAL_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
} from '../data/initialData';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const COUPONS_COLLECTION = 'coupons';
const BANNERS_COLLECTION = 'banners';

/**
 * Seed initial catalog to Firestore if the collection is empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsRef);
    if (snap.empty) {
      console.log('[FIREBASE SEED] Seeding initial products to Firestore...');
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        const prodDoc = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(prodDoc, {
          ...prod,
          status: prod.status || 'published',
          visibility: prod.visibility || 'online',
          createdAt: prod.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      await batch.commit();
      console.log(`[FIREBASE SEED] Successfully seeded ${INITIAL_PRODUCTS.length} products.`);
    }

    // Seed Categories
    const catRef = collection(db, CATEGORIES_COLLECTION);
    const catSnap = await getDocs(catRef);
    if (catSnap.empty) {
      const batch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        const catDoc = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catDoc, cat);
      }
      await batch.commit();
    }

    // Seed Settings & Payment Settings
    const settingsDoc = doc(db, SETTINGS_COLLECTION, 'store_config');
    const setSnap = await getDoc(settingsDoc);
    if (!setSnap.exists()) {
      await setDoc(settingsDoc, {
        ...INITIAL_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    const upiDoc = doc(db, SETTINGS_COLLECTION, 'payment_settings');
    const upiSnap = await getDoc(upiDoc);
    if (!upiSnap.exists()) {
      await setDoc(upiDoc, {
        ...INITIAL_PAYMENT_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed Rakhi Offer
    const rakhiDoc = doc(db, SETTINGS_COLLECTION, 'rakhi_offer');
    const rakhiSnap = await getDoc(rakhiDoc);
    if (!rakhiSnap.exists()) {
      await setDoc(rakhiDoc, {
        ...INITIAL_RAKHI_OFFER,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[FIREBASE SEED ERROR]:', err);
  }
}

/**
 * Real-time listener for Products.
 * @param includeDrafts If false, filters only published & online products for the customer storefront.
 * @param callback Callback invoked whenever Firestore updates.
 */
export function subscribeToProducts(
  includeDrafts: boolean,
  callback: (products: Product[]) => void
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  
  // Real-time snapshot listener
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        const p: Product = {
          ...data,
          id: docSnap.id, // Guarantee exact Firebase document ID
          status: data.status || 'published',
          visibility: data.visibility || 'online',
          gallery: Array.isArray(data.gallery) && data.gallery.length > 0
            ? data.gallery
            : [data.image].filter(Boolean),
          image: data.image || (data.gallery && data.gallery[0]) || '',
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
          colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : ['Maroon / Wine'],
        };

        if (includeDrafts) {
          prods.push(p);
        } else {
          // Storefront customer filtering: only published and not hidden
          if (p.status === 'published' && p.visibility !== 'hidden') {
            prods.push(p);
          }
        }
      });

      // Sort newest first by default
      prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(prods);
    },
    (err) => {
      console.error('[FIRESTORE PRODUCT LISTENER ERROR]:', err);
    }
  );
}

/**
 * Delete a product document directly from Firebase by its exact Document ID.
 */
export async function deleteProductFromFirebase(productId: string): Promise<boolean> {
  if (!productId || typeof productId !== 'string') {
    throw new Error('Valid Product Document ID is required for deletion.');
  }

  const prodDocRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(prodDocRef);
  console.log(`[FIRESTORE] Deleted product doc ID: ${productId}`);
  return true;
}

/**
 * Create or replace a product document in Firebase.
 */
export async function saveProductToFirebase(productData: Partial<Product> & { name: string }): Promise<Product> {
  const docId = productData.id || `lux-${Date.now().toString().slice(-6)}`;
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, docId);

  const price = Number(productData.price || 0);
  const originalPrice = Number(productData.originalPrice || price);
  const discountPercent = originalPrice > price && originalPrice > 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : Number(productData.discountPercent || 0);

  const gallery = Array.isArray(productData.gallery) && productData.gallery.length > 0
    ? productData.gallery
    : [productData.image || ''].filter(Boolean);

  const mainImage = gallery[0] || productData.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000';

  const fullProduct: Product = {
    id: docId,
    name: productData.name.trim(),
    shortDescription: productData.shortDescription?.trim() || productData.description?.slice(0, 150) || '',
    description: productData.description?.trim() || '',
    category: productData.category || 'Kurtis',
    subcategory: productData.subcategory?.trim() || 'Printed Kurtis',
    price,
    originalPrice,
    discountPercent,
    bestPrice: productData.bestPrice || Math.round(price * 0.85),
    image: mainImage,
    gallery: gallery.length > 0 ? gallery : [mainImage],
    sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : ['Maroon / Wine'],
    fabric: productData.fabric?.trim() || 'Premium Fabric',
    stock: Number(productData.stock ?? 25),
    rating: Number(productData.rating || 4.8),
    reviewsCount: Number(productData.reviewsCount || 1),
    isNewArrival: Boolean(productData.isNewArrival ?? true),
    isBestSeller: Boolean(productData.isBestSeller ?? false),
    isTrending: Boolean(productData.isTrending ?? true),
    isFeatured: Boolean(productData.isFeatured ?? true),
    isRakhiGiftEligible: Boolean(productData.isRakhiGiftEligible ?? true),
    status: productData.status || 'published',
    visibility: productData.visibility || 'online',
    sku: productData.sku || `LUX-MPK-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: productData.createdAt || new Date().toISOString(),
  };

  await setDoc(prodDocRef, {
    ...fullProduct,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log(`[FIRESTORE] Saved product doc ID: ${docId}`);
  return fullProduct;
}

/**
 * Update partial fields on a product document in Firebase.
 */
export async function updateProductInFirebase(productId: string, updates: Partial<Product>): Promise<void> {
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(prodDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  console.log(`[FIRESTORE] Updated product doc ID: ${productId}`);
}

/**
 * Real-time listener for Payment Settings (UPI ID, merchant name, toggles).
 */
export function subscribeToPaymentSettings(callback: (settings: PaymentSettingsRecord) => void): () => void {
  const upiDocRef = doc(db, SETTINGS_COLLECTION, 'payment_settings');
  return onSnapshot(upiDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as PaymentSettingsRecord);
    }
  }, (err) => {
    console.error('[FIRESTORE UPI LISTENER ERROR]:', err);
  });
}

/**
 * Update Payment Settings in Firebase.
 */
export async function savePaymentSettingsToFirebase(payload: {
  merchantUpiId?: string;
  upiId?: string;
  merchantName?: string;
  businessName?: string;
  upiEnabled: boolean;
  cardEnabled?: boolean;
  testModeEnabled?: boolean;
}): Promise<PaymentSettingsRecord> {
  const upiDocRef = doc(db, SETTINGS_COLLECTION, 'payment_settings');
  const upiId = (payload.upiId || payload.merchantUpiId || 'testone@upi').trim();
  const businessName = (payload.businessName || payload.merchantName || 'LUXUE FASHION ONLINE').trim();
  
  const record: PaymentSettingsRecord = {
    upiId,
    businessName,
    upiEnabled: payload.upiEnabled !== false,
    cardEnabled: payload.cardEnabled !== false,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin Console',
  };

  await setDoc(upiDocRef, record, { merge: true });

  // Also update in store_config for backward compatibility
  const storeConfigRef = doc(db, SETTINGS_COLLECTION, 'store_config');
  await setDoc(storeConfigRef, {
    merchantUpiId: upiId,
    merchantName: businessName,
    paymentSettings: {
      merchantUpiId: upiId,
      merchantName: businessName,
      upiEnabled: record.upiEnabled,
      cardEnabled: record.cardEnabled,
      testModeEnabled: !!payload.testModeEnabled,
      lastUpdated: record.updatedAt,
      lastUpdatedBy: 'Admin Console',
    }
  }, { merge: true });

  return record;
}

/**
 * Real-time listener for Orders.
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(ordersRef, (snap) => {
    const orders: Order[] = [];
    snap.forEach((d) => {
      orders.push({ ...(d.data() as Order), id: d.id });
    });
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(orders);
  }, (err) => {
    console.error('[FIRESTORE ORDERS LISTENER ERROR]:', err);
  });
}

/**
 * Save / Create an order in Firebase.
 */
export async function saveOrderToFirebase(order: Order): Promise<Order> {
  const orderDocRef = doc(db, ORDERS_COLLECTION, order.id);
  await setDoc(orderDocRef, {
    ...order,
    updatedAt: new Date().toISOString(),
  });
  return order;
}

/**
 * Update order status or payment verification in Firebase.
 */
export async function updateOrderInFirebase(orderId: string, updates: Partial<Order>): Promise<void> {
  const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
