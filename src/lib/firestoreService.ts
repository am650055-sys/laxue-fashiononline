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
import { Product, Category, RakhiOfferConfig, StoreSettings, Order, Coupon, BannerConfig, PaymentSettingsRecord, Highlight, HighlightMediaItem } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_RAKHI_OFFER,
  INITIAL_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
} from '../data/initialData';
import { INITIAL_HIGHLIGHTS } from '../data/initialHighlights';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const COUPONS_COLLECTION = 'coupons';
const BANNERS_COLLECTION = 'banners';
const HIGHLIGHTS_COLLECTION = 'highlights';

/**
 * Seed initial catalog to Firestore if the collection is empty or missing products.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const settingsDoc = doc(db, SETTINGS_COLLECTION, 'store_config');
    const setSnap = await getDoc(settingsDoc);
    const configData = setSnap.exists() ? setSnap.data() : null;

    // Clean up legacy customerReviews collection if present
    try {
      const oldReviewsRef = collection(db, 'customerReviews');
      const oldSnap = await getDocs(oldReviewsRef);
      if (!oldSnap.empty) {
        console.log(`[FIREBASE CLEANUP] Purging ${oldSnap.docs.length} obsolete customerReviews records.`);
        const batch = writeBatch(db);
        oldSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      // Non-blocking cleanup
    }

    // Seed highlights if not yet seeded
    if (!configData?.highlights_seeded) {
      seedHighlightsIfEmpty().catch(err => console.warn('[HIGHLIGHTS SEED ERROR]:', err));
    }

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
    if (!setSnap.exists()) {
      await setDoc(settingsDoc, {
        ...INITIAL_SETTINGS,
        highlights_seeded: true,
        reviews_seeded: true,
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
      // Suppress benign database closing / visibility change transitions
      if (err?.message?.includes('closing') || err?.message?.includes('hidden')) {
        return;
      }
      console.warn('[FIRESTORE PRODUCT LISTENER]:', err);
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
    if (err?.message?.includes('closing') || err?.message?.includes('hidden')) {
      return;
    }
    console.warn('[FIRESTORE UPI LISTENER]:', err);
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
    if (err?.message?.includes('closing') || err?.message?.includes('hidden')) {
      return;
    }
    console.warn('[FIRESTORE ORDERS LISTENER]:', err);
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

// ==========================================
// HIGHLIGHTS & STORIES FIRESTORE API
// ==========================================

/**
 * Seed initial Highlights CMS records if empty.
 */
export async function seedHighlightsIfEmpty(): Promise<void> {
  try {
    const hlRef = collection(db, HIGHLIGHTS_COLLECTION);
    const snap = await getDocs(hlRef);
    if (snap.empty) {
      console.log('[FIREBASE SEED] Seeding initial promotional highlights...');
      const batch = writeBatch(db);
      INITIAL_HIGHLIGHTS.forEach((hl, idx) => {
        const docRef = doc(db, HIGHLIGHTS_COLLECTION, hl.id);
        batch.set(docRef, {
          ...hl,
          displayOrder: idx + 1,
          published: hl.published !== false,
          featured: hl.featured !== false,
          views: hl.views || 0,
          clicks: hl.clicks || 0,
          createdAt: hl.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      console.log('[FIREBASE SEED] Successfully seeded initial highlights.');
    }
  } catch (err) {
    console.error('[FIREBASE SEED HIGHLIGHTS ERROR]:', err);
  }
}

/**
 * Subscribe in real-time to Highlights.
 */
export function subscribeToHighlights(
  callback: (highlights: Highlight[]) => void
): () => void {
  const hlRef = collection(db, HIGHLIGHTS_COLLECTION);
  return onSnapshot(
    hlRef,
    (snap) => {
      const highlights: Highlight[] = [];
      snap.forEach((d) => {
        const data = d.data() as Highlight;
        highlights.push({
          ...data,
          id: d.id,
          media: Array.isArray(data.media) ? data.media : [],
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 999,
          views: typeof data.views === 'number' ? data.views : 0,
          clicks: typeof data.clicks === 'number' ? data.clicks : 0,
          published: data.published !== false,
          featured: data.featured === true,
        });
      });
      highlights.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
      callback(highlights);
    },
    (err) => {
      if (err?.message?.includes('closing') || err?.message?.includes('hidden')) {
        return;
      }
      console.warn('[FIRESTORE HIGHLIGHTS SNAPSHOT WARNING]:', err);
    }
  );
}

/**
 * Fetch all Highlights once from Firestore.
 */
export async function fetchHighlightsFromFirebase(): Promise<Highlight[]> {
  try {
    const hlRef = collection(db, HIGHLIGHTS_COLLECTION);
    const snap = await getDocs(hlRef);
    if (snap.empty) {
      return [];
    }
    const list: Highlight[] = [];
    snap.forEach((d) => {
      const data = d.data() as Highlight;
      list.push({
        ...data,
        id: d.id,
        media: Array.isArray(data.media) ? data.media : [],
        displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 999,
        views: typeof data.views === 'number' ? data.views : 0,
        clicks: typeof data.clicks === 'number' ? data.clicks : 0,
        published: data.published !== false,
        featured: data.featured === true,
      });
    });
    list.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    return list;
  } catch (err) {
    console.error('[FIRESTORE FETCH HIGHLIGHTS ERROR]:', err);
    return [];
  }
}

/**
 * Create or save a Highlight in Firestore.
 */
export async function saveHighlightToFirebase(highlight: Highlight): Promise<Highlight> {
  const highlightId = highlight.id || `hl-${Date.now()}`;
  const hlRef = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
  const dataToSave: Highlight = {
    ...highlight,
    id: highlightId,
    name: highlight.name.trim(),
    title: highlight.title?.trim() || '',
    description: highlight.description?.trim() || '',
    buttonText: highlight.buttonText?.trim() || '',
    buttonLink: highlight.buttonLink?.trim() || '',
    coverImage: highlight.coverImage?.trim() || '',
    displayOrder: Number(highlight.displayOrder) || 1,
    published: highlight.published !== false,
    featured: highlight.featured === true,
    views: typeof highlight.views === 'number' ? highlight.views : 0,
    clicks: typeof highlight.clicks === 'number' ? highlight.clicks : 0,
    media: Array.isArray(highlight.media) ? highlight.media : [],
    createdAt: highlight.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(hlRef, dataToSave, { merge: true });
  console.log(`[FIRESTORE] Successfully saved highlight doc ID: ${highlightId}`);
  return dataToSave;
}

/**
 * Update partial fields of a Highlight in Firestore.
 */
export async function updateHighlightInFirebase(
  highlightId: string,
  updates: Partial<Highlight>
): Promise<void> {
  if (!highlightId) throw new Error('Highlight ID is required');
  const hlRef = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
  await updateDoc(hlRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a Highlight completely from Firestore.
 */
export async function deleteHighlightFromFirebase(highlightId: string): Promise<void> {
  if (!highlightId) {
    throw new Error('Valid Highlight Document ID is required for deletion.');
  }
  const hlRef = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
  await deleteDoc(hlRef);
  console.log(`[FIRESTORE] Deleted highlight doc ID: ${highlightId}`);
}

/**
 * Batch update displayOrder for an entire list of Highlights (e.g. after drag-and-drop).
 */
export async function reorderHighlightsInFirebase(reorderedList: Highlight[]): Promise<void> {
  const batch = writeBatch(db);
  reorderedList.forEach((hl, idx) => {
    const hlRef = doc(db, HIGHLIGHTS_COLLECTION, hl.id);
    batch.update(hlRef, {
      displayOrder: idx + 1,
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}

/**
 * Increment view count for a highlight.
 */
export async function incrementHighlightViews(highlightId: string): Promise<void> {
  try {
    const hlRef = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
    const snap = await getDoc(hlRef);
    if (snap.exists()) {
      const current = snap.data()?.views || 0;
      await updateDoc(hlRef, { views: current + 1 });
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Increment click count for a highlight button or interaction.
 */
export async function incrementHighlightClicks(highlightId: string): Promise<void> {
  try {
    const hlRef = doc(db, HIGHLIGHTS_COLLECTION, highlightId);
    const snap = await getDoc(hlRef);
    if (snap.exists()) {
      const current = snap.data()?.clicks || 0;
      await updateDoc(hlRef, { clicks: current + 1 });
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Sync / restore initial sample Highlights into Firestore.
 */
export async function syncAllInitialHighlights(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_HIGHLIGHTS.forEach((hl, idx) => {
    const hlRef = doc(db, HIGHLIGHTS_COLLECTION, hl.id);
    batch.set(hlRef, {
      ...hl,
      displayOrder: idx + 1,
      published: true,
      featured: hl.featured !== false,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  });
  await batch.commit();
}


