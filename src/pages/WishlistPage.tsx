import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';

export const WishlistPage: React.FC = () => {
  const { wishlist, products } = useShop();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      <div className="border-b border-[#EAE3D2] pb-4 mb-6">
        <h1 className="font-serif-luxury text-2xl font-bold text-[#3B0C13]">
          MY WISHLIST ({wishlistedProducts.length})
        </h1>
        <p className="text-xs text-[#7A695C]">
          Your saved favorite Kurtis & ethnic outfits.
        </p>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState type="empty-wishlist" />
      )}
    </div>
  );
};
