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
 * Seed initial catalog to Firestore if the collection is empty or missing products.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsRef);

    const existingDocs = snap.docs;
    const existingDocIds = new Set(existingDocs.map(d => d.id));

    // If empty or missing initial catalog products, seed / sync all 20
    const missingAnyCatalog = INITIAL_PRODUCTS.some(p => !existingDocIds.has(p.id));
    const hasLegacyIds = existingDocIds.has('lux-prod-10-olive-heritage-motif') || existingDocIds.has('lux-prod-11-midnight-navy-architectural');

    if (snap.empty || missingAnyCatalog || hasLegacyIds) {
      console.log('[FIREBASE SEED] Seeding / syncing all 20 curated products to Firestore with displayOrder 1-20...');
      const batch = writeBatch(db);

      // Clean up legacy IDs
      if (existingDocIds.has('lux-prod-10-olive-heritage-motif')) {
        batch.delete(doc(db, PRODUCTS_COLLECTION, 'lux-prod-10-olive-heritage-motif'));
      }
      if (existingDocIds.has('lux-prod-11-midnight-navy-architectural')) {
        batch.delete(doc(db, PRODUCTS_COLLECTION, 'lux-prod-11-midnight-navy-architectural'));
      }

      INITIAL_PRODUCTS.forEach((prod, index) => {
        const prodDoc = doc(db, PRODUCTS_COLLECTION, prod.id);
        const galleryUrls = Array.isArray(prod.gallery) && prod.gallery.length > 0
          ? prod.gallery
          : [prod.image].filter(Boolean);

        batch.set(prodDoc, {
          ...prod,
          displayOrder: typeof prod.displayOrder === 'number' ? prod.displayOrder : index + 1,
          published: prod.published !== false,
          status: prod.status || 'published',
          visibility: prod.visibility || 'online',
          mrp: prod.mrp || prod.originalPrice || 2999,
          originalPrice: prod.originalPrice || prod.mrp || 2999,
          price: prod.price || 1499,
          discount: prod.discount || prod.discountPercent || 50,
          discountPercent: prod.discountPercent || prod.discount || 50,
          images: galleryUrls,
          gallery: galleryUrls,
          image: prod.image || galleryUrls[0] || '',
          stock: typeof prod.stock === 'number' ? prod.stock : 50,
          stockStatus: prod.stockStatus || 'In Stock',
          createdAt: prod.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      });

      await batch.commit();
      console.log(`[FIREBASE SEED] Successfully seeded/updated ${INITIAL_PRODUCTS.length} products in Firestore.`);
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
 * Explicitly sync/publish all 20 curated catalog products to Firebase Firestore.
 */
export async function syncCatalog20ToFirebase(): Promise<{ success: boolean; count: number }> {
  try {
    console.log('[FIREBASE SYNC] Syncing 20 catalog products to Firestore with displayOrder 1..20...');
    const batch = writeBatch(db);

    // Clean up potential legacy IDs to prevent any duplication
    const legacyIds = [
      'lux-prod-10-olive-heritage-motif',
      'lux-prod-11-midnight-navy-architectural'
    ];
    for (const legId of legacyIds) {
      const legDoc = doc(db, PRODUCTS_COLLECTION, legId);
      batch.delete(legDoc);
    }

    INITIAL_PRODUCTS.forEach((prod, index) => {
      const prodDoc = doc(db, PRODUCTS_COLLECTION, prod.id);
      const galleryUrls = Array.isArray(prod.gallery) && prod.gallery.length > 0
        ? prod.gallery
        : [prod.image].filter(Boolean);

      batch.set(prodDoc, {
        ...prod,
        displayOrder: typeof prod.displayOrder === 'number' ? prod.displayOrder : index + 1,
        published: true,
        status: 'published',
        visibility: 'online',
        mrp: prod.mrp || prod.originalPrice || 2999,
        originalPrice: prod.originalPrice || prod.mrp || 2999,
        price: prod.price || 1499,
        discount: prod.discount || prod.discountPercent || 50,
        discountPercent: prod.discountPercent || prod.discount || 50,
        images: galleryUrls,
        gallery: galleryUrls,
        image: prod.image || galleryUrls[0] || '',
        stock: typeof prod.stock === 'number' ? prod.stock : 50,
        stockStatus: 'In Stock',
        createdAt: prod.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    });

    // Sync categories
    for (const cat of INITIAL_CATEGORIES) {
      const catDoc = doc(db, CATEGORIES_COLLECTION, cat.id);
      batch.set(catDoc, cat, { merge: true });
    }

    await batch.commit();
    console.log(`[FIREBASE SYNC] Successfully synced ${INITIAL_PRODUCTS.length} products to Firestore.`);
    return { success: true, count: INITIAL_PRODUCTS.length };
  } catch (err) {
    console.error('[FIREBASE SYNC ERROR]:', err);
    throw err;
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
        const galleryList = Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : (Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [data.image].filter(Boolean));

        const mainImg = data.image || galleryList[0] || '';
        const isPublished = data.published !== false && data.status !== 'draft' && data.visibility !== 'hidden';

        const p: Product = {
          ...data,
          id: docSnap.id, // Guarantee exact Firebase document ID
          published: isPublished,
          status: isPublished ? 'published' : 'draft',
          visibility: isPublished ? 'online' : 'hidden',
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : undefined,
          mrp: data.mrp || data.originalPrice || 2999,
          originalPrice: data.originalPrice || data.mrp || 2999,
          price: Number(data.price || 0),
          discount: data.discount || data.discountPercent || 50,
          discountPercent: data.discountPercent || data.discount || 50,
          images: galleryList,
          gallery: galleryList,
          image: mainImg,
          stock: typeof data.stock === 'number' ? data.stock : 50,
          stockStatus: data.stockStatus || (typeof data.stock === 'number' && data.stock <= 0 ? 'Out of Stock' : 'In Stock'),
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
          colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : ['Maroon / Wine'],
        };

        if (includeDrafts) {
          prods.push(p);
        } else {
          // Storefront customer filtering: only published and not hidden
          if (isPublished) {
            prods.push(p);
          }
        }
      });

      // Sort by displayOrder ascending (1..20 first), then un-ordered products newest first
      prods.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 99999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 99999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

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
 * Create or replace a product document in Firebase with full verification.
 */
export async function saveProductToFirebase(productData: Partial<Product> & { name: string }): Promise<Product> {
  const docId = productData.id || `lux-${Date.now().toString().slice(-6)}`;
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, docId);

  const price = Number(productData.price || 0);
  const mrp = Number(productData.mrp || productData.originalPrice || price);
  const discount = mrp > price && mrp > 0
    ? Math.round(((mrp - price) / mrp) * 100)
    : Number(productData.discount || productData.discountPercent || 0);

  const gallery = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : (Array.isArray(productData.gallery) && productData.gallery.length > 0
      ? productData.gallery
      : [productData.image || ''].filter(Boolean));

  const mainImage = gallery[0] || productData.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000';
  const isPublished = productData.published !== false && productData.status !== 'draft' && productData.visibility !== 'hidden';

  const fullProduct: Product = {
    id: docId,
    name: productData.name.trim(),
    shortDescription: productData.shortDescription?.trim() || productData.description?.slice(0, 150) || '',
    description: productData.description?.trim() || '',
    category: productData.category || 'Kurtis',
    subcategory: productData.subcategory?.trim() || 'Printed Kurtis',
    price,
    originalPrice: mrp,
    mrp,
    discountPercent: discount,
    discount,
    bestPrice: productData.bestPrice || Math.round(price * 0.85),
    image: mainImage,
    gallery: gallery.length > 0 ? gallery : [mainImage],
    images: gallery.length > 0 ? gallery : [mainImage],
    sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : ['Maroon / Wine'],
    fabric: productData.fabric?.trim() || 'Premium Fabric',
    stock: typeof productData.stock === 'number' ? productData.stock : 50,
    stockStatus: productData.stockStatus || (typeof productData.stock === 'number' && productData.stock <= 0 ? 'Out of Stock' : 'In Stock'),
    rating: Number(productData.rating || 4.8),
    reviewsCount: Number(productData.reviewsCount || 1),
    isNewArrival: Boolean(productData.isNewArrival ?? true),
    isBestSeller: Boolean(productData.isBestSeller ?? false),
    isTrending: Boolean(productData.isTrending ?? true),
    isFeatured: Boolean(productData.isFeatured ?? true),
    isRakhiGiftEligible: Boolean(productData.isRakhiGiftEligible ?? true),
    status: isPublished ? 'published' : 'draft',
    visibility: isPublished ? 'online' : 'hidden',
    published: isPublished,
    displayOrder: typeof productData.displayOrder === 'number' ? productData.displayOrder : undefined,
    sku: productData.sku || `LUX-MPK-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: productData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Write product to Firebase
  await setDoc(prodDocRef, fullProduct, { merge: true });

  // 2. Read the same product back from Firebase to verify
  const verifySnap = await getDoc(prodDocRef);
  if (!verifySnap.exists()) {
    throw new Error(`Firebase verification failed: Document ${docId} was not created.`);
  }

  const savedData = verifySnap.data();
  if (!savedData.name || !Array.isArray(savedData.images || savedData.gallery)) {
    throw new Error(`Firebase verification failed: Incomplete product data saved for ${docId}.`);
  }

  console.log(`[FIRESTORE VERIFIED] Successfully wrote & verified product doc ID: ${docId}`);
  return fullProduct;
}

/**
 * Update partial fields on a product document in Firebase with read-back verification.
 */
export async function updateProductInFirebase(productId: string, updates: Partial<Product>): Promise<void> {
  const prodDocRef = doc(db, PRODUCTS_COLLECTION, productId);
  
  const payload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.published !== undefined) {
    payload.published = updates.published;
    payload.status = updates.published ? 'published' : 'draft';
    payload.visibility = updates.published ? 'online' : 'hidden';
  } else if (updates.status !== undefined || updates.visibility !== undefined) {
    const isPub = updates.status === 'published' && updates.visibility !== 'hidden';
    payload.published = isPub;
  }

  if (updates.gallery && !updates.images) {
    payload.images = updates.gallery;
  } else if (updates.images && !updates.gallery) {
    payload.gallery = updates.images;
  }

  if (updates.originalPrice && !updates.mrp) {
    payload.mrp = updates.originalPrice;
  }
  if (updates.discountPercent && !updates.discount) {
    payload.discount = updates.discountPercent;
  }

  await updateDoc(prodDocRef, payload);

  // Verification read-back
  const verifySnap = await getDoc(prodDocRef);
  if (!verifySnap.exists()) {
    throw new Error(`Firebase verification failed: Product ${productId} not found after update.`);
  }

  console.log(`[FIRESTORE VERIFIED] Updated and verified product doc ID: ${productId}`);
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
