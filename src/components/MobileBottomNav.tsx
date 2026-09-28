import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MessageSquare, ShoppingBag, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, currentUser, setActiveModal } = useStore();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0d0e14]/95 backdrop-blur-lg border-t border-amber-500/25 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.8)] pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        
        {/* 1. Call Button */}
        <a
          href="tel:01897514604"
          className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-amber-400 active:text-amber-400 transition cursor-pointer select-none"
          title="কল করুন"
        >
          <div className="p-1 rounded-full bg-amber-500/10 text-amber-300">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight text-amber-200/90 whitespace-nowrap">
            কল করুন
          </span>
        </a>

        {/* 2. WhatsApp Button */}
        <a
          href="https://wa.me/8801897514604"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-emerald-400 active:text-emerald-400 transition cursor-pointer select-none"
          title="WhatsApp"
        >
          <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight text-emerald-300/90 whitespace-nowrap">
            WhatsApp
          </span>
        </a>

        {/* 3. Facebook Button */}
        <a
          href="https://www.facebook.com/profile.php?id=61565221242728"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-blue-400 active:text-blue-400 transition cursor-pointer select-none"
          title="Facebook"
        >
          <div className="p-1 rounded-full bg-blue-500/10 text-blue-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight text-blue-300/90 whitespace-nowrap">
            Facebook
          </span>
        </a>

        {/* 4. Cart Button */}
        <button
          type="button"
          onClick={() => setActiveModal('cart')}
          className="relative flex flex-col items-center justify-center h-full text-gray-300 hover:text-amber-400 active:text-amber-400 transition cursor-pointer select-none"
        >
          <div className="relative p-1 rounded-full bg-amber-500/10 text-amber-300">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 min-w-[16px] h-4 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight text-amber-200/90 whitespace-nowrap">
            কার্ট
          </span>
        </button>

        {/* 5. Account / Login */}
        <button
          type="button"
          onClick={() => {
            if (currentUser) {
              setActiveModal('userProfile');
            } else {
              setActiveModal('login');
            }
          }}
          className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-amber-400 active:text-amber-400 transition cursor-pointer select-none"
        >
          <div className="p-1 rounded-full bg-amber-500/10 text-amber-300">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="User"
                className="w-4 h-4 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight text-amber-200/90 truncate max-w-[60px] text-center">
            {currentUser ? 'প্রোফাইল' : 'লগইন'}
          </span>
        </button>

      </div>
    </nav>
  );
};
