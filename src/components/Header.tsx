import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Menu, X, Search, ShoppingBag, User as UserIcon, Phone, 
  MessageSquare, ShieldCheck, Heart, Sparkles, Tag, HelpCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    currentUser, 
    isAdminLoggedIn, 
    setActiveModal, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory 
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const categories = [
    'সকল (All)',
    'থ্রি-পিস (Three Piece)',
    'শাড়ি (Saree)',
    'জামা ও কুর্তি (Kameez & Kurti)',
    'লেহেঙ্গা (Lehenga)',
    'গাউন (Gown)',
    'পাঞ্জাবি (Panjabi)',
    'বোরকা ও হিজাব (Abaya & Borka)',
    'অন্যান্য পোশাক (Other Dresses)',
    'এক্সক্লুসিভ পার্টি ড্রেস (Party Dress)'
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0d0e14]/95 backdrop-blur-md border-b border-amber-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        {/* Top Announcement & Quick Contact Strip (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center justify-between px-4 lg:px-8 py-1.5 bg-gradient-to-r from-[#14151f] via-[#1c1d2b] to-[#14151f] border-b border-amber-500/10 text-[12px] text-amber-200/90 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>✨ অনলাইন ড্রেস মার্ট | প্রিমিয়াম ফ্যাশন ও দ্রুত ক্যাশ অন ডেলিভারি</span>
          </div>

          <div className="flex items-center gap-5">
            <a 
              href="tel:01897514604" 
              className="flex items-center gap-1.5 hover:text-amber-400 transition"
              title="Call Now"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>01897514604</span>
            </a>
            <a 
              href="https://wa.me/8801897514604" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-emerald-400 transition"
              title="WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp অর্ডার</span>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61565221242728" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-blue-400 transition"
              title="Facebook Page"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>
            <button
              onClick={() => setActiveModal('complaintBox')}
              className="hover:text-amber-400 transition flex items-center gap-1 text-gray-300 hover:text-amber-300"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400/80" />
              <span>অভিযোগ বক্স</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* LEFT (Mobile): Hamburger Menu */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 text-amber-300 hover:text-white rounded-lg focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* BRANDING: Logo + Brand Name (Responsive & Never Overlapping) */}
            <div 
              onClick={() => {
                setSelectedCategory('সকল (All)');
                setActiveModal('none');
              }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            >
              {/* Official Logo (Original design, shape, proportions intact) */}
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-amber-400/30 blur-sm group-hover:bg-amber-400/50 transition" />
                <img
                  src="/logo.jpg"
                  alt="Online Dress Mart Official Logo"
                  className="relative w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border border-amber-400/50 shadow-md group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Brand Name Text: Scaled carefully for 320px, 360px, 412px, desktop */}
              <div className="flex flex-col justify-center">
                <span className="font-brand font-bold tracking-wider text-xs xs:text-sm sm:text-lg md:text-xl text-amber-200 group-hover:text-amber-100 transition whitespace-nowrap leading-tight">
                  ONLINE DRESS MART
                </span>
                <span className="text-[9px] xs:text-[10px] sm:text-xs text-amber-400/80 font-medium tracking-widest hidden xs:block uppercase">
                  Curated Fashion
                </span>
              </div>
            </div>

            {/* DESKTOP SEARCH BAR */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="শাড়ি, থ্রি-পিস, লেহেঙ্গা বা ড্রেস খুঁজুন..."
                  className="w-full bg-[#141620] border border-amber-500/25 focus:border-amber-400 rounded-full pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition shadow-inner"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                  >
                    মুছুন
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT ICONS & ACTIONS */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="lg:hidden p-2 text-gray-300 hover:text-amber-300 transition rounded-full"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-amber-300" />
              </button>

              {/* Call Button (Desktop quick action) */}
              <a
                href="tel:01897514604"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>01897514604</span>
              </a>

              {/* Admin Button / Badge */}
              <button
                type="button"
                onClick={() => setActiveModal('adminPanel')}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  isAdminLoggedIn
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.4)]'
                    : 'bg-[#151722] border-gray-700/60 text-gray-400 hover:text-amber-300 hover:border-amber-500/40'
                }`}
                title="Admin Panel"
              >
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* User Account / Login Button */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    setActiveModal('userProfile');
                  } else {
                    setActiveModal('login');
                  }
                }}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full bg-[#151722] border border-amber-500/20 hover:border-amber-400/50 text-amber-300 text-xs font-medium transition cursor-pointer"
                title={currentUser ? currentUser.name : 'Customer Login'}
              >
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-amber-400/60"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden md:inline max-w-[90px] truncate text-gray-200">
                  {currentUser ? currentUser.name.split(' ')[0] : 'লগইন'}
                </span>
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => setActiveModal('cart')}
                className="relative flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-[0_4px_15px_rgba(217,119,6,0.3)] transition cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">কার্ট</span>
                {cartCount > 0 && (
                  <span className="min-w-5 h-5 px-1 bg-stone-950 text-amber-300 text-[11px] font-extrabold rounded-full flex items-center justify-center border border-amber-400">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* MOBILE SEARCH EXPANDABLE BAR */}
          {showSearchInput && (
            <div className="lg:hidden pb-3 pt-1">
              <div className="relative w-full">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="শাড়ি, থ্রি-পিস, গাউন বা ড্রেস খুঁজুন..."
                  className="w-full bg-[#151722] border border-amber-500/40 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DESKTOP CATEGORY NAVIGATION STRIP */}
          <nav className="hidden lg:flex items-center justify-center space-x-1 py-2 border-t border-amber-500/15 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(217,119,6,0.25)]'
                    : 'text-gray-300 hover:text-amber-200 hover:bg-[#1a1c28]'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-[#0f1017] border-r border-amber-500/25 h-full overflow-y-auto flex flex-col p-5 shadow-2xl z-10 text-gray-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.jpg"
                  alt="Online Dress Mart Logo"
                  className="w-10 h-10 rounded-full border border-amber-400/50"
                />
                <div>
                  <h3 className="font-brand font-bold text-sm text-amber-200">
                    ONLINE DRESS MART
                  </h3>
                  <p className="text-[10px] text-amber-400/70">Curated Fashion</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <a
                href="tel:01897514604"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সরাসরি কল</span>
              </a>
              <a
                href="https://wa.me/8801897514604"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Categories */}
            <div className="py-2">
              <span className="text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold px-2 mb-2 block">
                পোশাক ক্যাটাগরি
              </span>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'text-gray-300 hover:bg-[#181924]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Important Links */}
            <div className="pt-4 border-t border-gray-800 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal(currentUser ? 'userProfile' : 'login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-[#181924]"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>{currentUser ? 'আমার প্রোফাইল ও অর্ডার' : 'লগইন / রেজিস্ট্রেশন'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('complaintBox');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-[#181924]"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>অভিযোগ ও সাপোর্ট বক্স</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('adminPanel');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-[#181924]"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </button>
            </div>

            {/* Facebook & Footer in Drawer */}
            <div className="mt-auto pt-6 border-t border-gray-800 text-center">
              <a
                href="https://www.facebook.com/profile.php?id=61565221242728"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-300 text-xs font-medium"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>আমাদের Facebook পেইজ</span>
              </a>
              <p className="text-[10px] text-gray-500 mt-3">
                কল করুন: 01897514604
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
