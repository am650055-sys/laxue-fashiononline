import React from 'react';
import { Home, Grid, PackageCheck, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, navigate } = useShop();

  // Hide on admin view
  if (currentView.startsWith('admin')) return null;

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, view: 'home' },
    { id: 'categories', label: 'CATEGORY', icon: Grid, view: 'categories' },
    { id: 'orders', label: 'ORDER', icon: PackageCheck, view: 'orders' },
    { id: 'profile', label: 'PROFILE', icon: User, view: 'profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#3B0C13] border-t border-[#D4AF37]/40 shadow-2xl md:hidden px-2 py-2">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.view)}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-[#DFBA67]' : 'text-[#A8988B] hover:text-white'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#5B121E] border border-[#D4AF37]/50 shadow-xs' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#DFBA67]' : 'text-[#A8988B]'}`} />
              </div>
              <span
                className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${
                  isActive ? 'text-[#DFBA67]' : 'text-[#A8988B]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
