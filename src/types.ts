export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';

export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  bestPrice: number;
  offerBadge?: string;
  image: string;
  gallery: string[];
  sizes: Size[];
  colors: string[];
  fabric: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isRakhiGiftEligible: boolean;
  highlights?: string[];
  color?: string;
  pattern?: string;
  style?: string;
  neck?: string;
  sleeves?: string;
  setIncludes?: string;
  occasion?: string;
  fit?: string;
  status?: 'published' | 'draft' | 'archived';
  visibility?: 'online' | 'hidden';
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  sku: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedSize: Size;
  selectedColor: string;
  quantity: number;
  isGiftItem?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email?: string;
  house: string;
  street: string;
  area?: string;
  landmark?: string;
  city: string;
  state: string;
  pin: string;
  country: string;
  saveForFuture?: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Pending' | 'Payment Processing' | 'Paid' | 'Payment Failed' | 'Payment Expired' | 'Cancelled' | 'Refunded';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'COD';

export interface PaymentVerification {
  utrNumber?: string;
  screenshotUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CardPaymentInfo {
  cardholderName: string;
  maskedNumber: string;
  brand: string;
  authCode?: string;
}

export interface TrackingStep {
  status: OrderStatus;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  freeGiftItem?: CartItem | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  trackingHistory: TrackingStep[];
  paymentVerification?: PaymentVerification;
  cardInfo?: CardPaymentInfo;
  paymentSessionExpiresAt?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface RakhiOfferConfig {
  isActive: boolean;
  minCartValue: number;
  maxGiftValue: number;
  title: string;
  subtitle: string;
  headline: string;
  termsText: string;
  startDate: string;
  endDate: string;
}

export interface BannerConfig {
  id: string;
  title: string;
  subtitle: string;
  headline: string;
  offerText: string;
  termsText: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  imageUrl: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export interface PaymentSettingsRecord {
  upiId: string;
  businessName: string;
  upiEnabled: boolean;
  cardEnabled?: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface PaymentGatewaySettings {
  upiEnabled: boolean; // Payment Status: ON/OFF
  merchantUpiId: string; // Dynamic UPI ID
  merchantName: string; // Business/Merchant Name
  upiId?: string;
  businessName?: string;
  cardEnabled: boolean;
  codEnabled: boolean; // permanently false
  lastUpdated?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  testModeEnabled?: boolean;
}

export interface UserProfile {
  name: string;
  mobile: string;
  email: string;
  isVip?: boolean;
  createdAt?: string;
  shippingAddress?: string;
  addressDetails?: ShippingAddress;
}

export interface StoreSettings {
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  storeName: string;
  announcementText: string;
  officeAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  gstin: string;
  merchantUpiId?: string;
  merchantName?: string;
  paymentSettings?: PaymentGatewaySettings;
}
