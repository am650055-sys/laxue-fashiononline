import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Gift,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  Settings,
  MessageCircle,
  Users,
  Grid,
  BarChart3,
  Layers,
  MapPin,
  Building,
  CheckCircle2,
  ExternalLink,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Check,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Order, OrderStatus, Coupon, RakhiOfferConfig, StoreSettings, BannerConfig, Size } from '../../types';
import { AdminPaymentSettings } from '../../components/admin/AdminPaymentSettings';
import { AdminCustomerReviews } from '../../components/admin/AdminCustomerReviews';
import { AdminHighlightsManager } from '../../components/Admin/AdminHighlightsManager';
import {
  saveProductToFirebase,
  updateProductInFirebase,
  deleteProductFromFirebase,
  syncCatalog20ToFirebase,
  subscribeToProducts,
  subscribeToOrders,
  updateOrderInFirebase,
} from '../../lib/firestoreService';

export type AdminTab =
  | 'dashboard'
  | 'highlights'
  | 'payment-settings'
  | 'reviews'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'rakhi-offer'
  | 'coupons'
  | 'banners'
  | 'analytics'
  | 'settings';

interface AdminDashboardPageProps {
  activeSubRoute?: string;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ activeSubRoute, onLogout }) => {
  const { products, rakhiOffer, settings, updateSettings, refreshData, navigate, categories } = useShop();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (
      activeSubRoute &&
      [
        'dashboard',
        'highlights',
        'payment-settings',
        'reviews',
        'products',
        'categories',
        'orders',
        'customers',
        'inventory',
        'rakhi-offer',
        'coupons',
        'banners',
        'analytics',
        'settings',
      ].includes(activeSubRoute)
    ) {
      return activeSubRoute as AdminTab;
    }
    return 'dashboard';
  });

  useEffect(() => {
    if (
      activeSubRoute &&
      [
        'dashboard',
        'highlights',
        'payment-settings',
        'reviews',
        'products',
        'categories',
        'orders',
        'customers',
        'inventory',
        'rakhi-offer',
        'coupons',
        'banners',
        'analytics',
        'settings',
      ].includes(activeSubRoute)
    ) {
      setActiveTab(activeSubRoute as AdminTab);
    }
  }, [activeSubRoute]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    navigate(`admin/${tab}`);
  };

  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  useEffect(() => {
    if (settings) setSettingsForm(settings);
  }, [settings]);

  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<BannerConfig[]>([]);
  const [rakhiConfigForm, setRakhiConfigForm] = useState<RakhiOfferConfig>(rakhiOffer);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<'all' | 'pending-review' | 'paid' | 'unpaid'>('all');

  // Product Form State & Handlers
  const DEFAULT_PRODUCT_FORM = {
    name: '',
    shortDescription: '',
    description: '',
    category: 'Kurtis',
    subcategory: 'Printed Kurtis',
    price: 1499,
    originalPrice: 2499,
    stock: 25,
    fabric: 'Premium Printed Fabric',
    image: '',
    gallery: [] as string[],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'] as Size[],
    status: 'published' as 'published' | 'draft' | 'archived',
    visibility: 'online' as 'online' | 'hidden',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    isFeatured: true,
    isRakhiGiftEligible: true,
  };

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishingProduct, setIsPublishingProduct] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [publishErrorMessage, setPublishErrorMessage] = useState<string | null>(null);

  // Firestore Product & Order Real-time Subscriptions
  const [adminProducts, setAdminProducts] = useState<Product[]>(products);
  const [deleteConfirmationProduct, setDeleteConfirmationProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSync20CatalogProducts = async () => {
    setIsSyncingCatalog(true);
    setSyncFeedback(null);
    try {
      const res = await syncCatalog20ToFirebase();
      setSyncFeedback(`Successfully published ${res.count} curated products to Firebase!`);
      await refreshData();
      await loadAdminData();
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error syncing catalog:', err);
      setSyncFeedback(err.message || 'Error syncing catalog to Firebase.');
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  useEffect(() => {
    // Subscribe to all products (including drafts and hidden) in Admin View
    const unsubscribe = subscribeToProducts(true, (liveProducts) => {
      if (liveProducts) {
        setAdminProducts(liveProducts);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Subscribe to all orders in Admin View
    const unsubscribe = subscribeToOrders((liveOrders) => {
      if (liveOrders) {
        setOrders(liveOrders);
      }
    });
    return () => unsubscribe();
  }, []);

  // Get Admin Auth Header
  const getAuthHeader = () => {
    const token = localStorage.getItem('luxue_admin_token') || 'luxue-admin-jwt-token-2026';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    };
  };

  // Fetch Admin Data safely without throwing on static hosts
  const loadAdminData = async () => {
    try {
      const headers = getAuthHeader();
      const safeFetchJson = async (url: string) => {
        try {
          const res = await fetch(url, { headers });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return await res.json();
          }
        } catch {}
        return null;
      };

      const [analyticsData, ordersData, couponsData, bannersData] = await Promise.all([
        safeFetchJson('/api/admin/analytics'),
        safeFetchJson('/api/orders'),
        safeFetchJson('/api/coupons'),
        safeFetchJson('/api/banners'),
      ]);

      if (analyticsData && typeof analyticsData === 'object') setAnalyticsMetrics(analyticsData);
      if (ordersData && Array.isArray(ordersData)) setOrders(ordersData);
      if (couponsData && Array.isArray(couponsData)) setCoupons(couponsData);
      if (bannersData && Array.isArray(bannersData)) setBanners(bannersData);
    } catch (err) {
      console.warn('Admin data load skipped on static host:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
    setRakhiConfigForm(rakhiOffer);
  }, [rakhiOffer]);

  // Open Modal for New Product
  const openNewProductModal = () => {
    setEditingProductId(null);
    const initialCategory = categories.length > 0 ? categories[0].name : 'Kurtis';
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
      category: initialCategory,
      gallery: [],
      image: '',
    });
    setImageUrlInput('');
    setFormErrors({});
    setPublishSuccessMessage(null);
    setPublishErrorMessage(null);
    setIsProductModalOpen(true);
  };

  // Open Modal to Edit Existing Product
  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    const galleryList = Array.isArray(p.gallery) && p.gallery.length > 0
      ? p.gallery
      : p.image
      ? [p.image]
      : [];

    setProductForm({
      name: p.name || '',
      shortDescription: p.shortDescription || p.description?.slice(0, 150) || '',
      description: p.description || '',
      category: p.category || 'Kurtis',
      subcategory: p.subcategory || 'Printed Kurtis',
      price: p.price || 0,
      originalPrice: p.originalPrice || p.price || 0,
      stock: p.stock ?? 25,
      fabric: p.fabric || 'Premium Printed Fabric',
      image: p.image || galleryList[0] || '',
      gallery: galleryList,
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      status: p.status || 'published',
      visibility: p.visibility || 'online',
      isNewArrival: p.isNewArrival ?? true,
      isBestSeller: p.isBestSeller ?? false,
      isTrending: p.isTrending ?? true,
      isFeatured: p.isFeatured ?? true,
      isRakhiGiftEligible: p.isRakhiGiftEligible ?? true,
    });
    setImageUrlInput('');
    setFormErrors({});
    setPublishSuccessMessage(null);
    setPublishErrorMessage(null);
    setIsProductModalOpen(true);
  };

  // File Upload Handler (JPG, JPEG, PNG, WEBP)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('[ADMIN WORKFLOW LOG] File input triggered but no files selected');
      return;
    }

    console.log(`[ADMIN WORKFLOW LOG] File upload started. Selected count: ${files.length}`);
    setIsUploadingImage(true);
    setPublishErrorMessage(null);

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[ADMIN WORKFLOW LOG] Processing file ${i + 1}/${files.length}: "${file.name}" (Type: ${file.type}, Size: ${Math.round(file.size / 1024)} KB)`);

      try {
        const base64Str = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => {
            console.error('[ADMIN WORKFLOW LOG] FileReader failed to convert file to base64:', err);
            reject(err);
          };
          reader.readAsDataURL(file);
        });

        console.log(`[ADMIN WORKFLOW LOG] Sending POST /api/upload request for file "${file.name}"...`);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ image: base64Str, fileName: file.name }),
        });

        console.log(`[ADMIN WORKFLOW LOG] /api/upload response status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log('[ADMIN WORKFLOW LOG] Upload endpoint returned URL:', data.url);
          if (data.url) {
            newUrls.push(data.url);
          }
        } else {
          const errBody = await res.text().catch(() => '');
          console.error(`[ADMIN WORKFLOW LOG] Image upload failed for file "${file.name}". Status: ${res.status}, Error Body:`, errBody);
        }
      } catch (err) {
        console.error('[ADMIN WORKFLOW LOG] Exception during image upload for file:', file.name, err);
      }
    }

    if (newUrls.length > 0) {
      console.log(`[ADMIN WORKFLOW LOG] Successfully uploaded ${newUrls.length} image(s). Updating gallery state...`);
      setProductForm(prev => {
        const updatedGallery = [...prev.gallery, ...newUrls];
        const updatedImage = prev.image || updatedGallery[0];
        console.log('[ADMIN WORKFLOW LOG] Updated gallery array:', updatedGallery);
        console.log('[ADMIN WORKFLOW LOG] Updated primary image URL:', updatedImage);
        return {
          ...prev,
          gallery: updatedGallery,
          image: updatedImage,
        };
      });
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy.images;
        return copy;
      });
    } else {
      console.warn('[ADMIN WORKFLOW LOG] No valid image URLs returned from upload handler');
      setPublishErrorMessage('Unable to upload image(s). Please verify file size or format (JPG, PNG, WEBP).');
    }

    setIsUploadingImage(false);
    e.target.value = '';
  };

  // URL Image Addition
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) {
      console.warn('[ADMIN WORKFLOW LOG] Cannot add empty image URL');
      return;
    }
    console.log('[ADMIN WORKFLOW LOG] Adding direct image URL to gallery state:', url);
    setProductForm(prev => {
      const updatedGallery = [...prev.gallery, url];
      const updatedImage = prev.image || updatedGallery[0];
      console.log('[ADMIN WORKFLOW LOG] Updated gallery array:', updatedGallery);
      console.log('[ADMIN WORKFLOW LOG] Primary image URL:', updatedImage);
      return {
        ...prev,
        gallery: updatedGallery,
        image: updatedImage,
      };
    });
    setImageUrlInput('');
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  // Remove Image from Gallery Preview
  const handleRemoveImage = (indexToRemove: number) => {
    console.log(`[ADMIN WORKFLOW LOG] Removing image at gallery index ${indexToRemove}`);
    setProductForm(prev => {
      const updatedGallery = prev.gallery.filter((_, idx) => idx !== indexToRemove);
      const updatedImage = updatedGallery[0] || '';
      console.log('[ADMIN WORKFLOW LOG] Updated gallery array:', updatedGallery);
      return {
        ...prev,
        gallery: updatedGallery,
        image: updatedImage,
      };
    });
  };

  // Strict Form Validation
  const validateForm = () => {
    console.log('[ADMIN WORKFLOW LOG] Starting product form validation...');
    console.log('[ADMIN WORKFLOW LOG] Current productForm state:', JSON.stringify(productForm, null, 2));

    const errors: Record<string, string> = {};

    if (!productForm.name || !productForm.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (!productForm.shortDescription || !productForm.shortDescription.trim()) {
      errors.shortDescription = 'Short description is required.';
    }

    if (!productForm.description || !productForm.description.trim()) {
      errors.description = 'Full description is required.';
    }

    if (!productForm.category || !productForm.category.trim()) {
      errors.category = 'Please select a category.';
    }

    if (
      productForm.price === undefined ||
      productForm.price === null ||
      isNaN(productForm.price) ||
      Number(productForm.price) <= 0
    ) {
      errors.price = 'Please enter a selling price.';
    }

    if (
      productForm.originalPrice === undefined ||
      productForm.originalPrice === null ||
      isNaN(productForm.originalPrice) ||
      Number(productForm.originalPrice) <= 0
    ) {
      errors.originalPrice = 'Please enter MRP.';
    } else if (Number(productForm.originalPrice) < Number(productForm.price)) {
      errors.originalPrice = 'MRP must be greater than or equal to selling price.';
    }

    if (!productForm.gallery || productForm.gallery.length === 0) {
      errors.images = 'Please upload at least one product image.';
    }

    if (!productForm.sizes || productForm.sizes.length === 0) {
      errors.sizes = 'Please select at least one available size.';
    }

    if (
      productForm.stock === undefined ||
      productForm.stock === null ||
      isNaN(productForm.stock) ||
      Number(productForm.stock) < 0
    ) {
      errors.stock = 'Stock quantity cannot be negative.';
    }

    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      console.warn('[ADMIN WORKFLOW LOG] Form validation FAILED. Errors found:', errors);
    } else {
      console.log('[ADMIN WORKFLOW LOG] Form validation PASSED successfully.');
    }

    setFormErrors(errors);
    return isValid;
  };

  // Save / Publish Product
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ADMIN WORKFLOW LOG] Form submission triggered (handleSaveProductSubmit)');
    setPublishErrorMessage(null);
    setPublishSuccessMessage(null);

    const isValid = validateForm();
    if (!isValid) {
      console.warn('[ADMIN WORKFLOW LOG] Submission halted due to validation errors.');
      return; // Validation failed: do not reset form or close modal!
    }

    setIsPublishingProduct(true);

    const discountCalculated =
      productForm.originalPrice > productForm.price
        ? Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100)
        : 0;

    const payload = {
      name: productForm.name.trim(),
      shortDescription: productForm.shortDescription.trim(),
      description: productForm.description.trim(),
      category: productForm.category,
      subcategory: productForm.subcategory?.trim() || 'Printed Kurtis',
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice),
      discountPercent: discountCalculated,
      bestPrice: Math.round(Number(productForm.price) * 0.85),
      stock: Number(productForm.stock),
      fabric: productForm.fabric?.trim() || 'Premium Fabric',
      image: productForm.gallery[0] || productForm.image,
      gallery: productForm.gallery,
      sizes: productForm.sizes,
      colors: ['Maroon / Wine'],
      status: productForm.status,
      visibility: productForm.visibility,
      isNewArrival: productForm.isNewArrival,
      isBestSeller: productForm.isBestSeller,
      isTrending: productForm.isTrending,
      isFeatured: productForm.isFeatured,
      isRakhiGiftEligible: productForm.isRakhiGiftEligible,
    };

    try {
      if (editingProductId) {
        // Direct Firebase Update
        await updateProductInFirebase(editingProductId, payload);
      } else {
        // Direct Firebase Create
        await saveProductToFirebase(payload);
      }

      // Also notify backend if online
      try {
        const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: getAuthHeader(),
          body: JSON.stringify(payload),
        });
      } catch {}

      setPublishSuccessMessage(
        editingProductId ? 'Product updated successfully in Firebase.' : 'Product published successfully to Firebase live store.'
      );

      await refreshData();
      await loadAdminData();

      setTimeout(() => {
        setIsProductModalOpen(false);
        setEditingProductId(null);
        setIsPublishingProduct(false);
        setPublishSuccessMessage(null);
        handleTabChange('products');
      }, 1000);
    } catch (err: any) {
      console.error('[ADMIN WORKFLOW LOG] Firebase error saving product:', err);
      setPublishErrorMessage(err.message || 'Unable to publish product. Please check your Firebase database connection.');
      setIsPublishingProduct(false);
    }
  };

  // Toggle Publish / Draft Status
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const handleTogglePublishStatus = async (product: Product) => {
    setTogglingProductId(product.id);
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const newVisibility = newStatus === 'published' ? 'online' : 'hidden';

    try {
      // 1. Direct Firebase update
      await updateProductInFirebase(product.id, {
        status: newStatus,
        visibility: newVisibility,
      });

      // 2. Also notify backend
      try {
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({
            status: newStatus,
            visibility: newVisibility,
          }),
        });
      } catch {}

      await refreshData();
      await loadAdminData();
    } catch (err) {
      console.error('Error toggling publish status in Firebase:', err);
      alert('Error while updating product status in Firebase.');
    } finally {
      setTogglingProductId(null);
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (product: Product) => {
    setDeleteConfirmationProduct(product);
    setDeleteErrorMessage(null);
  };

  // Confirm Delete Product from Firebase
  const confirmDeleteProduct = async () => {
    if (!deleteConfirmationProduct) return;
    const prodId = deleteConfirmationProduct.id;
    setIsDeletingProduct(true);
    setDeleteErrorMessage(null);

    try {
      console.log(`[ADMIN DELETE] Deleting product ${prodId} directly from Firebase Firestore...`);
      // 1. Delete from Firebase Firestore using exact document ID
      await deleteProductFromFirebase(prodId);

      // 2. Also notify Express backend if running
      try {
        await fetch(`/api/products/${prodId}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
      } catch {}

      // 3. Immediately refresh and update UI
      await refreshData();
      await loadAdminData();

      // Close modal
      setDeleteConfirmationProduct(null);
    } catch (err: any) {
      console.error('[ADMIN DELETE] Error deleting product from Firebase:', err);
      setDeleteErrorMessage(err.message || 'Failed to delete product from database. Please try again.');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Toggle Gift Eligibility
  const handleToggleGiftEligibility = async (product: Product) => {
    try {
      await updateProductInFirebase(product.id, {
        isRakhiGiftEligible: !product.isRakhiGiftEligible,
      });

      try {
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify({ isRakhiGiftEligible: !product.isRakhiGiftEligible }),
        });
      } catch {}

      await refreshData();
    } catch (err) {
      console.error('Error toggling gift eligibility:', err);
    }
  };

  // Save Rakhi Offer Config
  const handleSaveRakhiOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rakhi-offer', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(rakhiConfigForm),
      });

      if (res.ok) {
        alert('Rakhi Offer configuration updated on live store!');
        await refreshData();
      }
    } catch (err) {
      console.error('Error updating Rakhi offer:', err);
    }
  };

  // Order Status Change
  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Payment Verification Approval / Rejection
  const handleVerifyPayment = async (orderId: string, action: 'approve' | 'reject') => {
    let rejectionReason = '';
    if (action === 'reject') {
      const reason = prompt('Please enter a reason for rejecting this payment (e.g. UTR not credited in bank, invalid transaction amount):');
      if (reason === null) return;
      rejectionReason = reason.trim() || 'Payment verification failed';
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          action,
          rejectionReason,
          adminName: 'LUXUE Accounts Team',
        }),
      });

      if (res.ok) {
        alert(action === 'approve' ? 'Payment approved & Order confirmed successfully!' : 'Payment rejected.');
        await loadAdminData();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error || 'Could not verify payment'}`);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Network error while verifying payment.');
    }
  };

  // Filtered Products
  const filteredProducts = adminProducts.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesCategory =
      productCategoryFilter === 'all' ||
      p.category?.toLowerCase() === productCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Derived Customer Directory from Orders
  const customerMap = new Map<string, { email: string; phone: string; name: string; totalSpent: number; orderCount: number; city: string }>();
  orders.forEach(o => {
    const key = o.email || o.phone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        email: o.email,
        phone: o.phone,
        name: o.customerName,
        totalSpent: o.totalAmount,
        orderCount: 1,
        city: o.shippingAddress?.city || 'Noida',
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.totalSpent += o.totalAmount;
      existing.orderCount += 1;
    }
  });
  const customersList = Array.from(customerMap.values());

  const tabList: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'highlights', label: 'Highlights & Banners CMS', icon: Layers },
    { id: 'payment-settings', label: 'Payment Settings (UPI)', icon: QrCode },
    { id: 'reviews', label: 'Customer Stories / Reviews', icon: Sparkles },
    { id: 'orders', label: 'Orders & Verifications', icon: ShoppingBag },
    { id: 'products', label: 'Products Catalog', icon: Package },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory Control', icon: Layers },
    { id: 'rakhi-offer', label: 'Rakhi Campaign', icon: Gift },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#1F060A] text-white pb-24">
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#2B090E] border-b-2 border-[#D4AF37] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B0C13] border border-[#D4AF37] text-[#DFBA67] flex items-center justify-center font-bold">
            <Gift className="w-5 h-5 text-[#DFBA67]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury text-base sm:text-lg font-black uppercase tracking-wider text-white">
                LUXUE ADMIN CONSOLE
              </h1>
              <span className="bg-[#DFBA67]/20 text-[#DFBA67] text-[10px] font-bold px-2 py-0.5 rounded border border-[#DFBA67]/40">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-[#C2B2A3]">Official Management Dashboard • Ground Floor, SD-46, Sector 45, Noida</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('home')}
            className="text-xs font-bold text-[#DFBA67] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onLogout}
            className="bg-[#801723] hover:bg-[#A01D2E] text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-[#D4AF37] flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-[#DFBA67]" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-[#D4AF37]/30">
          {tabList.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#801723] to-[#4A0E17] text-[#DFBA67] border border-[#D4AF37] shadow-lg scale-[1.02]'
                    : 'bg-[#2B090E] text-[#C2B2A3] hover:bg-[#3B0C13] hover:text-white border border-[#D4AF37]/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Gross Revenue</span>
                <p className="text-xl font-black text-white">₹{(analyticsMetrics.totalSales || analyticsMetrics.totalRevenue || 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Total Orders</span>
                <p className="text-xl font-black text-white">{analyticsMetrics.totalOrders}</p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Pending Orders</span>
                <p className="text-xl font-black text-amber-400">{analyticsMetrics.pendingOrders}</p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Confirmed / Paid</span>
                <p className="text-xl font-black text-emerald-400">{analyticsMetrics.confirmedOrders + analyticsMetrics.completedOrders}</p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Pending Verification</span>
                <p className="text-xl font-black text-amber-300">
                  {orders.filter(o => o.paymentVerification?.status === 'pending' || o.paymentStatus === 'Payment Processing').length}
                </p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Published Products</span>
                <p className="text-xl font-black text-white">
                  {products.filter(p => p.status !== 'draft' && p.visibility !== 'hidden').length} / {products.length}
                </p>
              </div>

              <div className="bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <span className="text-[10px] font-extrabold uppercase text-[#DFBA67] block mb-1">Low Stock Items</span>
                <p className="text-xl font-black text-rose-400">{analyticsMetrics.lowStockCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Campaign Status Card */}
              <div className="bg-[#2B090E] p-6 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                  <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#DFBA67]" />
                    <span>RAKHI CAMPAIGN LIVE ENGINE</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${rakhiOffer.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'}`}>
                    {rakhiOffer.isActive ? 'CAMPAIGN ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="text-xs text-[#C2B2A3] space-y-2">
                  <p>• <strong className="text-white">Min Cart Purchase:</strong> ₹{rakhiOffer.minCartValue}</p>
                  <p>• <strong className="text-white">Max Free Gift Cap:</strong> ₹{rakhiOffer.maxGiftValue}</p>
                  <p>• <strong className="text-white">Live Banner Tagline:</strong> "{rakhiOffer.headline}"</p>
                </div>

                <button
                  onClick={() => handleTabChange('rakhi-offer')}
                  className="w-full bg-[#801723] hover:bg-[#961D2D] text-[#DFBA67] font-bold text-xs py-3 rounded-xl border border-[#D4AF37] transition-all cursor-pointer"
                >
                  MANAGE RAKHI CAMPAIGN RULES →
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
                <h3 className="font-serif-luxury text-base font-bold text-white border-b border-[#D4AF37]/20 pb-3">
                  QUICK STORE ADMINISTRATION
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={openNewProductModal}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Kurti</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('highlights')}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Layers className="w-4 h-4 text-[#DFBA67]" />
                    <span>Highlights & Stories CMS</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('orders')}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Orders ({orders.length})</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('payment-settings')}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI & Payment Setup</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('reviews')}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#DFBA67]" />
                    <span>Customer Reviews (Stories)</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('settings')}
                    className="p-3.5 bg-[#1F060A] hover:bg-[#3B0C13] rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#DFBA67] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Store Details & GSTIN</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[220px] max-w-xs flex-1">
                  <Search className="w-4 h-4 text-[#DFBA67] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search kurtis by name, SKU, or fabric..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full bg-[#1F060A] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none placeholder:text-[#A39283]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  aria-label="Filter products by category"
                  className="bg-[#1F060A] text-xs text-[#DFBA67] font-semibold px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {Array.from(new Set(products.map(p => p.category))).filter(Boolean).map(cat => (
                    <option key={cat} value={cat}>
                      {cat} ({products.filter(p => p.category === cat).length})
                    </option>
                  ))}
                </select>

                <div className="text-xs text-[#DFBA67] bg-[#1F060A] px-3 py-2 rounded-xl border border-[#D4AF37]/30 flex items-center gap-1.5">
                  <span className="font-bold text-white">{filteredProducts.length}</span>
                  <span className="text-[#C2B2A3]">of {products.length} products shown</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSync20CatalogProducts}
                  disabled={isSyncingCatalog}
                  className="bg-[#1F060A] hover:bg-[#3B0C13] text-[#DFBA67] font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 flex items-center gap-1.5 cursor-pointer shadow transition-colors disabled:opacity-50"
                  title="Push the complete 35 product catalog to Firebase Firestore"
                >
                  {isSyncingCatalog ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DFBA67]" />
                      <span>Syncing Products...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#DFBA67]" />
                      <span>Sync & Publish Complete Catalog</span>
                    </>
                  )}
                </button>

                <button
                  onClick={openNewProductModal}
                  className="bg-[#801723] hover:bg-[#981E2E] text-[#DFBA67] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#D4AF37] flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD NEW PRODUCT</span>
                </button>
              </div>
            </div>

            {syncFeedback && (
              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            <div className="bg-[#2B090E] rounded-2xl border border-[#D4AF37]/30 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1F060A] text-[#DFBA67] border-b border-[#D4AF37]/30">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status / Visibility</th>
                    <th className="p-3">Rakhi Gift Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20">
                  {filteredProducts.map(p => {
                    const isPublished = p.status !== 'draft' && p.visibility !== 'hidden';
                    const isToggling = togglingProductId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-[#3B0C13]/50 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded border border-[#D4AF37]/40" />
                          <div>
                            <p className="font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-[#C2B2A3]">{p.sku}</p>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#DFBA67]">{p.category}</td>
                        <td className="p-3 font-bold text-white">₹{p.price}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock < 10 ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'}`}>
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleTogglePublishStatus(p)}
                            disabled={isToggling}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isPublished
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:bg-neutral-800'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                            <span>{isToggling ? 'Updating...' : isPublished ? 'Published' : 'Draft / Hidden'}</span>
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleGiftEligibility(p)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                              p.isRakhiGiftEligible
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                                : 'bg-[#1F060A] text-[#A39283] border-[#D4AF37]/30'
                            }`}
                          >
                            {p.isRakhiGiftEligible ? '🎁 ELIGIBLE FOR FREE GIFT' : 'NOT ELIGIBLE'}
                          </button>
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 bg-[#1F060A] text-[#DFBA67] rounded hover:bg-[#3B0C13] border border-[#D4AF37]/40 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-500/40 cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 space-y-4">
              <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
                PRODUCT CATEGORIES CATALOG ({categories.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <div key={cat.id} className="bg-[#1F060A] p-4 rounded-2xl border border-[#D4AF37]/40 flex items-center gap-3">
                      <img src={cat.image} alt={cat.name} className="w-14 h-14 object-cover rounded-xl border border-[#D4AF37]/30" />
                      <div>
                        <h4 className="font-bold text-white text-xs">{cat.name}</h4>
                        <p className="text-[11px] text-[#DFBA67]">{count} Kurtis Available</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#2B090E] p-4 rounded-2xl border border-[#D4AF37]/30">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-white">
                  CUSTOMER ORDERS & PAYMENT VERIFICATION ({orders.length})
                </h2>
                <p className="text-xs text-[#C2B2A3]">
                  Approve incoming UPI UTRs, track payment status & fulfill orders.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setOrderPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    orderPaymentFilter === 'all'
                      ? 'bg-[#DFBA67] text-[#3B0C13] border-[#DFBA67]'
                      : 'bg-[#1F060A] text-[#C2B2A3] border-[#D4AF37]/30'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderPaymentFilter('pending-review')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    orderPaymentFilter === 'pending-review'
                      ? 'bg-amber-500 text-[#1F060A] border-amber-400'
                      : 'bg-[#1F060A] text-amber-300 border-amber-500/40'
                  }`}
                >
                  <span>Pending Review</span>
                  <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full">
                    {orders.filter(o => o.paymentVerification?.status === 'pending' || o.paymentStatus === 'Payment Processing').length}
                  </span>
                </button>
                <button
                  onClick={() => setOrderPaymentFilter('paid')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    orderPaymentFilter === 'paid'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-[#1F060A] text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  Paid & Confirmed ({orders.filter(o => o.paymentStatus === 'Paid').length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {orders
                .filter(o => {
                  if (orderPaymentFilter === 'pending-review') {
                    return (
                      o.paymentVerification?.status === 'pending' ||
                      o.paymentStatus === 'Payment Processing'
                    );
                  }
                  if (orderPaymentFilter === 'paid') return o.paymentStatus === 'Paid';
                  if (orderPaymentFilter === 'unpaid') return o.paymentStatus !== 'Paid';
                  return true;
                })
                .map(o => {
                  const isPaid = o.paymentStatus === 'Paid';
                  const hasUtrProof = Boolean(o.paymentVerification?.utrNumber);
                  const isUtrPending = o.paymentVerification?.status === 'pending';

                  return (
                    <div
                      key={o.id}
                      className={`p-5 rounded-2xl border space-y-4 transition-all ${
                        isUtrPending
                          ? 'bg-[#2B090E] border-amber-400 ring-1 ring-amber-400/50 shadow-xl'
                          : 'bg-[#2B090E] border-[#D4AF37]/30'
                      }`}
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between border-b border-[#D4AF37]/20 pb-3 gap-2 text-xs font-bold">
                        <div className="flex items-center gap-3">
                          <span className="text-[#DFBA67] font-mono text-sm">
                            ORDER #{o.id}
                          </span>
                          <span className="text-white">
                            • {o.customerName} ({o.phone})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isPaid
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-950 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            Payment: {o.paymentStatus} ({o.paymentMethod})
                          </span>
                          <span className="bg-[#1F060A] text-[#DFBA67] px-2.5 py-0.5 rounded text-[10px] font-bold border border-[#D4AF37]/40">
                            Fulfillment: {o.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items and Address Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <p className="font-bold text-[#DFBA67]">Purchased Items ({o.items.length}):</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {o.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[#C2B2A3] bg-[#1F060A] p-2 rounded-xl border border-[#D4AF37]/20">
                                <span className="font-semibold text-white truncate max-w-[200px]">
                                  {it.product.name} (Size: {it.selectedSize})
                                </span>
                                <span>
                                  Qty: {it.quantity} • ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                          {o.freeGiftItem && (
                            <p className="text-[11px] text-emerald-300 font-bold">
                              🎁 Free Rakhi Gift: {o.freeGiftItem.product.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 text-[#C2B2A3] bg-[#1F060A] p-3 rounded-xl border border-[#D4AF37]/20">
                          <p className="font-bold text-[#DFBA67]">Delivery Destination:</p>
                          <p className="text-white font-medium">{o.shippingAddress?.fullName} ({o.phone})</p>
                          <p>{o.shippingAddress?.house}, {o.shippingAddress?.street}</p>
                          <p>{o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pin}</p>
                          <p className="text-[#DFBA67] font-bold pt-1">
                            Total Payable: ₹{o.totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Prominent Payment Verification Section */}
                      {hasUtrProof && (
                        <div className="bg-[#1F060A] p-4 rounded-xl border-2 border-[#D4AF37]/50 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                                UPI TRANSACTION PROOF SUBMISSION
                              </span>
                              <p className="font-mono text-sm font-black text-white mt-0.5">
                                UTR / REF ID: <span className="text-[#DFBA67]">{o.paymentVerification?.utrNumber}</span>
                              </p>
                              <p className="text-[10px] text-[#A39283]">
                                Submitted at: {o.paymentVerification?.submittedAt ? new Date(o.paymentVerification.submittedAt).toLocaleString('en-IN') : 'Recently'}
                              </p>
                            </div>

                            {o.paymentVerification?.screenshotUrl && (
                              <a
                                href={o.paymentVerification.screenshotUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#2B090E] hover:bg-[#3B0C13] text-[#DFBA67] px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View Receipt Screenshot</span>
                              </a>
                            )}
                          </div>

                          {/* Approval / Rejection Buttons */}
                          {isUtrPending ? (
                            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D4AF37]/20">
                              <span className="text-xs font-bold text-white">Bank Verification Action:</span>
                              <button
                                onClick={() => handleVerifyPayment(o.id, 'approve')}
                                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                              >
                                <Check className="w-4 h-4" />
                                <span>APPROVE PAYMENT & CONFIRM ORDER</span>
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(o.id, 'reject')}
                                className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-xs px-4 py-2 rounded-xl border border-rose-500/40 cursor-pointer flex items-center gap-1.5 transition-all"
                              >
                                <X className="w-4 h-4" />
                                <span>REJECT PAYMENT</span>
                              </button>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-[#D4AF37]/20 text-[11px] font-bold text-emerald-400">
                              ✓ Verified and approved by {o.paymentVerification?.reviewedBy || 'Admin'} on {o.paymentVerification?.reviewedAt ? new Date(o.paymentVerification.reviewedAt).toLocaleString('en-IN') : 'recent session'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Info Banner if paid by Card */}
                      {o.cardInfo && (
                        <div className="bg-[#1F060A] p-3 rounded-xl border border-emerald-500/40 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                              AUTHENTICATED CARD TRANSACTION
                            </span>
                            <span className="font-mono text-white font-bold">
                              {o.cardInfo.brand} ({o.cardInfo.maskedNumber}) • Cardholder: {o.cardInfo.cardholderName}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950 px-2 py-1 rounded border border-emerald-500/30">
                            Auth: {o.cardInfo.authCode}
                          </span>
                        </div>
                      )}

                      {/* Order Status Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D4AF37]/20">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#DFBA67]">
                            FULFILLMENT STATUS:
                          </span>
                          <select
                            value={o.orderStatus}
                            onChange={e => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                            className="bg-[#1F060A] text-xs font-bold text-white px-3.5 py-2 rounded-xl border border-[#D4AF37]/50 focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <span className="text-[11px] text-[#A39283]">
                          Placed: {new Date(o.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 5. CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
              REGISTERED & ORDERING CUSTOMERS ({customersList.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1F060A] text-[#DFBA67] border-b border-[#D4AF37]/30">
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Total Lifetime Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20">
                  {customersList.map((c, i) => (
                    <tr key={i} className="hover:bg-[#3B0C13]/50">
                      <td className="p-3 font-bold text-white">{c.name}</td>
                      <td className="p-3 text-[#C2B2A3]">{c.email}</td>
                      <td className="p-3 text-[#C2B2A3]">{c.phone}</td>
                      <td className="p-3 text-[#DFBA67]">{c.city}</td>
                      <td className="p-3 font-bold text-white">{c.orderCount} order(s)</td>
                      <td className="p-3 font-extrabold text-[#DFBA67]">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. INVENTORY CONTROL */}
        {activeTab === 'inventory' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
              STOCK & INVENTORY CONTROL
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1F060A] text-[#DFBA67] border-b border-[#D4AF37]/30">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-white">{p.name}</td>
                      <td className="p-3 text-[#C2B2A3]">{p.sku}</td>
                      <td className="p-3 font-mono font-bold text-white">{p.stock} units</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock < 10 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                          {p.stock < 10 ? 'LOW STOCK ALERT' : 'IN STOCK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. RAKHI OFFER CONFIG */}
        {activeTab === 'rakhi-offer' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border-2 border-[#D4AF37] max-w-2xl space-y-6 shadow-2xl">
            <h2 className="font-serif-luxury text-xl font-bold text-white border-b border-[#D4AF37]/20 pb-3 flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#DFBA67]" />
              <span>RAKHI FESTIVE CAMPAIGN CONFIGURATION</span>
            </h2>

            <form onSubmit={handleSaveRakhiOfferSubmit} className="space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-[#1F060A] p-3.5 rounded-xl border border-[#D4AF37]/40">
                <input
                  type="checkbox"
                  id="rakhiActiveTab"
                  checked={rakhiConfigForm.isActive}
                  onChange={e => setRakhiConfigForm({ ...rakhiConfigForm, isActive: e.target.checked })}
                  className="accent-[#DFBA67] w-5 h-5 cursor-pointer"
                />
                <label htmlFor="rakhiActiveTab" className="font-bold text-[#DFBA67] cursor-pointer">
                  ENABLE RAKHI CAMPAIGN & FREE GIFT OFFER ON STOREFRONT
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#C2B2A3] block mb-1">
                    MINIMUM CART ORDER VALUE (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={rakhiConfigForm.minCartValue}
                    onChange={e => setRakhiConfigForm({ ...rakhiConfigForm, minCartValue: Number(e.target.value) })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#C2B2A3] block mb-1">
                    MAXIMUM FREE GIFT VALUE CAP (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={rakhiConfigForm.maxGiftValue}
                    onChange={e => setRakhiConfigForm({ ...rakhiConfigForm, maxGiftValue: Number(e.target.value) })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#C2B2A3] block mb-1">CAMPAIGN TITLE</label>
                <input
                  type="text"
                  value={rakhiConfigForm.title}
                  onChange={e => setRakhiConfigForm({ ...rakhiConfigForm, title: e.target.value })}
                  className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40"
                />
              </div>

              <div>
                <label className="font-bold text-[#C2B2A3] block mb-1">OFFER SUBTITLE / HEADLINE</label>
                <input
                  type="text"
                  value={rakhiConfigForm.headline}
                  onChange={e => setRakhiConfigForm({ ...rakhiConfigForm, headline: e.target.value })}
                  className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#801723] to-[#4A0E17] text-[#DFBA67] font-extrabold text-xs py-3.5 rounded-xl border border-[#D4AF37] cursor-pointer shadow-lg uppercase tracking-wider"
              >
                SAVE & UPDATE RAKHI CAMPAIGN RULES
              </button>
            </form>
          </div>
        )}

        {/* 8. COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 max-w-xl space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
              STORE PROMO COUPONS
            </h2>

            <div className="space-y-2">
              {coupons.map(c => (
                <div key={c.code} className="p-3.5 bg-[#1F060A] rounded-xl border border-[#D4AF37]/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#DFBA67] font-mono text-sm">{c.code}</span>
                    <p className="text-[11px] text-[#C2B2A3]">
                      {c.discountType === 'fixed' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`} (Min order: ₹{c.minOrderValue})
                    </p>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-1 rounded text-[10px]">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. BANNERS */}
        {activeTab === 'banners' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 max-w-2xl space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
              HERO PROMOTIONAL BANNERS
            </h2>

            <div className="space-y-3">
              {banners.map(b => (
                <div key={b.id} className="bg-[#1F060A] p-4 rounded-2xl border border-[#D4AF37]/30 flex items-center gap-4">
                  <img src={b.image} alt={b.title} className="w-20 h-16 object-cover rounded-xl border border-[#D4AF37]/40" />
                  <div>
                    <h4 className="font-bold text-white text-xs">{b.title}</h4>
                    <p className="text-[11px] text-[#DFBA67]">{b.subtitle}</p>
                    <p className="text-[10px] text-[#C2B2A3]">Link: {b.linkUrl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-[#2B090E] p-6 rounded-3xl border border-[#D4AF37]/30 space-y-6">
            <h2 className="font-serif-luxury text-lg font-bold text-white border-b border-[#D4AF37]/20 pb-3">
              STORE ANALYTICS & PERFORMANCE METRICS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#1F060A] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
                <span className="text-xs font-bold text-[#DFBA67]">Gross Sales Revenue</span>
                <p className="text-2xl font-extrabold text-white">₹{analyticsMetrics.totalRevenue.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-[#1F060A] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
                <span className="text-xs font-bold text-[#DFBA67]">Fulfillment Rate</span>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {analyticsMetrics.totalOrders > 0 ? `${Math.round((analyticsMetrics.completedOrders / analyticsMetrics.totalOrders) * 100)}%` : '100%'}
                </p>
              </div>

              <div className="bg-[#1F060A] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
                <span className="text-xs font-bold text-[#DFBA67]">Active Catalog Items</span>
                <p className="text-2xl font-extrabold text-white">{products.length} Kurtis</p>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT SETTINGS (UPI & GATEWAY) */}
        {activeTab === 'payment-settings' && <AdminPaymentSettings />}

        {/* 11. BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-[#2B090E] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 max-w-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
              <Building className="w-6 h-6 text-[#DFBA67]" />
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white">
                  OFFICIAL BUSINESS & PAYMENT SETTINGS
                </h2>
                <p className="text-xs text-[#C2B2A3]">
                  Configured merchant gateway details, UPI ID, GSTIN, and WhatsApp support.
                </p>
              </div>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const success = await updateSettings(settingsForm);
                if (success) {
                  alert('Business details & payment settings updated successfully!');
                } else {
                  alert('Failed to update store settings.');
                }
              }}
              className="space-y-6 text-xs"
            >
              {/* Payment Gateway Configuration Box */}
              <div className="bg-[#1F060A] p-5 rounded-2xl border-2 border-[#D4AF37]/40 space-y-4">
                <h3 className="font-serif-luxury text-sm font-bold text-[#DFBA67] uppercase tracking-wider border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                  <span>PAYMENT GATEWAY CONFIGURATION</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">MERCHANT STORE NAME</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.paymentSettings?.merchantName || settingsForm.merchantName || settingsForm.storeName || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setSettingsForm({
                          ...settingsForm,
                          merchantName: val,
                          paymentSettings: {
                            ...(settingsForm.paymentSettings || {
                              merchantUpiId: '',
                              merchantName: settingsForm.storeName || 'LUXUE FASHION ONLINE',
                              upiEnabled: true,
                              cardEnabled: true,
                              codEnabled: false,
                            }),
                            merchantName: val,
                          },
                        });
                      }}
                      className="w-full bg-[#2B090E] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">MERCHANT UPI ID (VPA)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.paymentSettings?.merchantUpiId || settingsForm.merchantUpiId || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setSettingsForm({
                          ...settingsForm,
                          merchantUpiId: val,
                          paymentSettings: {
                            ...(settingsForm.paymentSettings || {
                              merchantUpiId: '',
                              merchantName: settingsForm.storeName || 'LUXUE FASHION ONLINE',
                              upiEnabled: true,
                              cardEnabled: true,
                              codEnabled: false,
                            }),
                            merchantUpiId: val,
                          },
                        });
                      }}
                      className="w-full bg-[#2B090E] text-white font-mono px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2.5 bg-[#2B090E] p-3 rounded-xl border border-[#D4AF37]/30">
                    <input
                      type="checkbox"
                      id="upiToggle"
                      checked={settingsForm.paymentSettings?.upiEnabled ?? true}
                      onChange={e =>
                        setSettingsForm({
                          ...settingsForm,
                          paymentSettings: {
                            ...(settingsForm.paymentSettings || {
                              merchantUpiId: '',
                              merchantName: settingsForm.storeName || 'LUXUE FASHION ONLINE',
                              upiEnabled: true,
                              cardEnabled: true,
                              codEnabled: false,
                            }),
                            upiEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="upiToggle" className="font-bold text-white text-[11px] cursor-pointer">
                      Enable Dynamic UPI QR Checkout
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5 bg-[#2B090E] p-3 rounded-xl border border-[#D4AF37]/30">
                    <input
                      type="checkbox"
                      id="cardToggle"
                      checked={settingsForm.paymentSettings?.cardEnabled ?? true}
                      onChange={e =>
                        setSettingsForm({
                          ...settingsForm,
                          paymentSettings: {
                            ...(settingsForm.paymentSettings || {
                              merchantUpiId: '',
                              merchantName: settingsForm.storeName || 'LUXUE FASHION ONLINE',
                              upiEnabled: true,
                              cardEnabled: true,
                              codEnabled: false,
                            }),
                            cardEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="cardToggle" className="font-bold text-white text-[11px] cursor-pointer">
                      Enable Credit / Debit Card Checkout
                    </label>
                  </div>
                </div>

                {/* COD Lock Policy */}
                <div className="bg-[#2B090E] p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-rose-300">Cash on Delivery (COD) Status: LOCKED</span>
                    <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">PREPAID ONLY</span>
                  </div>
                  <p className="text-[10px] text-[#C2B2A3]">
                    COD is locked across all storefront checkout sessions to ensure genuine orders and prevent courier return loss on handcrafted designer kurtis.
                  </p>
                </div>
              </div>

              {/* General Business Information */}
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">STORE BRAND NAME</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">WHATSAPP SUPPORT NUMBER</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">OFFICIAL GSTIN</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.gstin || '09AAMFE0502D1ZX'}
                      onChange={e => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                      className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">SUPPORT PHONE</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.supportPhone}
                      onChange={e => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                      className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#DFBA67] block mb-1 uppercase">SUPPORT EMAIL</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.supportEmail}
                      onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">OFFICE ADDRESS</label>
                  <textarea
                    rows={2}
                    required
                    value={settingsForm.address || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45, Noida, Uttar Pradesh, 201303, India'}
                    onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#801723] to-[#4A0E17] text-[#DFBA67] font-extrabold text-xs py-3.5 rounded-xl border border-[#D4AF37] cursor-pointer shadow-lg uppercase tracking-wider"
              >
                SAVE OFFICIAL BUSINESS & PAYMENT SETTINGS
              </button>
            </form>
          </div>
        )}

        {/* 13. CUSTOMER REVIEWS HIGHLIGHTS (INSTAGRAM STORIES) */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <AdminCustomerReviews />
          </div>
        )}

        {/* 14. HIGHLIGHTS & LOOKBOOK STORIES CMS */}
        {activeTab === 'highlights' && (
          <div className="space-y-6">
            <AdminHighlightsManager />
          </div>
        )}

      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#2B090E] w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#D4AF37] max-h-[92vh] overflow-y-auto space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#DFBA67]" />
                  <span>{editingProductId ? 'EDIT KURTI PRODUCT DETAILS' : 'ADD & PUBLISH NEW KURTI PRODUCT'}</span>
                </h3>
                <p className="text-[11px] text-[#C2B2A3]">Fill in all product specifications and upload official gallery images.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#C2B2A3] hover:text-white text-xs font-bold p-2 rounded-xl bg-[#1F060A] border border-[#D4AF37]/30 cursor-pointer flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">CLOSE</span>
              </button>
            </div>

            {/* Success Alert Banner */}
            {publishSuccessMessage && (
              <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{publishSuccessMessage}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {publishErrorMessage && (
              <div className="p-3.5 bg-rose-950/90 border border-rose-500 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="font-semibold">{publishErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs" noValidate>
              {/* Product Title */}
              <div>
                <label className="font-bold text-[#DFBA67] block mb-1 uppercase">PRODUCT NAME / TITLE *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => {
                    setProductForm({ ...productForm, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  placeholder="e.g. Maroon Paisley Printed Long Sleeve Kurti"
                  className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                    formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/40 focus:border-[#D4AF37]'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="font-bold text-[#DFBA67] block mb-1 uppercase">SHORT SUMMARY / HIGHLIGHTS *</label>
                <input
                  type="text"
                  value={productForm.shortDescription}
                  onChange={e => {
                    setProductForm({ ...productForm, shortDescription: e.target.value });
                    if (formErrors.shortDescription) setFormErrors({ ...formErrors, shortDescription: '' });
                  }}
                  placeholder="e.g. Elegant maroon printed kurti featuring an all-over paisley pattern, square neckline and full sleeves."
                  className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                    formErrors.shortDescription ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/40 focus:border-[#D4AF37]'
                  }`}
                />
                {formErrors.shortDescription && (
                  <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.shortDescription}</span>
                  </p>
                )}
              </div>

              {/* Full Description */}
              <div>
                <label className="font-bold text-[#DFBA67] block mb-1 uppercase">FULL PRODUCT DESCRIPTION *</label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={e => {
                    setProductForm({ ...productForm, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  placeholder="Add effortless elegance to your wardrobe with this sophisticated maroon printed kurti..."
                  className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                    formErrors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/40 focus:border-[#D4AF37]'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.description}</span>
                  </p>
                )}
              </div>

              {/* Category & Subcategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">CATEGORY *</label>
                  <select
                    value={productForm.category}
                    onChange={e => {
                      setProductForm({ ...productForm, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border font-bold focus:outline-none ${
                      formErrors.category ? 'border-rose-500' : 'border-[#D4AF37]/40'
                    }`}
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Embroidered Suit Set">Embroidered Suit Set</option>
                        <option value="A-Line Suit">A-Line Suit</option>
                        <option value="Ethnic Suit Set">Ethnic Suit Set</option>
                        <option value="Casual Co-ord Set">Casual Co-ord Set</option>
                        <option value="Fusion Suit">Fusion Suit</option>
                        <option value="Kurta Set">Kurta Set</option>
                        <option value="Anarkali Suit">Anarkali Suit</option>
                        <option value="Daily Wear Kurti Set">Daily Wear Kurti Set</option>
                        <option value="Cotton Kurti">Cotton Kurti</option>
                        <option value="Festive Suit">Festive Suit</option>
                        <option value="Silk Suit Set">Silk Suit Set</option>
                        <option value="Straight-Cut Suit">Straight-Cut Suit</option>
                        <option value="Flared Suit">Flared Suit</option>
                        <option value="Smart Suit Set">Smart Suit Set</option>
                        <option value="Salwar Suit">Salwar Suit</option>
                        <option value="Vichitra Suit">Vichitra Suit</option>
                        <option value="Alia Cut Suit">Alia Cut Suit</option>
                        <option value="Sharara Set">Sharara Set</option>
                        <option value="Silk Salwar Suit">Silk Salwar Suit</option>
                        <option value="Floral Suit">Floral Suit</option>
                        <option value="Cotton Kurtis">Cotton Kurtis</option>
                        <option value="Designer Kurtis">Designer Kurtis</option>
                        <option value="Everyday Kurtis">Everyday Kurtis</option>
                        <option value="Printed Kurtis">Printed Kurtis</option>
                        <option value="Festive Kurtis">Festive Kurtis</option>
                        <option value="Office Wear">Office Wear</option>
                      </>
                    )}
                  </select>
                  {formErrors.category && (
                    <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.category}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">SUBCATEGORY</label>
                  <input
                    type="text"
                    value={productForm.subcategory}
                    onChange={e => setProductForm({ ...productForm, subcategory: e.target.value })}
                    placeholder="e.g. Printed Kurtis"
                    className="w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">FABRIC / MATERIAL</label>
                  <input
                    type="text"
                    value={productForm.fabric}
                    onChange={e => setProductForm({ ...productForm, fabric: e.target.value })}
                    placeholder="e.g. Premium Cotton Blend"
                    className="w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">SELLING PRICE (₹) *</label>
                  <input
                    type="number"
                    value={productForm.price || ''}
                    onChange={e => {
                      setProductForm({ ...productForm, price: Number(e.target.value) });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    placeholder="1499"
                    className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border font-bold focus:outline-none ${
                      formErrors.price ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/40'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.price}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">ORIGINAL MRP (₹) *</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={e => {
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) });
                      if (formErrors.originalPrice) setFormErrors({ ...formErrors, originalPrice: '' });
                    }}
                    placeholder="2499"
                    className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      formErrors.originalPrice ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/40'
                    }`}
                  />
                  {formErrors.originalPrice && (
                    <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.originalPrice}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">COMPUTED DISCOUNT</label>
                  <div className="w-full bg-[#1F060A] text-emerald-400 font-extrabold px-3.5 py-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                    <span>
                      {productForm.originalPrice > productForm.price && productForm.originalPrice > 0
                        ? `${Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100)}% OFF`
                        : '0% OFF'}
                    </span>
                    <span className="text-[10px] text-[#A39283]">(AUTO)</span>
                  </div>
                </div>
              </div>

              {/* Product Images & Upload Management */}
              <div className="space-y-2 bg-[#1F060A] p-4 rounded-2xl border border-[#D4AF37]/40">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                  <label className="font-bold text-[#DFBA67] uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>PRODUCT IMAGES & GALLERY GALLERY *</span>
                  </label>
                  <span className="text-[10px] text-[#C2B2A3]">
                    {productForm.gallery.length} image(s) selected
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-[#C2B2A3] mb-1 font-semibold">
                      Upload Files (JPG, PNG, WEBP):
                    </label>
                    <label className="cursor-pointer bg-[#801723] hover:bg-[#981E2E] text-[#DFBA67] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#D4AF37] flex items-center justify-center gap-2 transition-all">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#DFBA67]" />
                          <span>UPLOADING IMAGE(S)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>CHOOSE & UPLOAD IMAGES</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#C2B2A3] mb-1 font-semibold">
                      Or Add Image URL Directly:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-[#2B090E] text-white px-3 py-2 rounded-xl border border-[#D4AF37]/40 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-[#3B0C13] hover:bg-[#4A0E17] text-[#DFBA67] font-bold px-3 py-2 rounded-xl border border-[#D4AF37]/40 text-xs cursor-pointer"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Gallery Previews */}
                {productForm.gallery.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {productForm.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group bg-[#2B090E] rounded-xl overflow-hidden border border-[#D4AF37]/50 aspect-[3/4]"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/75 text-[9px] font-bold px-1.5 py-0.5 rounded text-[#DFBA67]">
                          #{idx + 1}
                        </div>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 right-1 bg-[#801723] text-white text-[8px] font-extrabold text-center py-0.5 rounded uppercase">
                            PRIMARY
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-rose-950/90 hover:bg-rose-900 text-rose-200 p-1 rounded-full border border-rose-500/50 opacity-90 transition-opacity cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[#D4AF37]/30 rounded-xl text-center text-[#C2B2A3] text-xs">
                    No product images uploaded yet. Please upload or add at least 1 image.
                  </div>
                )}

                {formErrors.images && (
                  <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.images}</span>
                  </p>
                )}
              </div>

              {/* Stock & Size Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">STOCK QUANTITY *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={e => {
                      setProductForm({ ...productForm, stock: Number(e.target.value) });
                      if (formErrors.stock) setFormErrors({ ...formErrors, stock: '' });
                    }}
                    placeholder="25"
                    className={`w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border font-bold focus:outline-none ${
                      formErrors.stock ? 'border-rose-500' : 'border-[#D4AF37]/40'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.stock}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">AVAILABLE SIZES *</label>
                  <div
                    className={`flex flex-wrap gap-2.5 bg-[#1F060A] p-2.5 rounded-xl border ${
                      formErrors.sizes ? 'border-rose-500' : 'border-[#D4AF37]/40'
                    }`}
                  >
                    {(['S', 'M', 'L', 'XL', 'XXL', '3XL'] as Size[]).map(sz => {
                      const isChecked = productForm.sizes.includes(sz);
                      return (
                        <label
                          key={sz}
                          className={`flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#801723] text-[#DFBA67] border-[#D4AF37]'
                              : 'bg-[#2B090E] text-[#C2B2A3] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              const newSizes = e.target.checked
                                ? [...productForm.sizes, sz]
                                : productForm.sizes.filter(s => s !== sz);
                              setProductForm({ ...productForm, sizes: newSizes });
                              if (formErrors.sizes && newSizes.length > 0) {
                                setFormErrors({ ...formErrors, sizes: '' });
                              }
                            }}
                            className="hidden"
                          />
                          <span>{sz}</span>
                          {isChecked && <Check className="w-3 h-3 text-[#DFBA67]" />}
                        </label>
                      );
                    })}
                  </div>
                  {formErrors.sizes && (
                    <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.sizes}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">PRODUCT STATUS</label>
                  <select
                    value={productForm.status}
                    onChange={e => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 font-bold focus:outline-none"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="draft">Draft (Hidden from Store)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#DFBA67] block mb-1 uppercase">STOREFRONT VISIBILITY</label>
                  <select
                    value={productForm.visibility}
                    onChange={e => setProductForm({ ...productForm, visibility: e.target.value as any })}
                    className="w-full bg-[#1F060A] text-white px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 font-bold focus:outline-none"
                  >
                    <option value="online">Online Storefront Visible</option>
                    <option value="hidden">Hidden from Search & Categories</option>
                  </select>
                </div>
              </div>

              {/* Flags & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#1F060A] p-3 rounded-xl border border-[#D4AF37]/40">
                <label className="flex items-center gap-2 font-bold text-xs text-[#DFBA67] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isRakhiGiftEligible}
                    onChange={e => setProductForm({ ...productForm, isRakhiGiftEligible: e.target.checked })}
                    className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                  />
                  <span>🎁 RAKHI OFFER ELIGIBLE</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-xs text-[#DFBA67] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={e => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                  />
                  <span>✨ MARK AS NEW ARRIVAL</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-xs text-[#DFBA67] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                  />
                  <span>⭐ FEATURED PRODUCT</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-xs text-[#DFBA67] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isTrending}
                    onChange={e => setProductForm({ ...productForm, isTrending: e.target.checked })}
                    className="accent-[#DFBA67] w-4 h-4 cursor-pointer"
                  />
                  <span>🔥 TRENDING ITEM</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isPublishingProduct}
                  className="flex-1 py-3 text-xs font-bold bg-[#1F060A] hover:bg-[#3B0C13] rounded-xl border border-[#D4AF37]/30 text-white cursor-pointer disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isPublishingProduct || isUploadingImage}
                  className="flex-1 py-3.5 text-xs font-extrabold bg-gradient-to-r from-[#801723] to-[#4A0E17] hover:brightness-110 text-[#DFBA67] rounded-xl border border-[#D4AF37] cursor-pointer shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isPublishingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#DFBA67]" />
                      <span>PUBLISHING PRODUCT...</span>
                    </>
                  ) : (
                    <span>{editingProductId ? 'UPDATE & SAVE CHANGES' : 'PUBLISH PRODUCT TO LIVE STORE'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIREBASE PRODUCT DELETE CONFIRMATION MODAL */}
      {deleteConfirmationProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#2B090E] border-2 border-rose-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white">
                  Delete this product?
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/30">
              <img
                src={deleteConfirmationProduct.image}
                alt={deleteConfirmationProduct.name}
                className="w-14 h-16 object-cover rounded-xl border border-[#D4AF37]/40 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white truncate">{deleteConfirmationProduct.name}</p>
                <p className="text-[11px] text-[#DFBA67] font-semibold">{deleteConfirmationProduct.category} • ₹{deleteConfirmationProduct.price}</p>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
                  ID: {deleteConfirmationProduct.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#C2B2A3] leading-relaxed">
              This will permanently delete this product from the Firebase Firestore database and immediately remove it from the customer storefront catalog.
            </p>

            {deleteErrorMessage && (
              <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{deleteErrorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingProduct) {
                    setDeleteConfirmationProduct(null);
                    setDeleteErrorMessage(null);
                  }
                }}
                disabled={isDeletingProduct}
                className="flex-1 py-3 text-xs font-bold bg-[#1F060A] hover:bg-[#3B0C13] rounded-xl border border-[#D4AF37]/30 text-white cursor-pointer disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeletingProduct}
                className="flex-1 py-3 text-xs font-extrabold bg-rose-700 hover:bg-rose-600 text-white rounded-xl border border-rose-500 cursor-pointer shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isDeletingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting from Firebase...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
