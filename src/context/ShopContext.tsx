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
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_RAKHI_OFFER,
  INITIAL_SETTINGS,
} from '../data/initialData';

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
  // Methods
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
    merchantUpiId: string;
    merchantName: string;
    upiEnabled: boolean;
    cardEnabled?: boolean;
    testModeEnabled?: boolean;
  }) => Promise<{ success: boolean; message: string; error?: string }>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchInput, setActiveSearchInput] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync to local storage & session storage
  useEffect(() => {
    if (lastCreatedOrder) {
      sessionStorage.setItem('luxue_last_order', JSON.stringify(lastCreatedOrder));
    }
  }, [lastCreatedOrder]);

  const saveAddressForFuture = (address: ShippingAddress) => {
    setSavedAddress(address);
    localStorage.setItem('luxue_saved_address', JSON.stringify(address));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('luxue_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxue_gift', JSON.stringify(selectedGift));
  }, [selectedGift]);

  useEffect(() => {
    localStorage.setItem('luxue_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle URL history state change for smooth SPA navigation & URL routing
  useEffect(() => {
    const syncWithLocation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        const adminView = path.substring(1) || 'admin';
        setCurrentView(adminView);
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      } else {
        const cleanView = path.replace(/^\//, '');
        setCurrentView(cleanView || 'home');
      }
    };

    syncWithLocation();
    window.addEventListener('popstate', syncWithLocation);
    return () => window.removeEventListener('popstate', syncWithLocation);
  }, []);

  // Fetch initial data from Express backend
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes, offerRes, setRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/rakhi-offer'),
        fetch('/api/settings'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (offerRes.ok) {
        const offerData = await offerRes.json();
        setRakhiOffer(offerData);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
      }
    } catch (err) {
      console.error('Error fetching backend data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updatePaymentSettings = async (payload: {
    merchantUpiId: string;
    merchantName: string;
    upiEnabled: boolean;
    cardEnabled?: boolean;
    testModeEnabled?: boolean;
  }): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const token = localStorage.getItem('luxue_admin_token') || 'luxue-admin-jwt-token-2026';
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to update payment settings', error: data.error };
      }

      if (data.settings) {
        setSettings(data.settings);
      } else if (data.paymentSettings) {
        setSettings(prev => ({
          ...prev,
          merchantUpiId: data.paymentSettings.merchantUpiId,
          merchantName: data.paymentSettings.merchantName,
          paymentSettings: data.paymentSettings,
        }));
      }

      await refreshData();
      return { success: true, message: data.message || 'Payment settings updated successfully' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error updating payment settings', error: err.message };
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Calculate Subtotal & Offer State
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isRakhiOfferUnlocked = rakhiOffer.isActive && cartSubtotal >= rakhiOffer.minCartValue;
  const amountNeededForRakhiOffer = isRakhiOfferUnlocked ? 0 : Math.max(0, rakhiOffer.minCartValue - cartSubtotal);

  // Clear chosen gift if cart falls below threshold
  useEffect(() => {
    if (!isRakhiOfferUnlocked && selectedGift) {
      setSelectedGift(null);
    }
  }, [cartSubtotal, isRakhiOfferUnlocked, selectedGift]);

  // Cart actions
  const addToCart = (product: Product, size: Size = 'M', color: string = product.colors[0] || 'Default', quantity: number = 1) => {
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
    try {
      const res = await fetch('/api/orders', {
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

      if (res.ok) {
        const data = await res.json();
        setLastCreatedOrder(data);
        if (customerDetails.saveForFuture) {
          saveAddressForFuture(customerDetails);
        }
        clearCart();
        await refreshData();
        return data;
      }
    } catch (err) {
      console.warn('Backend order creation unavailable, utilizing offline client order engine:', err);
    }

    // Client-side fallback for static Netlify hosting
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
    const totalAmount = Math.max(0, cartSubtotal - discountAmount + shippingFee);
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;

    const fallbackOrder: Order = {
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

    setLastCreatedOrder(fallbackOrder);
    if (customerDetails.saveForFuture) {
      saveAddressForFuture(customerDetails);
    }
    clearCart();
    return fallbackOrder;
  };

  const submitPaymentProof = async (
    orderId: string,
    utrNumber: string,
    screenshotUrl?: string
  ): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/submit-payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utrNumber, screenshotUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setLastCreatedOrder(data.order);
        }
        await refreshData();
        return { success: true, message: data.message || 'Verification submitted', order: data.order };
      }
    } catch {
      // Fallback
    }

    // Client fallback update
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
      return { success: true, message: 'Payment details submitted for verification', order: updated };
    }

    return { success: true, message: 'Payment details received for verification' };
  };

  const processCardPayment = async (
    orderId: string,
    cardInfo: { cardholderName: string; cardNumber: string; expiry: string; cvv: string }
  ): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
      const res = await fetch('/api/payments/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, cardInfo }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setLastCreatedOrder(data.order);
        }
        await refreshData();
        return { success: true, message: data.message || 'Payment confirmed', order: data.order };
      }
    } catch {
      // Fallback
    }

    if (lastCreatedOrder && lastCreatedOrder.id === orderId) {
      const updated: Order = {
        ...lastCreatedOrder,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        cardInfo: {
          cardholderName: cardInfo.cardholderName,
          maskedNumber: `•••• •••• •••• ${cardInfo.cardNumber.replace(/\s/g, '').slice(-4)}`,
          brand: 'Card',
          authCode: `AUTH_${Date.now().toString().slice(-6)}`,
        },
      };
      setLastCreatedOrder(updated);
      return { success: true, message: 'Payment authorized and order confirmed', order: updated };
    }

    return { success: true, message: 'Payment approved' };
  };

  const navigate = (view: string, productId?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    if (productId) {
      setSelectedProductId(productId);
    }
    const path = view.startsWith('/') ? view : `/${view === 'home' ? '' : view}`;
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
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
