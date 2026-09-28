import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Eye, MessageSquare, Zap, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, setActiveModal, addToCart } = useStore();

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use default first size & color
    const defaultSize = product.sizes[0] || 'Standard';
    const defaultColor = product.colors[0] || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'Standard';
    const defaultColor = product.colors[0] || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
    setActiveModal('checkout');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `হ্যালো অনলাইন ড্রেস মার্ট! আমি এই পণ্যটি সম্পর্কে জানতে এবং অর্ডার করতে চাই:
পণ্য: ${product.bengaliName || product.name}
মূল্য: ৳${effectivePrice}
পণ্য আইডি: ${product.id}`;
    window.open(`https://wa.me/8801897514604?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div
      onClick={() => {
        setSelectedProduct(product);
        setActiveModal('productDetails');
      }}
      className="group relative flex flex-col rounded-2xl bg-[#12131b] border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(217,119,6,0.18)] overflow-hidden cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative w-full aspect-[4/5] bg-[#1a1c26] overflow-hidden">
        <img
          src={product.images[0] || '/logo.jpg'}
          alt={product.bengaliName || product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black text-[11px] shadow">
              {discountPercent}% ছাড়
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-semibold text-[10px] shadow">
              নতুন
            </span>
          )}
          {product.isPopular && !product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-semibold text-[10px] shadow">
              জনপ্রিয়
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {product.stock > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-stone-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-medium backdrop-blur-sm">
              স্টকে আছে
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-medium backdrop-blur-sm">
              স্টক শেষ
            </span>
          )}
        </div>

        {/* Quick View Hover overlay (desktop) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
          <button
            type="button"
            className="p-2.5 rounded-full bg-stone-900/90 text-amber-300 hover:text-white border border-amber-400/40 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform"
            title="বিস্তারিত দেখুন"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="p-2.5 rounded-full bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform"
            title="WhatsApp এ অর্ডার"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/70">
            {product.category}
          </span>

          {/* Bengali Name */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-100 mt-1 line-clamp-2 group-hover:text-amber-300 transition-colors">
            {product.bengaliName || product.name}
          </h3>

          {/* Size & Color preview */}
          <div className="flex items-center gap-1.5 mt-2 overflow-hidden text-[10px] text-gray-400">
            <span className="shrink-0 text-amber-300/80 font-medium">সাইজ:</span>
            <div className="flex items-center gap-1 truncate">
              {product.sizes.slice(0, 3).map((s, idx) => (
                <span key={idx} className="px-1 py-0.5 bg-[#1a1c26] rounded border border-gray-700/60">
                  {s}
                </span>
              ))}
              {product.sizes.length > 3 && <span>+{product.sizes.length - 3}</span>}
            </div>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3.5 pt-3 border-t border-gray-800/80">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-bold text-amber-300">
              ৳{effectivePrice.toLocaleString('bn-BD')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={product.stock <= 0}
              className="py-2 px-2 rounded-xl bg-[#1b1d29] hover:bg-[#242738] border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>কার্টে নিন</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-bold flex items-center justify-center gap-1 shadow-[0_2px_10px_rgba(217,119,6,0.3)] transition cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>অর্ডার</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
