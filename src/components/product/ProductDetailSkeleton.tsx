import React from 'react';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-28 bg-[#EAE3D2] rounded mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column Skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-[#EAE3D2]/70 border border-[#EAE3D2]"></div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-20 h-24 rounded-xl bg-[#EAE3D2]/50 shrink-0"></div>
            ))}
          </div>
        </div>

        {/* Product Details Column Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-[#EAE3D2] rounded"></div>
            <div className="h-8 w-4/5 bg-[#EAE3D2] rounded"></div>
            <div className="h-5 w-36 bg-[#EAE3D2] rounded"></div>
          </div>

          {/* Pricing Box Skeleton */}
          <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#EAE3D2] space-y-2">
            <div className="h-7 w-32 bg-[#EAE3D2] rounded"></div>
            <div className="h-3 w-48 bg-[#EAE3D2] rounded"></div>
          </div>

          {/* Sizes Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#EAE3D2] rounded"></div>
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 rounded-xl bg-[#EAE3D2]"></div>
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-3">
            <div className="flex-1 h-14 rounded-2xl bg-[#EAE3D2]"></div>
            <div className="flex-1 h-14 rounded-2xl bg-[#EAE3D2]"></div>
          </div>

          {/* Pincode Box Skeleton */}
          <div className="h-24 rounded-2xl bg-[#EAE3D2]/50 border border-[#EAE3D2]"></div>

          {/* Accordions Skeleton */}
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-[#EAE3D2]/60"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Carousel Skeleton */}
      <div className="mt-16 pt-10 border-t border-[#EAE3D2] space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-[#EAE3D2] rounded"></div>
          <div className="h-4 w-20 bg-[#EAE3D2] rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-[3/5] rounded-2xl bg-[#EAE3D2]/60"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
