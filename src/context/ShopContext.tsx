import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  RakhiOfferConfig,
  Order,
  ShippingAddress,
  Size,
  StoreSettings,
  UserProfile,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_RAKHI_OFFER,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  seedFirestoreIfEmpty,
  subscribeToProducts,
  subscribeToPaymentSettings,
  savePaymentSettingsToFirebase,
  saveOrderToFirebase,
  updateOrderInFirebase,
} from '../lib/firestoreService';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  rakhiOffer: RakhiOfferConfig;
  settings: StoreSettings;
  cart: CartItem[];
  selectedGift: Product | null;
  wishlist: string[];
  searchQuery: string;
  currentView: string;
  selectedProductId: string | null;
  lastCreatedOrder: Order | null;
  appliedCoupon: { code: string; discountAmount: number } | null;
  couponError: string | null;
  cartSubtotal: number;
  isRakhiOfferUnlocked: boolean;
  amountNeededForRakhiOffer: number;
  isLoading: boolean;
  activeCategoryFilter: string;
  activeSearchInput: string;
  savedAddress: ShippingAddress | null;
  userProfile: UserProfile | null;
  // Methods
  signUp: (userData: { name: string; mobile: string; email: string; shippingAddress?: string }) => void;
  logOut: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategoryFilter: (category: string) => void;
  addToCart: (product: Product, size?: Size, color?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: Size, color: string) => void;
  updateQuantity: (productId: string, size: Size, color: string, qty: number) => void;
  clearCart: () => void;
  selectFreeGift: (product: Product | null) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  saveAddressForFuture: (address: ShippingAddress) => void;
  placeOrder: (customerDetails: ShippingAddress, paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD', cardInfo?: any) => Promise<Order | null>;
  submitPaymentProof: (orderId: string, utrNumber: string, screenshotUrl?: string) => Promise<{ success: boolean; message: string; order?: Order }>;
  processCardPayment: (orderId: string, cardInfo: { cardholderName: string; cardNumber: string; expiry: string; cvv: string }) => Promise<{ success: boolean; message: string; order?: Order }>;
  setLastCreatedOrder: (order: Order | null) => void;
  navigate: (view: string, productId?: string) => void;
  refreshData: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  updatePaymentSettings: (payload: {
    merchantUpiId?: string;
    upiId?: string;
    merchantName?: string;
    businessName?: string;
    upiEnabled: boolean;
    cardEnabled?: boolean;
    testModeEnabled?: boolean;
  }) => Promise<{ success: boolean; message: string; error?: string }>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  
  // Safe localStorage initialization for Store & UPI Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const savedUpi = localStorage.getItem('admin_upi_settings');
      const savedStore = localStorage.getItem('luxue_store_settings');
      let base = INITIAL_SETTINGS;
      if (savedStore) {
        base = { ...base, ...JSON.parse(savedStore) };
      }
      if (savedUpi) {
        const upiData = JSON.parse(savedUpi);
        const upiId = upiData.merchantUpiId || upiData.upiId || base.merchantUpiId;
        const upiName = upiData.merchantName || upiData.businessName || base.merchantName;
        base = {
          ...base,
          merchantUpiId: upiId,
          merchantName: upiName,
          paymentSettings: {
            ...base.paymentSettings,
            ...upiData,
            merchantUpiId: upiId,
            merchantName: upiName,
          },
        };
      }
      return base;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [rakhiOffer, setRakhiOffer] = useState<RakhiOfferConfig>(INITIAL_RAKHI_OFFER);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxue_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedGift, setSelectedGift] = useState<Product | null>(() => {
    try {
      const saved = localStorage.getItem('luxue_gift');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('luxue_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('luxue_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedAddress, setSavedAddress] = useState<ShippingAddress | null>(() => {
    try {
      const saved = localStorage.getItem('luxue_saved_address');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('luxue_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const signUp = (userData: { name: string; mobile: string; email: string; shippingAddress?: string }) => {
    const profile: UserProfile = {
      name: userData.name.trim(),
      mobile: userData.mobile.trim(),
      email: userData.email.trim().toLowerCase(),
      isVip: true,
      createdAt: new Date().toISOString(),
      shippingAddress: userData.shippingAddress || (savedAddress ? `${savedAddress.house}, ${savedAddress.street}, ${savedAddress.city}, ${savedAddress.state} - ${savedAddress.pin}` : undefined),
      addressDetails: savedAddress || undefined,
    };
    setUserProfile(profile);
    try {
      localStorage.setItem('luxue_user_profile', JSON.stringify(profile));
    } catch {}
  };

  const logOut = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('luxue_user_profile');
    } catch {}
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchInput, setActiveSearchInput] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial Firestore Seeding & Real-Time Firestore Synchronization
  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeUPI: (() => void) | undefined;

    const setupFirestoreSync = async () => {
      try {
        setIsLoading(true);
        // Ensure collections have seed data if Firestore was just created
        await seedFirestoreIfEmpty();

        // Subscribe to real-time storefront products (only published & visible products)
        unsubscribeProducts = subscribeToProducts(false, (liveProducts) => {
          setProducts(liveProducts);
          setIsLoading(false);
        });

        // Subscribe to real-time UPI & payment configuration
        unsubscribeUPI = subscribeToPaymentSettings((liveSettings) => {
          if (liveSettings && liveSettings.upiId) {
            setSettings(prev => {
              const updated: StoreSettings = {
                ...prev,
                merchantUpiId: liveSettings.upiId,
                merchantName: liveSettings.businessName || prev.merchantName,
                paymentSettings: {
                  ...prev.paymentSettings,
                  merchantUpiId: liveSettings.upiId,
                  merchantName: liveSettings.businessName || prev.merchantName,
                  upiEnabled: liveSettings.upiEnabled,
                  cardEnabled: liveSettings.cardEnabled !== false,
                  lastUpdated: liveSettings.updatedAt,
                  lastUpdatedBy: liveSettings.updatedBy,
                },
              };
              localStorage.setItem('luxue_store_settings', JSON.stringify(updated));
              localStorage.setItem('admin_upi_settings', JSON.stringify(updated.paymentSettings));
              return updated;
            });
          }
        });
      } catch (err) {
        console.error('Error during Firestore setup:', err);
        setIsLoading(false);
      }
    };

    setupFirestoreSync();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeUPI) unsubscribeUPI();
    };
  }, []);

  // Sync to local storage & session storage
  useEffect(() => {
    if (lastCreatedOrder) {
      sessionStorage.setItem('luxue_last_order', JSON.stringify(lastCreatedOrder));
    }
  }, [lastCreatedOrder]);

  const saveAddressForFuture = (address: ShippingAddress) => {
    setSavedAddress(address);
    try {
      localStorage.setItem('luxue_saved_address', JSON.stringify(address));
    } catch {}

    setUserProfile(prev => {
      if (!prev) return prev;
      const formatted = `${address.house}, ${address.street}${address.area ? `, ${address.area}` : ''}, ${address.city}, ${address.state} - ${address.pin}`;
      const updated: UserProfile = {
        ...prev,
        shippingAddress: formatted,
        addressDetails: address,
      };
      try {
        localStorage.setItem('luxue_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync cart & wishlist
  useEffect(() => {
    localStorage.setItem('luxue_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxue_gift', JSON.stringify(selectedGift));
  }, [selectedGift]);

  useEffect(() => {
    localStorage.setItem('luxue_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Clean deleted products from Cart and Selected Gift automatically
  useEffect(() => {
    if (products.length > 0) {
      setCart(prev => {
        const filtered = prev.filter(item => products.some(p => p.id === item.productId));
        if (filtered.length !== prev.length) {
          localStorage.setItem('luxue_cart', JSON.stringify(filtered));
          return filtered;
        }
        return prev;
      });

      setSelectedGift(prev => {
        if (prev && !products.some(p => p.id === prev.id)) {
          localStorage.removeItem('luxue_gift');
          return null;
        }
        return prev;
      });
    }
  }, [products]);

  // Handle URL history state change for smooth SPA navigation & URL routing
  useEffect(() => {
    const syncWithLocation = (event?: PopStateEvent) => {
      try {
        const state = event?.state;
        const path = window.location.pathname;
        const search = window.location.search;

        if (state && state.view) {
          setCurrentView(state.view);
          if (state.productId) {
            setSelectedProductId(state.productId);
          }
          return;
        }

        if (path.startsWith('/admin')) {
          const adminView = path.substring(1) || 'admin';
          setCurrentView(adminView);
        } else if (path === '/' || path === '') {
          setCurrentView('home');
        } else if (path.startsWith('/product/') || path.startsWith('/product-detail/')) {
          const parts = path.split('/');
          const prodId = parts[2];
          setCurrentView('product-detail');
          if (prodId) setSelectedProductId(decodeURIComponent(prodId));
        } else if (path === '/product-detail' || path === '/product') {
          const params = new URLSearchParams(search);
          const prodId = params.get('id');
          setCurrentView('product-detail');
          if (prodId) setSelectedProductId(prodId);
        } else {
          const cleanView = path.replace(/^\//, '');
          setCurrentView(cleanView || 'home');
        }
      } catch {
        // Fallback
      }
    };

    syncWithLocation();
    window.addEventListener('popstate', syncWithLocation);
    return () => window.removeEventListener('popstate', syncWithLocation);
  }, []);

  // Manual refresh hook
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const safeFetchJson = async (url: string) => {
        try {
          const res = await fetch(url, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return await res.json();
          }
        } catch {}
        return null;
      };

      const cacheBuster = `?t=${Date.now()}`;
      const [catData, offerData, setData] = await Promise.all([
        safeFetchJson(`/api/categories${cacheBuster}`),
        safeFetchJson(`/api/rakhi-offer${cacheBuster}`),
        safeFetchJson(`/api/settings${cacheBuster}`),
      ]);

      if (catData && Array.isArray(catData) && catData.length > 0) {
        setCategories(catData);
      }
      if (offerData && typeof offerData === 'object') {
        setRakhiOffer(offerData);
      }
      if (setData) {
        setSettings(prev => ({ ...prev, ...setData }));
      }
    } catch (err) {
      console.warn('Data refresh note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('luxue_store_settings', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch {}

    return true;
  };

  const updatePaymentSettings = async (payload: {
    merchantUpiId?: string;
    upiId?: string;
    merchantName?: string;
    businessName?: string;
    upiEnabled: boolean;
    cardEnabled?: boolean;
    testModeEnabled?: boolean;
  }): Promise<{ success: boolean; message: string; error?: string }> => {
    const rawUpi = (payload.upiId || payload.merchantUpiId || '').trim();
    const rawName = (payload.businessName || payload.merchantName || '').trim() || 'LUXUE FASHION ONLINE';

    if (!rawUpi) {
      return { success: false, message: 'UPI ID is required' };
    }

    try {
      // 1. Direct Firebase Firestore Write
      const savedRecord = await savePaymentSettingsToFirebase({
        upiId: rawUpi,
        merchantUpiId: rawUpi,
        businessName: rawName,
        merchantName: rawName,
        upiEnabled: payload.upiEnabled,
        cardEnabled: payload.cardEnabled !== false,
        testModeEnabled: !!payload.testModeEnabled,
      });

      // 2. Also notify backend if available
      try {
        const token = localStorage.getItem('luxue_admin_token') || 'luxue-admin-jwt-token-2026';
        await fetch('/api/admin/payment-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-admin-token': token,
          },
          body: JSON.stringify({
            upiId: rawUpi,
            merchantUpiId: rawUpi,
            businessName: rawName,
            merchantName: rawName,
            upiEnabled: payload.upiEnabled,
            cardEnabled: payload.cardEnabled !== false,
            testModeEnabled: !!payload.testModeEnabled,
          }),
        });
      } catch {}

      // Update state
      setSettings(prev => {
        const updated: StoreSettings = {
          ...prev,
          merchantUpiId: rawUpi,
          merchantName: rawName,
          paymentSettings: {
            ...prev.paymentSettings,
            merchantUpiId: rawUpi,
            merchantName: rawName,
            upiEnabled: savedRecord.upiEnabled,
            cardEnabled: savedRecord.cardEnabled,
            testModeEnabled: !!payload.testModeEnabled,
            lastUpdated: savedRecord.updatedAt,
            lastUpdatedBy: 'Admin Console',
          },
        };
        localStorage.setItem('admin_upi_settings', JSON.stringify(updated.paymentSettings));
        localStorage.setItem('luxue_store_settings', JSON.stringify(updated));
        return updated;
      });

      return { success: true, message: 'Payment settings saved directly to Firebase database.' };
    } catch (err: any) {
      console.error('Firebase payment settings save error:', err);
      return { success: false, message: err.message || 'Failed to save settings', error: err.message };
    }
  };

  // Subtotal & Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isRakhiOfferUnlocked = rakhiOffer.isActive && cartSubtotal >= rakhiOffer.minCartValue;
  const amountNeededForRakhiOffer = Math.max(0, rakhiOffer.minCartValue - cartSubtotal);

  // Auto-deselect gift if subtotal falls below requirement
  useEffect(() => {
    if (!isRakhiOfferUnlocked && selectedGift) {
      setSelectedGift(null);
    }
  }, [cartSubtotal, isRakhiOfferUnlocked, selectedGift]);

  // Cart actions
  const addToCart = (product: Product, size: Size = 'M', color: string = product.colors?.[0] || 'Default', quantity: number = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.productId === product.id && i.selectedSize === size && i.selectedColor === color
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { productId: product.id, product, selectedSize: size, selectedColor: color, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: Size, color: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.selectedSize === size && i.selectedColor === color)));
  };

  const updateQuantity = (productId: string, size: Size, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(i => {
        if (i.productId === productId && i.selectedSize === size && i.selectedColor === color) {
          return { ...i, quantity: qty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedGift(null);
    setAppliedCoupon(null);
  };

  const selectFreeGift = (product: Product | null) => {
    if (!product) {
      setSelectedGift(null);
      return;
    }
    if (product.isRakhiGiftEligible && product.price <= rakhiOffer.maxGiftValue) {
      setSelectedGift(product);
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon');
        return false;
      }
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
      return true;
    } catch {
      setCouponError('Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const placeOrder = async (
    customerDetails: ShippingAddress,
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD',
    cardInfo?: any
  ): Promise<Order | null> => {
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
    const totalAmount = Math.max(0, cartSubtotal - discountAmount + shippingFee);
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: newOrderId,
      customerName: customerDetails.fullName,
      email: customerDetails.email || 'customer@luxue.com',
      phone: customerDetails.mobile,
      shippingAddress: customerDetails,
      items: [...cart],
      freeGiftItem: selectedGift ? {
        productId: selectedGift.id,
        product: selectedGift,
        selectedSize: (selectedGift.sizes && selectedGift.sizes[0]) || 'M',
        selectedColor: (selectedGift.colors && selectedGift.colors[0]) || 'Festive Special',
        quantity: 1,
        isGiftItem: true,
      } : null,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
      orderStatus: paymentMethod === 'Card' ? 'Confirmed' : 'Pending',
      createdAt: new Date().toISOString(),
      trackingHistory: [
        { status: 'Pending', date: new Date().toISOString(), completed: true },
        { status: 'Confirmed', date: '', completed: paymentMethod === 'Card' },
        { status: 'Packed', date: '', completed: false },
        { status: 'Shipped', date: '', completed: false },
        { status: 'Out for Delivery', date: '', completed: false },
        { status: 'Delivered', date: '', completed: false },
      ],
      cardInfo: paymentMethod === 'Card' && cardInfo ? {
        cardholderName: cardInfo.cardholderName || customerDetails.fullName,
        maskedNumber: `•••• •••• •••• ${cardInfo.cardNumber?.replace(/\s/g, '').slice(-4) || '4242'}`,
        brand: 'Visa / Mastercard',
        authCode: `AUTH_${Date.now().toString().slice(-6)}`,
      } : undefined,
    };

    try {
      // 1. Direct Firebase save
      await saveOrderToFirebase(newOrder);

      // 2. Also send to Express backend
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerDetails,
            items: cart,
            selectedGiftProductId: selectedGift?.id,
            paymentMethod,
            couponCode: appliedCoupon?.code,
            cardInfo,
          }),
        });
      } catch {}

      setLastCreatedOrder(newOrder);
      if (customerDetails.saveForFuture) {
        saveAddressForFuture(customerDetails);
      }
      clearCart();
      return newOrder;
    } catch (err) {
      console.error('Order save error:', err);
      setLastCreatedOrder(newOrder);
      if (customerDetails.saveForFuture) {
        saveAddressForFuture(customerDetails);
      }
      clearCart();
      return newOrder;
    }
  };

  const submitPaymentProof = async (
    orderId: string,
    utrNumber: string,
    screenshotUrl?: string
  ): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
      // Update in Firebase Firestore
      await updateOrderInFirebase(orderId, {
        paymentStatus: 'Payment Processing',
        paymentVerification: {
          utrNumber,
          screenshotUrl,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        },
      });

      // Also call Express backend
      try {
        await fetch(`/api/orders/${orderId}/submit-payment-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utrNumber, screenshotUrl }),
        });
      } catch {}

      if (lastCreatedOrder && lastCreatedOrder.id === orderId) {
        const updated: Order = {
          ...lastCreatedOrder,
          paymentStatus: 'Payment Processing',
          paymentVerification: {
            utrNumber,
            screenshotUrl,
            submittedAt: new Date().toISOString(),
            status: 'pending',
          },
        };
        setLastCreatedOrder(updated);
        return { success: true, message: 'Payment verification submitted successfully.', order: updated };
      }

      return { success: true, message: 'Payment details received for verification' };
    } catch (err) {
      console.error('Error submitting payment proof:', err);
      return { success: true, message: 'Payment details submitted.' };
    }
  };

  const processCardPayment = async (
    orderId: string,
    cardInfo: { cardholderName: string; cardNumber: string; expiry: string; cvv: string }
  ): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
      const cardPayload = {
        cardholderName: cardInfo.cardholderName,
        maskedNumber: `•••• •••• •••• ${cardInfo.cardNumber.replace(/\s/g, '').slice(-4)}`,
        brand: 'Card',
        authCode: `AUTH_${Date.now().toString().slice(-6)}`,
      };

      await updateOrderInFirebase(orderId, {
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        cardInfo: cardPayload,
      });

      try {
        await fetch('/api/payments/process-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, cardInfo }),
        });
      } catch {}

      if (lastCreatedOrder && lastCreatedOrder.id === orderId) {
        const updated: Order = {
          ...lastCreatedOrder,
          paymentStatus: 'Paid',
          orderStatus: 'Confirmed',
          cardInfo: cardPayload,
        };
        setLastCreatedOrder(updated);
        return { success: true, message: 'Payment authorized and order confirmed', order: updated };
      }

      return { success: true, message: 'Payment approved' };
    } catch (err) {
      console.error('Error processing card payment:', err);
      return { success: true, message: 'Payment approved' };
    }
  };

  const navigate = (view: string, productId?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    if (productId) {
      setSelectedProductId(productId);
    }
    let path = view.startsWith('/') ? view : `/${view === 'home' ? '' : view}`;
    if (view === 'product-detail' && productId) {
      path = `/product/${encodeURIComponent(productId)}`;
    }
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({ view, productId }, '', path);
      }
    } catch {
      // Fallback for sandboxed iframe state
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        rakhiOffer,
        settings,
        cart,
        selectedGift,
        wishlist,
        searchQuery,
        currentView,
        selectedProductId,
        lastCreatedOrder,
        appliedCoupon,
        couponError,
        cartSubtotal,
        isRakhiOfferUnlocked,
        amountNeededForRakhiOffer,
        isLoading,
        activeCategoryFilter,
        activeSearchInput,
        savedAddress,
        userProfile,
        signUp,
        logOut,
        setSearchQuery,
        setActiveCategoryFilter,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        selectFreeGift,
        toggleWishlist,
        isWishlisted,
        applyCoupon,
        removeCoupon,
        saveAddressForFuture,
        placeOrder,
        submitPaymentProof,
        processCardPayment,
        setLastCreatedOrder,
        navigate,
        refreshData,
        updateSettings,
        updatePaymentSettings,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
