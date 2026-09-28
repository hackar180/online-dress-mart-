import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { 
  X, ShoppingBag, Zap, MessageSquare, Phone, Check, ShieldCheck, 
  Truck, ArrowRight, ZoomIn 
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart, setActiveModal, products, setSelectedProduct } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0] || 'Standard');
      setQuantity(1);
      setIsZoomed(false);
      setAddedToast(false);
    }
  }, [product]);

  if (!product) return null;

  // 1. Same category recommendations (up to 4)
  const sameCategoryProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // 2. Complementary cross-category matching products
  const getComplementaryCategory = (cat: string) => {
    if (cat === 'শাড়ি' || cat === 'থ্রি-পিস') return ['জুয়েলারি', 'চুড়ি', 'কসমেটিকস'];
    if (cat === 'ছেলেদের পোশাক' || cat === 'টি-শার্ট') return ['গেঞ্জি', 'ছেলেদের পোশাক'];
    if (cat === 'জুয়েলারি' || cat === 'চুড়ি') return ['শাড়ি', 'থ্রি-পিস'];
    if (cat === 'কসমেটিকস') return ['জুয়েলারি', 'চুড়ি'];
    return ['শাড়ি', 'থ্রি-পিস'];
  };

  const matchingCategories = getComplementaryCategory(product.category);
  const matchingProducts = products
    .filter((p) => p.id !== product.id && matchingCategories.includes(p.category))
    .slice(0, 4);

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    setActiveModal('checkout');
  };

  const handleWhatsApp = () => {
    const text = `হ্যালো অনলাইন ড্রেস মার্ট! আমি এই পণ্যটি অর্ডার করতে চাই:
পণ্য: ${product.bengaliName || product.name}
সাইজ: ${selectedSize}
কালার: ${selectedColor}
পরিমাণ: ${quantity}
মূল্য: ৳${(effectivePrice * quantity).toLocaleString('bn-BD')}
পণ্য কোড: ${product.id}`;
    window.open(`https://wa.me/8801897514604?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-[#111219] border border-amber-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] overflow-hidden z-10 text-gray-100 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-gray-300 hover:text-amber-300 border border-amber-500/20 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          
          {/* LEFT: Image Gallery & Zoom */}
          <div className="p-4 sm:p-6 flex flex-col items-center bg-[#0d0e14]">
            {/* Main Image Box */}
            <div
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#181a24] border border-amber-500/20 cursor-crosshair group"
            >
              <img
                src={product.images[activeImageIndex] || product.images[0] || '/logo.jpg'}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                    : undefined
                }
              />

              {/* Floating Zoom indicator */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-stone-950/80 text-amber-300 text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>জুম করার জন্য স্ক্রল বা মাউস রাখুন</span>
              </div>

              {/* Discount Tag */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-xs shadow-md">
                  {discountPercent}% ছাড়
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto w-full pb-1 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.4)] scale-105'
                        : 'border-gray-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="p-5 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category */}
              <span className="text-xs uppercase tracking-wider text-amber-400/80 font-bold">
                {product.category}
              </span>

              {/* Product Titles */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                {product.bengaliName || product.name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>

              {/* Price Row */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                  ৳{effectivePrice.toLocaleString('bn-BD')}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-gray-500 line-through">
                    ৳{product.price.toLocaleString('bn-BD')}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    স্টকে আছে ({product.stock} টি)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                    স্টক শেষ
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#161824] border border-gray-800/80 text-xs sm:text-sm text-gray-300 leading-relaxed">
                {product.description}
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    সাইজ নির্বাচন করুন: <span className="text-amber-300">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          selectedSize === size
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.3)]'
                            : 'bg-[#181a24] text-gray-300 border-gray-700/60 hover:border-amber-400/40'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    কালার নির্বাচন করুন: <span className="text-amber-300">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          selectedColor === color
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                            : 'bg-[#181a24] text-gray-300 border-gray-700/60 hover:border-amber-400/40'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-300">পরিমাণ:</span>
                <div className="flex items-center rounded-xl bg-[#181a24] border border-amber-500/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-amber-300 hover:bg-[#202336] transition cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-white min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="px-3 py-1.5 text-amber-300 hover:bg-[#202336] transition cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  মোট: <strong className="text-amber-300">৳{(effectivePrice * quantity).toLocaleString('bn-BD')}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons & Badges */}
            <div className="mt-6 pt-5 border-t border-gray-800 space-y-3">
              {/* Added Toast */}
              {addedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>পণ্যটি সফলভাবে কার্টে যোগ করা হয়েছে!</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="py-3 px-4 rounded-xl bg-[#1c1e2b] hover:bg-[#25283a] border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(217,119,6,0.35)] transition cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>এখনই অর্ডার করুন</span>
                </button>
              </div>

              {/* Contact Seller / WhatsApp Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp এ অর্ডার</span>
                </button>

                <a
                  href="tel:01897514604"
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>সরাসরি কল: 01897514604</span>
                </a>
              </div>

              {/* Guarantees */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>প্রিমিয়াম কোয়ালিটি নিশ্চিত</span>
                </span>
              </div>
            </div>

          </div>

          {/* SMART RECOMMENDATIONS SECTION */}
          {((sameCategoryProducts && sameCategoryProducts.length > 0) || (matchingProducts && matchingProducts.length > 0)) && (
            <div className="border-t border-amber-500/20 bg-[#0d0e15] p-5 sm:p-6 space-y-6">
              
              {/* 1. More from this category */}
              {sameCategoryProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <span>✨ এই ধরনের আরও {product.category}</span>
                    </h4>
                    <span className="text-[11px] text-gray-400">সরাসরি দেখে অর্ডার করুন</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sameCategoryProducts.map((item) => {
                      const effPrice = item.discountPrice ?? item.price;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedProduct(item);
                            const modal = document.querySelector('.relative.w-full.max-w-4xl');
                            if (modal) modal.scrollTop = 0;
                          }}
                          className="group cursor-pointer rounded-2xl bg-[#141622] border border-gray-800 hover:border-amber-500/40 p-2.5 transition flex flex-col justify-between"
                        >
                          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black/40 mb-2 relative">
                            <img
                              src={item.images[0] || '/logo.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.discountPrice && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-bold text-white">
                                ছাড়
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-300 transition">
                              {item.bengaliName || item.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold text-amber-400 font-mono">
                                ৳{effPrice.toLocaleString('bn-BD')}
                              </span>
                              {item.discountPrice && (
                                <span className="text-[10px] text-gray-500 line-through">
                                  ৳{item.price.toLocaleString('bn-BD')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Complementary Matching Products */}
              {matchingProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <span>💎 এর সাথে মানানসই কালেকশন</span>
                    </h4>
                    <span className="text-[11px] text-gray-400">জনপ্রিয় Matching Products</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {matchingProducts.map((item) => {
                      const effPrice = item.discountPrice ?? item.price;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedProduct(item);
                            const modal = document.querySelector('.relative.w-full.max-w-4xl');
                            if (modal) modal.scrollTop = 0;
                          }}
                          className="group cursor-pointer rounded-2xl bg-[#141622] border border-gray-800 hover:border-amber-500/40 p-2.5 transition flex flex-col justify-between"
                        >
                          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black/40 mb-2 relative">
                            <img
                              src={item.images[0] || '/logo.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-medium">
                              {item.category}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-300 transition">
                              {item.bengaliName || item.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold text-amber-400 font-mono">
                                ৳{effPrice.toLocaleString('bn-BD')}
                              </span>
                              {item.discountPrice && (
                                <span className="text-[10px] text-gray-500 line-through">
                                  ৳{item.price.toLocaleString('bn-BD')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
