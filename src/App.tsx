import React, { useState, useMemo } from 'react';
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
  Tag, AlertCircle, ShoppingBag, Check, X, RotateCcw, Star, ChevronDown, Layers
} from 'lucide-react';

// Natural Language Smart Search Parser
function parseSmartSearch(query: string, availableCategories: string[]) {
  const q = query.trim().toLowerCase();
  if (!q) return { cleanTokens: [] };

  let extractedCategory: string | undefined;
  let extractedColor: string | undefined;
  let maxPrice: number | undefined;
  let discountOnly = false;

  // Convert Bengali numerals to English numerals
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const convertedQuery = q.replace(/[০-৯]/g, (w) => bengaliDigits.indexOf(w).toString());

  // Price detection (e.g. "১০০০ টাকার মধ্যে", "1000 tk", "৫০০ টাকার নিচে", "২০০০ এর মধ্যে")
  const maxPriceMatch = convertedQuery.match(/(\d+)\s*(?:টাকা|টাকার|tk|taka)?\s*(?:মধ্যে|নিচে|পর্যন্ত|under|below|max)/);
  if (maxPriceMatch) {
    maxPrice = parseInt(maxPriceMatch[1], 10);
  } else if (convertedQuery.includes('কম দাম') || convertedQuery.includes('cheap') || convertedQuery.includes('কম দামের')) {
    discountOnly = true;
  }

  // Category detection from query
  for (const cat of availableCategories) {
    if (cat !== 'সকল') {
      const catLower = cat.toLowerCase();
      if (convertedQuery.includes(catLower)) {
        extractedCategory = cat;
        break;
      }
      if (cat === 'ছেলেদের পোশাক' && (convertedQuery.includes('ছেলেদের') || convertedQuery.includes('পাঞ্জাবি'))) {
        extractedCategory = cat;
        break;
      }
    }
  }

  // Color keywords
  const colorMap: Record<string, string> = {
    'লাল': 'লাল',
    'কালো': 'কালো',
    'সাদা': 'সাদা',
    'নীল': 'নীল',
    'সবুজ': 'সবুজ',
    'মেরুন': 'মেরুন',
    'গোলাপি': 'গোলাপি',
    'পিংক': 'গোলাপি',
    'গোল্ডেন': 'গোল্ডেন',
    'হলুদ': 'হলুদ',
    'অ্যাশ': 'অ্যাশ',
  };

  for (const [key, val] of Object.entries(colorMap)) {
    if (convertedQuery.includes(key)) {
      extractedColor = val;
      break;
    }
  }

  const stopWords = ['টাকার', 'মধ্যে', 'নিচে', 'জন্য', 'সুন্দর', 'এর', 'টি', 'একটি', 'কম', 'দামের', 'দের', 'আন্ডার', 'under'];
  const words = convertedQuery
    .split(/\s+/)
    .filter((w) => w && !stopWords.includes(w) && !w.match(/^\d+$/));

  return {
    extractedCategory,
    extractedColor,
    maxPrice,
    discountOnly,
    cleanTokens: words,
  };
}

const MainStoreContent: React.FC = () => {
  const {
    products,
    categories: dbCategories,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    activeModal,
    setActiveModal,
    announcements,
  } = useStore();

  // Smart Sort options
  type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'discount' | 'rating' | 'bestselling';
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Advanced Multi-Filter State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 10000]);
  const [filterSelectedColors, setFilterSelectedColors] = useState<string[]>([]);
  const [filterSelectedSizes, setFilterSelectedSizes] = useState<string[]>([]);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState<number>(0);

  // Active Category names list from DB (starting with 'সকল')
  const categoriesList = useMemo(() => {
    const activeFromDb = dbCategories.filter((c) => c.isActive !== false).map((c) => c.name);
    return ['সকল', ...activeFromDb];
  }, [dbCategories]);

  // Current selected Category Item from DB (for subcategories)
  const currentCategoryObj = useMemo(() => {
    return dbCategories.find((c) => c.name === selectedCategory);
  }, [dbCategories, selectedCategory]);

  // Unique Colors & Sizes available in products for filters
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => (p.colors || []).forEach((c) => colors.add(c.trim())));
    return Array.from(colors).filter(Boolean).slice(0, 12);
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => (p.sizes || []).forEach((s) => sizes.add(s.trim())));
    return Array.from(sizes).filter(Boolean).slice(0, 10);
  }, [products]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'সকল') count++;
    if (selectedSubCategory) count++;
    if (filterPriceRange[0] > 0 || filterPriceRange[1] < 10000) count++;
    if (filterSelectedColors.length > 0) count += filterSelectedColors.length;
    if (filterSelectedSizes.length > 0) count += filterSelectedSizes.length;
    if (filterDiscountOnly) count++;
    if (filterInStockOnly) count++;
    if (filterMinRating > 0) count++;
    return count;
  }, [selectedCategory, selectedSubCategory, filterPriceRange, filterSelectedColors, filterSelectedSizes, filterDiscountOnly, filterInStockOnly, filterMinRating]);

  // Reset Filters
  const resetAllFilters = () => {
    setSelectedCategory('সকল');
    setSelectedSubCategory(null);
    setFilterPriceRange([0, 10000]);
    setFilterSelectedColors([]);
    setFilterSelectedSizes([]);
    setFilterDiscountOnly(false);
    setFilterInStockOnly(false);
    setFilterMinRating(0);
    setSearchQuery('');
  };

  // Smart Search parsing
  const smartParsed = useMemo(() => {
    return parseSmartSearch(searchQuery, categoriesList);
  }, [searchQuery, categoriesList]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const effPrice = prod.discountPrice ?? prod.price;

      // 1. Category Matching (direct or via smart search)
      const effectiveCategory = selectedCategory !== 'সকল' 
        ? selectedCategory 
        : (smartParsed.extractedCategory || 'সকল');

      if (effectiveCategory !== 'সকল') {
        if (!prod.category || prod.category.trim() !== effectiveCategory.trim()) {
          return false;
        }
      }

      // 2. Sub-Category Matching
      if (selectedSubCategory) {
        if (!prod.subCategory || prod.subCategory.trim() !== selectedSubCategory.trim()) {
          return false;
        }
      }

      // 3. Price Filter (range & smart search max price)
      if (effPrice < filterPriceRange[0] || effPrice > filterPriceRange[1]) {
        return false;
      }
      if (smartParsed.maxPrice && effPrice > smartParsed.maxPrice) {
        return false;
      }

      // 4. Color Filter
      if (filterSelectedColors.length > 0) {
        const matchesColor = prod.colors?.some((c) =>
          filterSelectedColors.some((fc) => c.toLowerCase().includes(fc.toLowerCase()) || fc.toLowerCase().includes(c.toLowerCase()))
        );
        if (!matchesColor) return false;
      }
      if (smartParsed.extractedColor) {
        const cTarget = smartParsed.extractedColor.toLowerCase();
        const hasColor = prod.colors?.some((c) => c.toLowerCase().includes(cTarget)) ||
                         prod.name.toLowerCase().includes(cTarget) ||
                         prod.bengaliName.toLowerCase().includes(cTarget) ||
                         (prod.tags && prod.tags.some((t) => t.toLowerCase().includes(cTarget)));
        if (!hasColor) return false;
      }

      // 5. Size Filter
      if (filterSelectedSizes.length > 0) {
        const matchesSize = prod.sizes?.some((s) =>
          filterSelectedSizes.some((fs) => s.toLowerCase().includes(fs.toLowerCase()))
        );
        if (!matchesSize) return false;
      }

      // 6. Discount Only
      if (filterDiscountOnly || smartParsed.discountOnly) {
        if (!prod.discountPrice || prod.discountPrice >= prod.price) {
          return false;
        }
      }

      // 7. In-Stock Only
      if (filterInStockOnly) {
        if (prod.stock <= 0 || prod.status === 'Out of Stock') {
          return false;
        }
      }

      // 8. Rating Filter
      if (filterMinRating > 0) {
        if ((prod.rating ?? 4.5) < filterMinRating) {
          return false;
        }
      }

      // 9. Free-text tokens matching (name, bengaliName, description, tags, category, subCategory)
      if (smartParsed.cleanTokens.length > 0) {
        const searchableStr = `${prod.name} ${prod.bengaliName} ${prod.description} ${prod.category} ${prod.subCategory || ''} ${(prod.tags || []).join(' ')} ${(prod.colors || []).join(' ')}`.toLowerCase();
        const matchesAll = smartParsed.cleanTokens.some((tok) => searchableStr.includes(tok));
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedSubCategory, smartParsed, filterPriceRange, filterSelectedColors, filterSelectedSizes, filterDiscountOnly, filterInStockOnly, filterMinRating]);

  // Sorting products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'discount') {
        const discountA = a.discountPrice ? (a.price - a.discountPrice) : 0;
        const discountB = b.discountPrice ? (b.price - b.discountPrice) : 0;
        return discountB - discountA;
      }
      if (sortBy === 'rating') {
        return (b.rating ?? 4.5) - (a.rating ?? 4.5);
      }
      if (sortBy === 'bestselling') {
        return (b.salesCount ?? 0) - (a.salesCount ?? 0);
      }
      // default: popular
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [filteredProducts, sortBy]);

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
        
        {/* Section Heading & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের বিশেষ পোশাক সম্ভার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <span>
                {selectedCategory === 'সকল' || selectedCategory === 'সকল (All)' ? 'এক্সক্লুসিভ কালেকশন' : `${selectedCategory} কালেকশন`}
              </span>
              {selectedSubCategory && (
                <span className="text-sm font-normal text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {selectedSubCategory}
                </span>
              )}
            </h2>
          </div>

          {/* Sort & Advanced Filter Trigger Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 self-start md:self-auto no-scrollbar">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.35)]'
                  : 'bg-[#141622] text-gray-300 border-amber-500/20 hover:border-amber-400/50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ফিল্টার</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-stone-950 text-amber-300">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Smart Sort Select */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141622] border border-amber-500/20 text-xs text-gray-300 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>সাজান:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-[#141622] text-white">জনপ্রিয়তা</option>
                <option value="newest" className="bg-[#141622] text-white">নতুন আগমন</option>
                <option value="bestselling" className="bg-[#141622] text-white">বেস্ট সেলিং</option>
                <option value="discount" className="bg-[#141622] text-white">সর্বোচ্চ ছাড়</option>
                <option value="rating" className="bg-[#141622] text-white">টপ রেটিং</option>
                <option value="price-low" className="bg-[#141622] text-white">মূল্য: কম থেকে বেশি</option>
                <option value="price-high" className="bg-[#141622] text-white">মূল্য: বেশি থেকে কম</option>
              </select>
            </div>

            <span className="text-xs text-gray-400 hidden sm:inline whitespace-nowrap">
              মোট: <strong className="text-amber-300">{sortedProducts.length}</strong> টি
            </span>
          </div>
        </div>

        {/* 1. Category Filter Pills (Scrollable horizontally on mobile with smooth swipe & shrink-0) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar touch-pan-x scroll-smooth">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat || (cat === 'সকল' && selectedCategory === 'সকল (All)');
            const count = cat === 'সকল'
              ? products.length
              : products.filter((p) => p.category && p.category.trim() === cat.trim()).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory(null);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 font-bold shadow-[0_2px_15px_rgba(217,119,6,0.35)] scale-[1.02]'
                    : 'bg-[#141622] text-gray-300 border border-gray-800/90 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <span>{cat}</span>
                {count > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-stone-950/80 text-amber-300'
                        : 'bg-[#1c1f2e] text-gray-400 border border-gray-700/60'
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500">(০)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Sub-Category Strip (Visible when a category with sub-categories is selected) */}
        {selectedCategory !== 'সকল' && currentCategoryObj && currentCategoryObj.subCategories && currentCategoryObj.subCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 mb-4 no-scrollbar touch-pan-x border-b border-gray-800/60">
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Layers className="w-3 h-3" />
              <span>সাব-ক্যাটাগরি:</span>
            </span>

            {/* "All" sub-category pill */}
            <button
              type="button"
              onClick={() => setSelectedSubCategory(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedSubCategory === null
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                  : 'bg-[#12141e] text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              সব {selectedCategory}
            </button>

            {/* Specific sub-categories */}
            {currentCategoryObj.subCategories.map((sub) => {
              const subCount = products.filter(
                (p) => p.category === selectedCategory && p.subCategory && p.subCategory.trim() === sub.trim()
              ).length;
              const isSubActive = selectedSubCategory === sub;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(isSubActive ? null : sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSubActive
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                      : 'bg-[#12141e] text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <span>{sub}</span>
                  {subCount > 0 && (
                    <span className="text-[10px] text-gray-500 font-mono">({subCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Advanced Multi-Filter Expandable Panel */}
        {isFilterPanelOpen && (
          <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-[#12141f] border border-amber-500/30 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-white">অ্যাডভান্সড ফিল্টার অপশন</h4>
              </div>
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার মুছুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Filter 1: Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">
                  মূল্য সীমা (৳{filterPriceRange[0].toLocaleString('bn-BD')} — ৳{filterPriceRange[1].toLocaleString('bn-BD')})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={filterPriceRange[1]}
                    value={filterPriceRange[0]}
                    onChange={(e) => setFilterPriceRange([Number(e.target.value) || 0, filterPriceRange[1]])}
                    placeholder="সর্বনিম্ন"
                    className="w-1/2 bg-[#1b1d2c] border border-gray-700 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    min={filterPriceRange[0]}
                    max={15000}
                    value={filterPriceRange[1]}
                    onChange={(e) => setFilterPriceRange([filterPriceRange[0], Number(e.target.value) || 10000])}
                    placeholder="সর্বোচ্চ"
                    className="w-1/2 bg-[#1b1d2c] border border-gray-700 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[1000, 2000, 3000, 5000].map((quickMax) => (
                    <button
                      key={quickMax}
                      type="button"
                      onClick={() => setFilterPriceRange([0, quickMax])}
                      className="px-2 py-0.5 rounded-lg bg-[#181a28] hover:bg-amber-500/20 text-[10px] text-gray-300 hover:text-amber-300 border border-gray-800"
                    >
                      ৳{quickMax} এর মধ্যে
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Colors */}
              {availableColors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">রঙ / কালার নির্বাচন করুন</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {availableColors.map((clr) => {
                      const isClrActive = filterSelectedColors.includes(clr);
                      return (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => {
                            if (isClrActive) {
                              setFilterSelectedColors(filterSelectedColors.filter((c) => c !== clr));
                            } else {
                              setFilterSelectedColors([...filterSelectedColors, clr]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                            isClrActive
                              ? 'bg-amber-500 text-stone-950 font-bold shadow'
                              : 'bg-[#1b1d2c] text-gray-300 border border-gray-700/80 hover:border-amber-500/40'
                          }`}
                        >
                          {clr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter 3: Sizes & Status Switches */}
              <div className="space-y-3">
                {availableSizes.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">সাইজ</label>
                    <div className="flex flex-wrap gap-1">
                      {availableSizes.map((sz) => {
                        const isSzActive = filterSelectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              if (isSzActive) {
                                setFilterSelectedSizes(filterSelectedSizes.filter((s) => s !== sz));
                              } else {
                                setFilterSelectedSizes([...filterSelectedSizes, sz]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition cursor-pointer ${
                              isSzActive
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-[#1b1d2c] text-gray-300 border border-gray-700'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={filterDiscountOnly}
                      onChange={(e) => setFilterDiscountOnly(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <span>শুধুমাত্র ছাড়যুক্ত পণ্য</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={filterInStockOnly}
                      onChange={(e) => setFilterInStockOnly(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <span>স্টকে আছে</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. Active Search Query / Filters status bar */}
        {(searchQuery || activeFiltersCount > 0) && (
          <div className="mb-6 p-3 rounded-2xl bg-[#141622] border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="flex items-center gap-1 bg-[#1a1c2c] px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <span>অনুসন্ধান: "<strong>{searchQuery}</strong>"</span>
                  {smartParsed.extractedCategory && (
                    <span className="text-[10px] text-amber-300">[{smartParsed.extractedCategory}]</span>
                  )}
                  {smartParsed.maxPrice && (
                    <span className="text-[10px] text-amber-300">[সর্বোচ্চ ৳{smartParsed.maxPrice}]</span>
                  )}
                </span>
              )}
              {selectedSubCategory && (
                <span className="bg-[#1a1c2c] px-2 py-0.5 rounded-lg border border-amber-500/20 text-amber-300">
                  সাব-ক্যাটাগরি: {selectedSubCategory}
                </span>
              )}
              <span className="text-gray-400">
                (মোট {sortedProducts.length} টি পণ্য পাওয়া গেছে)
              </span>
            </div>

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
            >
              সব রিসেট করুন
            </button>
          </div>
        )}

        {/* 5. Product Grid / Dynamic Empty State */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#10121a] rounded-3xl border border-gray-800 p-6">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">
              {selectedCategory !== 'সকল' 
                ? 'এই Category-তে এখনো কোনো Product নেই' 
                : 'কোনো পোশাক পাওয়া যায়নি'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {selectedCategory !== 'সকল'
                ? `বর্তমানে "${selectedCategory}" ক্যাটাগরিতে কোনো সক্রিয় পণ্য তালিকাভুক্ত নেই। অনুগ্রহ করে অন্য ক্যাটাগরি দেখুন।`
                : 'আপনার ফিল্টার বা সার্চ কিওয়ার্ডের সাথে মেলে এমন কোনো পোশাক বর্তমানে পাওয়া যায়নি।'}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 font-bold text-xs cursor-pointer shadow-lg"
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
