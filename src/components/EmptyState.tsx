import React from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Package,
  AlertCircle,
  XCircle,
  WifiOff,
  FileQuestion,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export type EmptyStateType =
  | 'empty-cart'
  | 'empty-wishlist'
  | 'no-search-results'
  | 'no-orders'
  | 'out-of-stock'
  | 'product-unavailable'
  | 'payment-failed'
  | 'network-error'
  | 'not-found';

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  onAction,
  actionText,
}) => {
  const { navigate } = useShop();

  const getConfig = () => {
    switch (type) {
      case 'empty-cart':
        return {
          icon: ShoppingBag,
          title: 'Your Shopping Bag is Empty',
          subtitle: 'Discover our luxury collection of handcrafted Kurtis and unlock festive Rakhi gift rewards.',
          ctaText: actionText || 'EXPLORE KURTIS COLLECTION',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'empty-wishlist':
        return {
          icon: Heart,
          title: 'Your Wishlist is Empty',
          subtitle: 'Save your favorite Designer & Anarkali Kurtis to curate your personal festive wardrobe.',
          ctaText: actionText || 'DISCOVER BESTSELLERS',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'no-search-results':
        return {
          icon: Search,
          title: `No Kurtis Found for "${searchQuery || 'your query'}"`,
          subtitle: 'Try searching for Cotton Kurtis, Anarkali, Festive Wear, or Embroidered Silk.',
          ctaText: actionText || 'VIEW ALL KURTIS',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'no-orders':
        return {
          icon: Package,
          title: 'No Previous Orders Found',
          subtitle: 'You haven’t placed any orders yet. Start your luxury fashion journey with LUXUE.',
          ctaText: actionText || 'START SHOPPING NOW',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'out-of-stock':
        return {
          icon: AlertCircle,
          title: 'Currently Out of Stock',
          subtitle: 'This luxury piece is temporarily sold out. Check out similar designer Kurtis in our festive line.',
          ctaText: actionText || 'VIEW SIMILAR STYLES',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'product-unavailable':
        return {
          icon: XCircle,
          title: 'Product Unavailable',
          subtitle: 'This edition is no longer available in our active catalog.',
          ctaText: actionText || 'RETURN TO SHOP',
          ctaAction: onAction || (() => navigate('shop')),
        };
      case 'payment-failed':
        return {
          icon: AlertCircle,
          title: 'Payment Encountered an Issue',
          subtitle: 'Your transaction could not be completed. Your cart items have been saved safely.',
          ctaText: actionText || 'RETRY CHECKOUT',
          ctaAction: onAction || (() => navigate('checkout')),
        };
      case 'network-error':
        return {
          icon: WifiOff,
          title: 'Connection Temporarily Unavailable',
          subtitle: 'Please check your internet connection and try refreshing.',
          ctaText: actionText || 'RETRY CONNECTION',
          ctaAction: onAction || (() => window.location.reload()),
        };
      case 'not-found':
      default:
        return {
          icon: FileQuestion,
          title: '404 — Page Not Found',
          subtitle: 'The luxury page you are looking for does not exist or has moved.',
          ctaText: actionText || 'GO TO HOMEPAGE',
          ctaAction: onAction || (() => navigate('home')),
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-[#F9F5F0] rounded-3xl border border-[#E2C485]/40 my-8 max-w-2xl mx-auto shadow-xs">
      <div className="w-20 h-20 rounded-full bg-[#5B0F15]/10 border-2 border-[#C5A059] flex items-center justify-center mb-6 text-[#5B0F15] shadow-inner">
        <IconComponent className="w-10 h-10 stroke-[1.5]" />
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5B0F15] mb-3 tracking-wide">
        {config.title}
      </h2>

      <p className="text-sm text-[#4A4A4A] max-w-md mb-8 leading-relaxed">
        {config.subtitle}
      </p>

      <button
        onClick={config.ctaAction}
        className="bg-wine-gradient text-[#F9F5F0] hover:brightness-110 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl border border-[#C5A059] flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#C5A059]" />
        <span>{config.ctaText}</span>
        <ArrowRight className="w-4 h-4 text-[#C5A059]" />
      </button>
    </div>
  );
};
