import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, MessageSquare } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, setActiveModal } = useStore();

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    onClose();
    setActiveModal('checkout');
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsText = cart
      .map(
        (item, i) =>
          `${i + 1}. ${item.product.bengaliName || item.product.name} (সাইজ: ${item.selectedSize}, কালার: ${item.selectedColor}, পরিমাণ: ${item.quantity}টি, মূল্য: ৳${(item.product.discountPrice ?? item.product.price) * item.quantity})`
      )
      .join('\n');
    const message = `হ্যালো অনলাইন ড্রেস মার্ট! আমি কার্টের এই পণ্যগুলো অর্ডার করতে চাই:\n\n${itemsText}\n\nমোট প্রোডাক্ট বিল: ৳${cartTotal.toLocaleString('bn-BD')}\nদয়া করে অর্ডারটি কনফার্ম করুন।`;
    window.open(`https://wa.me/8801897514604?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0f1017] border-l border-amber-500/25 flex flex-col shadow-2xl text-gray-100">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-[#141520]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-200">শপিং কার্ট</h3>
                <p className="text-xs text-gray-400">{cart.length} টি পণ্য যোগ করা হয়েছে</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#181924] border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-200 text-sm">আপনার কার্ট বর্তমানে খালি</h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  আমাদের এক্সক্লুসিভ শাড়ি, থ্রি-পিস ও ডিজাইনার ড্রেস কালেকশন থেকে পছন্দমতো পণ্য বেছে নিন।
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold transition cursor-pointer"
                >
                  পোশাক ব্রাউজ করুন
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.product.discountPrice ?? item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-3 p-3 rounded-2xl bg-[#141622] border border-amber-500/20 relative group"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.product.images[0] || '/logo.jpg'}
                      alt={item.product.name}
                      className="w-18 h-22 rounded-xl object-cover border border-gray-800 shrink-0"
                    />

                    {/* Item Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-100 truncate">
                          {item.product.bengaliName || item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                          <span className="px-1.5 py-0.5 rounded bg-[#1c1e2b] border border-gray-700/50">
                            সাইজ: {item.selectedSize}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#1c1e2b] border border-gray-700/50">
                            কালার: {item.selectedColor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs sm:text-sm font-bold text-amber-300">
                          ৳{(price * item.quantity).toLocaleString('bn-BD')}
                        </span>

                        {/* Stepper */}
                        <div className="flex items-center rounded-lg bg-[#1a1c2a] border border-gray-700/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:bg-[#25283a] text-gray-300 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity + 1
                              )
                            }
                            className="p-1 hover:bg-[#25283a] text-gray-300 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                      }
                      className="absolute top-2.5 right-2.5 p-1 text-gray-500 hover:text-rose-400 transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-800 bg-[#12131c] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">সাবটোটাল:</span>
                <span className="text-lg font-bold text-amber-300">
                  ৳{cartTotal.toLocaleString('bn-BD')}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                * ডেলিভারি চার্জ চেকআউটে ঠিকানা অনুযায়ী যুক্ত হবে (ঢাকার ভেতরে ৳৭০, ঢাকার বাইরে ৳১৩০)।
              </p>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(217,119,6,0.35)] transition cursor-pointer"
              >
                <span>অর্ডার করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* WhatsApp Checkout */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp-এ সরাসরি অর্ডার পাঠান</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
