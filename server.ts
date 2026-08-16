import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_RAKHI_OFFER,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_SAMPLE_ORDERS,
  INITIAL_SETTINGS,
} from './src/data/initialData.js';
import {
  Product,
  Category,
  RakhiOfferConfig,
  BannerConfig,
  Coupon,
  Order,
  OrderStatus,
  PaymentStatus,
  CartItem,
  StoreSettings,
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File path for persistence & image uploads
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Memory DB Interface
interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  rakhiOffer: RakhiOfferConfig;
  banners: BannerConfig[];
  coupons: Coupon[];
  orders: Order[];
  settings: StoreSettings;
}

// Initial DB state
let db: DatabaseSchema = {
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  rakhiOffer: INITIAL_RAKHI_OFFER,
  banners: INITIAL_BANNERS,
  coupons: INITIAL_COUPONS,
  orders: INITIAL_SAMPLE_ORDERS,
  settings: INITIAL_SETTINGS,
};

// Helper: Ensure Data Dir & Load/Save JSON DB
function initDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      db = { ...db, ...loaded };
      db.settings = { ...INITIAL_SETTINGS, ...(loaded.settings || {}) };
      console.log('Database loaded successfully from disk.');
    } else {
      saveDatabase();
      console.log('Database initialized with seed data.');
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Initialize database
initDatabase();

// ==========================================
// API ROUTES
// ==========================================

// 1. PRODUCTS
app.get('/api/products', (req: Request, res: Response) => {
  let list = [...db.products];
  const { category, search, flag, sort, giftEligible } = req.query;

  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q)
    );
  }

  if (flag && typeof flag === 'string') {
    if (flag === 'isNewArrival') list = list.filter(p => p.isNewArrival);
    else if (flag === 'isBestSeller') list = list.filter(p => p.isBestSeller);
    else if (flag === 'isTrending') list = list.filter(p => p.isTrending);
    else if (flag === 'isFeatured') list = list.filter(p => p.isFeatured);
    else if (flag === 'isRakhiGiftEligible') list = list.filter(p => p.isRakhiGiftEligible);
  }

  if (giftEligible === 'true') {
    list = list.filter(p => p.isRakhiGiftEligible && p.price <= db.rakhiOffer.maxGiftValue);
  }

  if (sort && typeof sort === 'string') {
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'discount') list.sort((a, b) => b.discountPercent - a.discountPercent);
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(list);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Image upload handler (accepts base64 data URL or external URL)
app.post('/api/upload', (req: Request, res: Response) => {
  console.log('[SERVER LOG] [POST /api/upload] Received upload request');
  try {
    const { image, fileName } = req.body;
    if (!image) {
      console.warn('[SERVER LOG] [POST /api/upload] Validation failed: No image data provided');
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/'))) {
      console.log('[SERVER LOG] [POST /api/upload] Received direct image URL:', image);
      return res.json({ url: image });
    }

    let matches = typeof image === 'string' ? image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/) : null;
    let ext = 'jpg';
    let base64Data = image;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    console.log(`[SERVER LOG] [POST /api/upload] Processing image file "${fileName || 'unnamed'}" with format .${ext}`);
    const buffer = Buffer.from(base64Data, 'base64');
    const safeName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    console.log(`[SERVER LOG] [POST /api/upload] Image successfully saved to disk: ${filePath} -> Public URL: ${publicUrl}`);
    return res.json({ url: publicUrl, fileName: safeName });
  } catch (err: any) {
    console.error('[SERVER ERROR] [POST /api/upload] Failed to save uploaded image:', err);
    return res.status(500).json({ error: 'Failed to save uploaded image: ' + (err.message || 'Unknown error') });
  }
});

app.post('/api/products', (req: Request, res: Response) => {
  console.log('[SERVER LOG] [POST /api/products] Creating new product record in database');
  try {
    const b = req.body;
    console.log('[SERVER LOG] [POST /api/products] Incoming body:', JSON.stringify(b, null, 2));

    const name = b.name || 'Untitled Kurti';
    const originalPrice = Number(b.originalPrice || b.mrp || b.price || 0);
    const price = Number(b.price || b.sellingPrice || 0);
    const discountPercent = originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : Number(b.discountPercent || b.discount || 0);

    const gallery = Array.isArray(b.gallery) && b.gallery.length > 0
      ? b.gallery
      : Array.isArray(b.images) && b.images.length > 0
      ? b.images
      : [b.image].filter(Boolean);

    const mainImage = gallery[0] || b.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000';

    const newProduct: Product = {
      id: b.id || `lux-${Date.now().toString().slice(-6)}`,
      name,
      shortDescription: b.shortDescription || b.description?.slice(0, 150) || '',
      description: b.description || b.shortDescription || '',
      category: b.category || 'Kurtis',
      subcategory: b.subcategory || 'Printed Kurtis',
      price,
      originalPrice,
      discountPercent,
      bestPrice: b.bestPrice || Math.round(price * 0.85),
      image: mainImage,
      gallery: gallery.length > 0 ? gallery : [mainImage],
      sizes: Array.isArray(b.sizes) && b.sizes.length > 0 ? b.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      colors: Array.isArray(b.colors) && b.colors.length > 0 ? b.colors : ['Maroon / Wine'],
      fabric: b.fabric || 'Premium Fabric',
      stock: Number(b.stock ?? 25),
      rating: Number(b.rating || 4.8),
      reviewsCount: Number(b.reviewsCount || 1),
      isNewArrival: Boolean(b.isNewArrival ?? b.newArrival ?? true),
      isBestSeller: Boolean(b.isBestSeller ?? false),
      isTrending: Boolean(b.isTrending ?? true),
      isFeatured: Boolean(b.isFeatured ?? b.featured ?? true),
      isRakhiGiftEligible: Boolean(b.isRakhiGiftEligible ?? b.rakhiEligible ?? true),
      status: b.status || 'published',
      visibility: b.visibility || 'online',
      sku: b.sku || `LUX-MPK-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };

    console.log(`[SERVER LOG] [POST /api/products] Normalized product object ID="${newProduct.id}", Name="${newProduct.name}"`);

    db.products.unshift(newProduct);
    saveDatabase();

    console.log(`[SERVER LOG] [POST /api/products] Database update successful. Total products in DB: ${db.products.length}`);
    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('[SERVER ERROR] [POST /api/products] Database write operation failed:', err);
    res.status(500).json({ error: 'Failed to create product in database: ' + (err.message || 'Unknown error') });
  }
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const productId = req.params.id;
  console.log(`[SERVER LOG] [PUT /api/products/${productId}] Updating product record in database`);
  try {
    const idx = db.products.findIndex(p => p.id === productId);
    if (idx === -1) {
      console.warn(`[SERVER LOG] [PUT /api/products/${productId}] Product not found in database`);
      return res.status(404).json({ error: 'Product not found' });
    }

    const b = req.body;
    const existing = db.products[idx];

    const originalPrice = b.originalPrice !== undefined ? Number(b.originalPrice) : existing.originalPrice;
    const price = b.price !== undefined ? Number(b.price) : existing.price;
    const discountPercent = originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : existing.discountPercent;

    const gallery = Array.isArray(b.gallery) && b.gallery.length > 0
      ? b.gallery
      : Array.isArray(b.images) && b.images.length > 0
      ? b.images
      : existing.gallery;

    const mainImage = gallery[0] || b.image || existing.image;

    const updatedProduct: Product = {
      ...existing,
      ...b,
      price,
      originalPrice,
      discountPercent,
      image: mainImage,
      gallery,
      sizes: Array.isArray(b.sizes) && b.sizes.length > 0 ? b.sizes : existing.sizes,
      status: b.status || existing.status || 'published',
      visibility: b.visibility || existing.visibility || 'online',
      isNewArrival: b.isNewArrival !== undefined ? Boolean(b.isNewArrival) : existing.isNewArrival,
      isFeatured: b.isFeatured !== undefined ? Boolean(b.isFeatured) : existing.isFeatured,
      isRakhiGiftEligible: b.isRakhiGiftEligible !== undefined ? Boolean(b.isRakhiGiftEligible) : existing.isRakhiGiftEligible,
    };

    db.products[idx] = updatedProduct;
    saveDatabase();

    console.log(`[SERVER LOG] [PUT /api/products/${productId}] Database record updated successfully for "${updatedProduct.name}"`);
    res.json(updatedProduct);
  } catch (err: any) {
    console.error(`[SERVER ERROR] [PUT /api/products/${productId}] Database write operation failed:`, err);
    res.status(500).json({ error: 'Failed to update product in database: ' + (err.message || 'Unknown error') });
  }
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.products.splice(idx, 1);
  saveDatabase();
  res.json({ message: 'Product deleted successfully' });
});

// 2. CATEGORIES
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(db.categories);
});

// 3. RAKHI OFFER CONFIG
app.get('/api/rakhi-offer', (req: Request, res: Response) => {
  res.json(db.rakhiOffer);
});

app.post('/api/rakhi-offer', (req: Request, res: Response) => {
  db.rakhiOffer = { ...db.rakhiOffer, ...req.body };
  saveDatabase();
  res.json(db.rakhiOffer);
});

// 4. BANNERS
app.get('/api/banners', (req: Request, res: Response) => {
  res.json(db.banners);
});

app.post('/api/banners', (req: Request, res: Response) => {
  db.banners = req.body;
  saveDatabase();
  res.json(db.banners);
});

// 5. CART & RAKHI OFFER VALIDATION (SERVER-SIDE MANDATORY SECURITY)
app.post('/api/validate-cart', (req: Request, res: Response) => {
  const { items, selectedGiftProductId } = req.body as {
    items: CartItem[];
    selectedGiftProductId?: string;
  };

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }

  // Recalculate true prices from server DB
  let subtotal = 0;
  const validatedItems: CartItem[] = [];

  for (const item of items) {
    const p = db.products.find(prod => prod.id === item.productId);
    if (p && p.stock > 0) {
      const realItem: CartItem = {
        productId: p.id,
        product: p,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: Math.min(item.quantity, p.stock),
      };
      subtotal += p.price * realItem.quantity;
      validatedItems.push(realItem);
    }
  }

  // Verify Rakhi Offer Rules
  const offer = db.rakhiOffer;
  const isOfferUnlocked = offer.isActive && subtotal >= offer.minCartValue;
  const amountNeededForOffer = isOfferUnlocked ? 0 : Math.max(0, offer.minCartValue - subtotal);

  let validatedFreeGift: CartItem | null = null;

  if (isOfferUnlocked && selectedGiftProductId) {
    const giftProduct = db.products.find(p => p.id === selectedGiftProductId);
    if (
      giftProduct &&
      giftProduct.isRakhiGiftEligible &&
      giftProduct.price <= offer.maxGiftValue &&
      giftProduct.stock > 0
    ) {
      validatedFreeGift = {
        productId: giftProduct.id,
        product: giftProduct,
        selectedSize: 'M',
        selectedColor: giftProduct.colors[0] || 'Default',
        quantity: 1,
        isGiftItem: true,
      };
    }
  }

  res.json({
    subtotal,
    isOfferUnlocked,
    amountNeededForOffer,
    rakhiOfferConfig: offer,
    validatedItems,
    validatedFreeGift,
  });
});

// 6. COUPON VALIDATION
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  if (cartSubtotal < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Minimum order value for coupon ${coupon.code} is ₹${coupon.minOrderValue}`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discountAmount = (cartSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  res.json({
    code: coupon.code,
    discountAmount: Math.round(discountAmount),
    coupon,
  });
});

app.get('/api/coupons', (req: Request, res: Response) => {
  res.json(db.coupons);
});

app.post('/api/coupons', (req: Request, res: Response) => {
  const newCoupon: Coupon = {
    ...req.body,
    code: req.body.code.toUpperCase(),
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
  };
  const existingIdx = db.coupons.findIndex(c => c.code === newCoupon.code);
  if (existingIdx !== -1) {
    db.coupons[existingIdx] = newCoupon;
  } else {
    db.coupons.push(newCoupon);
  }
  saveDatabase();
  res.json(newCoupon);
});

// 7. ORDERS
app.post('/api/orders', (req: Request, res: Response) => {
  const { customerDetails, items, selectedGiftProductId, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Re-verify subtotal and products from server DB
  let subtotal = 0;
  const verifiedItems: CartItem[] = [];

  for (const item of items) {
    const prod = db.products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });
    }
    subtotal += prod.price * item.quantity;
    verifiedItems.push({
      productId: prod.id,
      product: prod,
      selectedSize: item.selectedSize || 'M',
      selectedColor: item.selectedColor || prod.colors[0],
      quantity: item.quantity,
    });
  }

  // Verify Rakhi Free Gift eligibility
  let verifiedGift: CartItem | null = null;
  const offer = db.rakhiOffer;
  if (offer.isActive && subtotal >= offer.minCartValue && selectedGiftProductId) {
    const giftProd = db.products.find(p => p.id === selectedGiftProductId);
    if (giftProd && giftProd.isRakhiGiftEligible && giftProd.price <= offer.maxGiftValue) {
      verifiedGift = {
        productId: giftProd.id,
        product: giftProd,
        selectedSize: 'M',
        selectedColor: giftProd.colors[0] || 'Default',
        quantity: 1,
        isGiftItem: true,
      };
    }
  }

  // Calculate Coupon Discount
  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
      } else {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
    }
  }

  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  // Decrement Stock
  for (const item of verifiedItems) {
    const p = db.products.find(prod => prod.id === item.productId);
    if (p) {
      p.stock -= item.quantity;
    }
  }

  // Helper for Order ID generation: LUX-YYYYMMDD-XXXXXX
  const today = new Date();
  const dateSegment = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const randomSegment = Math.floor(100000 + Math.random() * 900000);
  const orderId = `LUX-${dateSegment}-${randomSegment}`;

  const nowStr = new Date().toISOString();
  const expiresAtStr = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cardInfo = paymentMethod === 'Card' && req.body.cardInfo ? req.body.cardInfo : undefined;
  const initialPaymentStatus: PaymentStatus = paymentMethod === 'Card' ? 'Paid' : 'Pending';
  const initialOrderStatus: OrderStatus = paymentMethod === 'Card' ? 'Confirmed' : 'Pending';

  const newOrder: Order = {
    id: orderId,
    customerName: customerDetails.fullName,
    email: customerDetails.email || 'customer@luxue.com',
    phone: customerDetails.mobile,
    shippingAddress: customerDetails,
    items: verifiedItems,
    freeGiftItem: verifiedGift,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    paymentMethod: paymentMethod || 'UPI',
    paymentStatus: initialPaymentStatus,
    orderStatus: initialOrderStatus,
    createdAt: nowStr,
    paymentSessionExpiresAt: expiresAtStr,
    cardInfo,
    trackingHistory: [
      { status: 'Pending', date: formattedDate, completed: true },
      { status: 'Confirmed', date: formattedDate, completed: paymentMethod === 'Card' },
      { status: 'Packed', date: 'Estimated Tomorrow', completed: false },
      { status: 'Shipped', date: 'In 2 Days', completed: false },
      { status: 'Out for Delivery', date: 'In 3 Days', completed: false },
      { status: 'Delivered', date: 'In 4 Days', completed: false },
    ],
  };

  db.orders.unshift(newOrder);
  saveDatabase();

  res.status(201).json(newOrder);
});

// Process Card Payment (PCI-DSS compliant tokenization simulation)
app.post('/api/payments/process-card', (req: Request, res: Response) => {
  try {
    const { orderId, cardInfo } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!cardInfo || !cardInfo.cardNumber || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.cardholderName) {
      return res.status(400).json({ error: 'All card payment fields (Name, Number, Expiry, CVV) are required' });
    }

    const cleanNumber = String(cardInfo.cardNumber).replace(/\s+/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19 || !/^\d+$/.test(cleanNumber)) {
      return res.status(400).json({ error: 'Invalid card number format' });
    }

    // Determine Card Brand
    let brand = 'RuPay';
    if (/^4/.test(cleanNumber)) brand = 'Visa';
    else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) brand = 'Mastercard';
    else if (/^3[47]/.test(cleanNumber)) brand = 'American Express';
    else if (/^(60|65|81|82|508)/.test(cleanNumber)) brand = 'RuPay';

    const last4 = cleanNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4}`;
    const authCode = `AUTH_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now().toString().slice(-4)}`;

    // Store strictly non-sensitive masked info
    order.cardInfo = {
      cardholderName: cardInfo.cardholderName.trim().toUpperCase(),
      maskedNumber,
      brand,
      authCode,
    };
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    
    // Update tracking step
    order.trackingHistory = order.trackingHistory.map(step => {
      if (step.status === 'Confirmed') return { ...step, completed: true, date: 'Just now' };
      return step;
    });

    saveDatabase();

    console.log(`[CARD PAYMENT SUCCESS] Order #${order.id} paid via ${brand} ending in ${last4}. Auth: ${authCode}`);

    return res.json({
      success: true,
      message: 'Card payment processed and verified successfully.',
      order,
      transaction: {
        authCode,
        maskedNumber,
        brand,
        amount: order.totalAmount,
      },
    });
  } catch (err: any) {
    console.error('[CARD PAYMENT ERROR]', err);
    return res.status(500).json({ error: 'Failed to process card payment: ' + (err.message || 'Unknown error') });
  }
});

// Submit Payment Proof (UTR & Screenshot) for UPI
app.post('/api/orders/:id/submit-payment-proof', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { utrNumber, screenshotUrl } = req.body;
  if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim().length < 6) {
    return res.status(400).json({ error: 'Please enter a valid 12-digit UPI UTR or Transaction Reference ID' });
  }

  const cleanUtr = utrNumber.trim().toUpperCase();

  // Prevent duplicate UTR submission across different orders
  const duplicate = db.orders.find(
    o => o.id !== order.id && o.paymentVerification?.utrNumber?.toUpperCase() === cleanUtr
  );
  if (duplicate) {
    return res.status(400).json({
      error: `This UTR / Transaction ID has already been recorded for Order #${duplicate.id}. Duplicate submissions are not permitted.`,
    });
  }

  order.paymentVerification = {
    utrNumber: cleanUtr,
    screenshotUrl: screenshotUrl || '',
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  order.paymentStatus = 'Payment Processing';

  saveDatabase();
  console.log(`[PAYMENT PROOF SUBMITTED] Order #${order.id} | UTR: ${cleanUtr}`);
  res.json({ success: true, message: 'Payment verification submitted to admin review', order });
});

// Admin Approve / Reject Payment
app.post('/api/orders/:id/verify-payment', requireAdminAuth, (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { action, rejectionReason, adminName } = req.body;
  const now = new Date().toISOString();

  if (action === 'approve') {
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    if (order.paymentVerification) {
      order.paymentVerification.status = 'approved';
      order.paymentVerification.reviewedAt = now;
      order.paymentVerification.reviewedBy = adminName || 'LUXUE Admin';
    } else {
      order.paymentVerification = {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: adminName || 'LUXUE Admin',
      };
    }

    // Mark Confirmed tracking step
    order.trackingHistory = order.trackingHistory.map(step => {
      if (step.status === 'Confirmed') return { ...step, completed: true };
      return step;
    });

    saveDatabase();
    console.log(`[PAYMENT APPROVED] Order #${order.id} approved by admin.`);
    return res.json({ success: true, message: 'Payment approved. Order is now Confirmed.', order });
  } else if (action === 'reject') {
    order.paymentStatus = 'Payment Failed';
    order.orderStatus = 'Cancelled';
    if (order.paymentVerification) {
      order.paymentVerification.status = 'rejected';
      order.paymentVerification.rejectionReason = rejectionReason || 'Payment could not be verified with bank.';
      order.paymentVerification.reviewedAt = now;
      order.paymentVerification.reviewedBy = adminName || 'LUXUE Admin';
    }

    saveDatabase();
    console.log(`[PAYMENT REJECTED] Order #${order.id} rejected by admin.`);
    return res.json({ success: true, message: 'Payment rejected. Order marked as Payment Failed.', order });
  }

  return res.status(400).json({ error: 'Invalid verification action. Must be "approve" or "reject".' });
});

// Check Payment Status directly
app.get('/api/orders/:id/payment-status', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    paymentVerification: order.paymentVerification,
    totalAmount: order.totalAmount,
    updatedAt: new Date().toISOString(),
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const { email, phone } = req.query;
  let list = [...db.orders];

  if (email && typeof email === 'string') {
    list = list.filter(o => o.email.toLowerCase() === email.toLowerCase());
  } else if (phone && typeof phone === 'string') {
    list = list.filter(o => o.phone.includes(phone));
  }

  res.json(list);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = status;

  // Update tracking steps completion
  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];
  const targetIdx = statuses.indexOf(status);

  order.trackingHistory = order.trackingHistory.map(step => {
    const idx = statuses.indexOf(step.status);
    return {
      ...step,
      completed: idx <= targetIdx,
    };
  });

  saveDatabase();
  res.json(order);
});

// Admin Authentication Middleware
function requireAdminAuth(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (token === 'luxue-admin-jwt-token-2026') {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin privileges required', authenticated: false });
}

// 8. ADMIN AUTHENTICATION
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if ((email === 'admin@luxue.com' || email === 'admin') && password === 'admin123') {
    return res.json({
      success: true,
      token: 'luxue-admin-jwt-token-2026',
      user: {
        email: 'admin@luxue.com',
        name: 'LUXUE Admin Manager',
        role: 'admin',
      },
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (token === 'luxue-admin-jwt-token-2026') {
    return res.json({
      authenticated: true,
      role: 'admin',
      user: {
        email: 'admin@luxue.com',
        name: 'LUXUE Admin Manager',
        role: 'admin',
      },
    });
  }
  return res.status(401).json({ authenticated: false, error: 'Unauthorized admin session' });
});

// 9. ADMIN ANALYTICS METRICS
app.get('/api/admin/analytics', requireAdminAuth, (req: Request, res: Response) => {
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = db.orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const completedOrders = db.orders.filter(o => o.orderStatus === 'Delivered').length;
  const lowStockCount = db.products.filter(p => p.stock < 10).length;
  const totalProducts = db.products.length;

  res.json({
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
    lowStockCount,
    totalProducts,
  });
});

// 10. STORE SETTINGS
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings || INITIAL_SETTINGS);
});

app.post('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase();
  res.json(db.settings);
});

// 11. SEO & ROBOTS & SITEMAP
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const staticUrls = [
    '',
    '/shop',
    '/categories',
    '/about',
    '/contact',
  ];

  const productUrls = db.products.map(p => `/product/${p.id}`);
  const allUrls = [...staticUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    url => `  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// ==========================================
// VITE MIDDLEWARE & SERVER START
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
