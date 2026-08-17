import { Product, Category, Coupon, RakhiOfferConfig, BannerConfig, Order, StoreSettings, PaymentSettingsRecord } from '../types';
import { CATALOG_20_PRODUCTS } from './catalog20Products';

export const INITIAL_PAYMENT_SETTINGS: PaymentSettingsRecord = {
  upiId: 'testone@upi',
  businessName: 'LUXUE FASHION ONLINE',
  upiEnabled: true,
  cardEnabled: true,
  updatedAt: '2026-08-16T07:00:00.000Z',
  updatedBy: 'Admin',
};

export const INITIAL_SETTINGS: StoreSettings = {
  whatsappNumber: '+919876543210',
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@luxue.com',
  storeName: 'LUXUE FASHION ONLINE',
  announcementText: '✨ RAKHI FESTIVE SPECIAL: SHOP FOR ₹2,500 & CHOOSE A ₹1,000 FASHION GIFT FREE! • FREE EXPRESS SHIPPING ACROSS INDIA',
  officeAddress: 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pinCode: '201303',
  country: 'India',
  gstin: '09AAMFE0502D1ZX',
  merchantUpiId: 'testone@upi',
  merchantName: 'LUXUE FASHION ONLINE',
  paymentSettings: {
    upiEnabled: true,
    cardEnabled: true,
    codEnabled: false,
    merchantName: 'LUXUE FASHION ONLINE',
    merchantUpiId: 'testone@upi',
    lastUpdated: '2026-08-16T12:00:00.000Z',
    lastUpdatedBy: 'Admin',
  },
};

export const INITIAL_RAKHI_OFFER: RakhiOfferConfig = {
  isActive: true,
  minCartValue: 2500,
  maxGiftValue: 1000,
  title: 'RAKHI SPECIAL',
  subtitle: 'Celebrate the bond of love with an exclusive LUXUE Rakhi offer.',
  headline: 'SHOP FOR ₹2,500 & GET ₹1,000 WORTH OF FASHION FREE',
  termsText: 'VALID ON ELIGIBLE PRODUCTS • T&C APPLY',
  startDate: '2026-08-01',
  endDate: '2026-08-31',
};

export const INITIAL_BANNERS: BannerConfig[] = [
  {
    id: 'banner-1',
    title: 'RAKHI FESTIVE EDIT',
    subtitle: 'Celebrate Love & Tradition with LUXUE',
    headline: 'RAKHI SPECIAL: SHOP FOR ₹2,500 & GET ₹1,000 WORTH OF FASHION FREE',
    offerText: 'Handcrafted Suits, Anarkalis & Designer Kurtis for the Festive Season',
    termsText: 'VALID ON ELIGIBLE PRODUCTS • T&C APPLY',
    ctaText: 'SHOP NOW →',
    ctaLink: '/shop',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-anarkali-suit',
    name: 'Anarkali Suit',
    slug: 'anarkali-suit',
    image: 'https://i.ibb.co/4RwtQWYD/A-Banaras-beauty-you-ll-cherish-Introducing-a-premium-navy-blue-Banaras-Anarkali-adorned-with-in.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-salwar-suit',
    name: 'Salwar Suit',
    slug: 'salwar-suit',
    image: 'https://i.ibb.co/11fgHRK/A-beautiful-yellow-floral-printed-salwar-suit-designed-for-a-graceful-everyday-look-Code-T148-Siz.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-vichitra-suit',
    name: 'Vichitra Suit',
    slug: 'vichitra-suit',
    image: 'https://i.ibb.co/9H2Zj1gN/A-chic-silhouette-you-ll-adore-Our-premium-Vichitra-collection-in-a-timeless-red-hue-adorned-wi.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-alia-cut-suit',
    name: 'Alia Cut Suit',
    slug: 'alia-cut-suit',
    image: 'https://i.ibb.co/GwYvzHh/A-festive-silhouette-in-the-prettiest-peach-A-graceful-Peach-Alia-cut-suit-set-thoughtfully-cura.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-sharara-set',
    name: 'Sharara Set',
    slug: 'sharara-set',
    image: 'https://i.ibb.co/5ZBy3HP/A-silhouette-you-ll-fall-in-love-with-Beautifully-embroidered-premium-sharara-sets-in-elegant-sh.jpg',
    itemCount: 2,
  },
  {
    id: 'cat-silk-salwar-suit',
    name: 'Silk Salwar Suit',
    slug: 'silk-salwar-suit',
    image: 'https://i.ibb.co/JWCKFbcJ/Comment-for-direct-link-A-pop-of-tradition-in-every-thread-Our-new-Green-Silk-Salwar-Suits-are.jpg',
    itemCount: 2,
  },
  {
    id: 'cat-floral-suit',
    name: 'Floral Suit',
    slug: 'floral-suit',
    image: 'https://i.ibb.co/RkSqhMLW/DM-or-comment-for-the-direct-link-A-timeless-white-floral-beauty-you-ll-keep-reaching-for-Soft-f.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-cotton-kurtis',
    name: 'Cotton Kurtis',
    slug: 'cotton-kurtis',
    image: 'https://i.ibb.co/bMKj72Zx/15-81b53017-1f4a-401e-9ff1-2941cf43de45.jpg',
    itemCount: 3,
  },
  {
    id: 'cat-designer-kurtis',
    name: 'Designer Kurtis',
    slug: 'designer-kurtis',
    image: 'https://i.ibb.co/hFSGY6cM/225-1.jpg',
    itemCount: 2,
  },
  {
    id: 'cat-everyday-kurtis',
    name: 'Everyday Kurtis',
    slug: 'everyday-kurtis',
    image: 'https://i.ibb.co/G3T2SPLM/442.jpg',
    itemCount: 2,
  },
  {
    id: 'cat-printed-kurtis',
    name: 'Printed Kurtis',
    slug: 'printed-kurtis',
    image: 'https://i.ibb.co/GvhV3bnd/463.jpg',
    itemCount: 3,
  },
  {
    id: 'cat-festive-kurtis',
    name: 'Festive Kurtis',
    slug: 'festive-kurtis',
    image: 'https://i.ibb.co/tpkyLZt5/71-0de41d1a-c4e0-470e-9530-d859bfddf30d.jpg',
    itemCount: 1,
  },
  {
    id: 'cat-office-wear',
    name: 'Office Wear',
    slug: 'office-wear',
    image: 'https://i.ibb.co/xKtLj9S0/22-61f43039-5895-436a-86e8-b101adede783.png',
    itemCount: 1,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'RAKHI500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 2000,
    validUntil: '2026-08-31',
    isActive: true,
  },
  {
    code: 'LUXUE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1500,
    maxDiscount: 1000,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    code: 'FESTIVE15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 3000,
    maxDiscount: 1200,
    validUntil: '2026-09-15',
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = CATALOG_20_PRODUCTS;

export const INITIAL_SAMPLE_ORDERS: Order[] = [
  {
    id: 'LX-880291',
    customerName: 'Ananya Sharma',
    email: 'ananya.s@gmail.com',
    phone: '+91 98765 43210',
    shippingAddress: {
      fullName: 'Ananya Sharma',
      mobile: '+91 98765 43210',
      email: 'ananya.s@gmail.com',
      house: 'Flat 402, Royal Palms',
      street: 'MG Road, Indiranagar',
      area: 'Stage 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      pin: '560038',
      country: 'India',
    },
    items: [
      {
        productId: CATALOG_20_PRODUCTS[0].id,
        product: CATALOG_20_PRODUCTS[0],
        selectedSize: 'M',
        selectedColor: 'Royal Navy Blue',
        quantity: 1,
      },
      {
        productId: CATALOG_20_PRODUCTS[1].id,
        product: CATALOG_20_PRODUCTS[1],
        selectedSize: 'L',
        selectedColor: 'Sunshine Yellow',
        quantity: 1,
      }
    ],
    freeGiftItem: {
      productId: CATALOG_20_PRODUCTS[2].id,
      product: CATALOG_20_PRODUCTS[2],
      selectedSize: 'M',
      selectedColor: 'Royal Red',
      quantity: 1,
      isGiftItem: true,
    },
    subtotal: 2998,
    discount: 500,
    shippingFee: 0,
    totalAmount: 2498,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    createdAt: '2026-08-08T14:22:00.000Z',
    trackingHistory: [
      { status: 'Pending', date: '08 Aug 2026, 02:22 PM', completed: true },
      { status: 'Confirmed', date: '08 Aug 2026, 02:25 PM', completed: true },
      { status: 'Packed', date: '08 Aug 2026, 06:10 PM', completed: true },
      { status: 'Shipped', date: '09 Aug 2026, 09:30 AM', completed: true },
      { status: 'Out for Delivery', date: '10 Aug 2026, 08:00 AM', completed: false },
      { status: 'Delivered', date: '10 Aug 2026, 02:00 PM', completed: false }
    ]
  }
];
