import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { PullStringLampLogin } from './components/PullStringLampLogin';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ComplaintBoxModal } from './components/ComplaintBoxModal';
import { AdminPanel } from './components/AdminPanel';
import { AIChatSupport } from './components/AIChatSupport';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { 
  Sparkles, SlidersHorizontal, ArrowUpDown, Filter, 
  Tag, AlertCircle, ShoppingBag, Check 
} from 'lucide-react';

const MainStoreContent: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    activeModal,
    setActiveModal,
    announcements,
  } = useStore();

  // Sorting: 'popular' | 'newest' | 'price-low' | 'price-high'
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');

  // Categories list
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

  // Filtering products
  const filteredProducts = products.filter((prod) => {
    // Category match
    const categoryMatch =
      selectedCategory === 'সকল (All)' || prod.category === selectedCategory;

    // Search match
    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      prod.name.toLowerCase().includes(query) ||
      prod.bengaliName.toLowerCase().includes(query) ||
      prod.description.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice ?? a.price;
    const priceB = b.discountPrice ?? b.price;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // popular default
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  // Active Announcements
  const activeAnnouncements = announcements.filter((a) => a.isActive);

  return (
    <div className="min-h-screen bg-[#08090c] text-[#f1f3f7] flex flex-col font-body selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. Header (Responsive for 320px, 360px, 390px, 412px, desktop) */}
      <Header />

      {/* 2. Top Announcement Ticker if present */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border-b border-amber-500/25 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold">{activeAnnouncements[0].badge}:</span>
          <span className="truncate">{activeAnnouncements[0].title} — {activeAnnouncements[0].content}</span>
        </div>
      )}

      {/* 3. Hero Section */}
      <HeroSection />

      {/* 4. Products Section */}
      <main id="products-section" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Heading & Category Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের বিশেষ পোশাক সম্ভার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {selectedCategory === 'সকল (All)' ? 'এক্সক্লুসিভ ড্রেস কালেকশন' : selectedCategory}
            </h2>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141622] border border-amber-500/20 text-xs text-gray-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>সাজান:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-[#141622] text-white">জনপ্রিয়তা</option>
                <option value="newest" className="bg-[#141622] text-white">নতুন আগমন</option>
                <option value="price-low" className="bg-[#141622] text-white">মূল্য: কম থেকে বেশি</option>
                <option value="price-high" className="bg-[#141622] text-white">মূল্য: বেশি থেকে কম</option>
              </select>
            </div>

            <span className="text-xs text-gray-400 hidden sm:inline">
              মোট: <strong className="text-amber-300">{sortedProducts.length}</strong> টি
            </span>
          </div>
        </div>

        {/* Category Filter Pills (Scrollable horizontally on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-[0_0_12px_rgba(217,119,6,0.35)]'
                  : 'bg-[#141622] text-gray-300 border border-gray-800 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search status query bar if search is active */}
        {searchQuery && (
          <div className="mb-6 p-3 rounded-2xl bg-[#141622] border border-amber-500/30 flex items-center justify-between text-xs text-gray-300">
            <span>
              "<strong>{searchQuery}</strong>" দিয়ে অনুসন্ধান ফলাফল ({sortedProducts.length} টি পাওয়া গেছে)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-400 hover:underline font-semibold"
            >
              অনুসন্ধান মুছুন
            </button>
          </div>
        )}

        {/* Product Grid (Responsive: 1 col on 320px, 2 cols on 360px-480px, 3 on tablet, 4 on desktop) */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#10121a] rounded-3xl border border-gray-800 p-6">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো পোশাক পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              আপনার নির্বাচিত ক্যাটাগরি বা সার্চ কিওয়ার্ডের সাথে মেলে এমন কোনো পোশাক বর্তমানে পাওয়া যায়নি।
            </p>
            <button
              onClick={() => {
                setSelectedCategory('সকল (All)');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
            >
              সকল পোশাক দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Guarantee Banner Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121420] via-[#1a1c2c] to-[#121420] border border-amber-500/25 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">১০০% অরিজিনাল কোয়ালিটি</h4>
              <p className="text-xs text-gray-400">প্রতিটি ড্রেস নিখুঁত ফিনিশিং ও প্রিমিয়াম ফেব্রিকে তৈরি।</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start border-t md:border-t-0 md:border-x border-gray-800 pt-4 md:pt-0 md:px-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-gray-400">ডেলিভারিম্যানের কাছ থেকে পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">৭ দিনের সহজ রিটার্ন</h4>
              <p className="text-xs text-gray-400">সাইজ বা কোয়ালিটিতে কোনো ত্রুটি থাকলে ঝামেলাহীন এক্সচেঞ্জ।</p>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Mobile Bottom Navigation (Visible on mobile screens) */}
      <MobileBottomNav />

      {/* 7. AI Customer Support floating button & window */}
      <AIChatSupport />

      {/* 8. MODALS & DRAWERS */}
      
      {/* Exact Pull String Lamp Login Modal */}
      <PullStringLampLogin
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal('none')}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          if (activeModal === 'productDetails') {
            setActiveModal('none');
          }
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={activeModal === 'cart'}
        onClose={() => setActiveModal('none')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={activeModal === 'checkout'}
        onClose={() => setActiveModal('none')}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        isOpen={activeModal === 'orderConfirmation'}
        onClose={() => setActiveModal('none')}
      />

      {/* Customer Profile & Order History Modal */}
      <UserProfileModal
        isOpen={activeModal === 'userProfile'}
        onClose={() => setActiveModal('none')}
      />

      {/* Complaint / Customer Support Box */}
      <ComplaintBoxModal
        isOpen={activeModal === 'complaintBox'}
        onClose={() => setActiveModal('none')}
      />

      {/* Admin Panel */}
      <AdminPanel
        isOpen={activeModal === 'adminPanel'}
        onClose={() => setActiveModal('none')}
      />

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}
