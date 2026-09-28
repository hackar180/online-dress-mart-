import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, Truck, ShieldCheck, MapPin, User, Phone, Mail, FileText, ShoppingBag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, placeOrder, currentUser, setActiveModal } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [cityArea, setCityArea] = useState<'Inside Dhaka' | 'Outside Dhaka'>('Inside Dhaka');
  const [orderNote, setOrderNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const deliveryFee = cityArea === 'Inside Dhaka' ? 70 : 130;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('আপনার কার্ট খালি। অর্ডার করতে পণ্য যোগ করুন।');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('দয়া করে আপনার নাম লিখুন।');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01897514604)।');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('দয়া করে আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা/রোড/এলাকা/থানা)।');
      return;
    }

    setIsSubmitting(true);

    try {
      // Place REAL order: generates unique Order ID, updates database & stock
      const order = placeOrder({
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        cityArea,
        deliveryFee,
        orderNote,
      });

      setIsSubmitting(false);
      onClose();
      setActiveModal('orderConfirmation');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#11121a] border border-amber-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_30px_rgba(212,175,55,0.18)] overflow-hidden z-10 text-gray-100 my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">চেকআউট ও ডেলিভারি তথ্য</h3>
              <p className="text-xs text-amber-400/80">ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                আপনার নাম *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="উদাঃ নুসরাত জাহান"
                  className="w-full bg-[#181a26] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-[#181a26] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              ইমেইল (ঐচ্ছিক)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-[#181a26] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Area / City Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              ডেলিভারি এরিয়া নির্বাচন করুন *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setCityArea('Inside Dhaka')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  cityArea === 'Inside Dhaka'
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                    : 'bg-[#181a26] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-100">ঢাকার ভেতরে</div>
                  <div className="text-[11px] text-gray-400">চার্জ: ৳৭০ (২-৩ দিন)</div>
                </div>
                {cityArea === 'Inside Dhaka' && <Check className="w-4 h-4 text-amber-400" />}
              </div>

              <div
                onClick={() => setCityArea('Outside Dhaka')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  cityArea === 'Outside Dhaka'
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                    : 'bg-[#181a26] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-100">ঢাকার বাইরে</div>
                  <div className="text-[11px] text-gray-400">চার্জ: ৳১৩০ (৩-৫ দিন)</div>
                </div>
                {cityArea === 'Outside Dhaka' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/উপজেলা/জেলা) *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-amber-400/70" />
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ব্লক-সি, বনশ্রী, ঢাকা..."
                className="w-full bg-[#181a26] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Order Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              অর্ডার স্পেশাল নোট (ঐচ্ছিক)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-amber-400/70" />
              <textarea
                rows={1}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="ডেলিভারির কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                className="w-full bg-[#181a26] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="p-3.5 rounded-2xl bg-[#151722] border border-gray-800">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
              অর্ডারের সংক্ষিপ্ত বিবরণ ({cart.length} টি আইটেম)
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const price = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-2 truncate">
                      <img src={item.product.images[0] || '/logo.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                      <span className="truncate">{item.product.bengaliName || item.product.name} ({item.selectedSize}, {item.selectedColor}) × {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-amber-200 shrink-0 ml-2">
                      ৳{(price * item.quantity).toLocaleString('bn-BD')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Subtotal & Delivery Total */}
            <div className="mt-3 pt-3 border-t border-gray-800 space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>পণ্য সাবটোটাল:</span>
                <span className="text-gray-200">৳{cartTotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>ডেলিভারি চার্জ:</span>
                <span className="text-gray-200">৳{deliveryFee.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-gray-800">
                <span className="text-amber-300">সর্বমোট প্রদেয় বিল:</span>
                <span className="text-amber-300 text-base">৳{grandTotal.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(217,119,6,0.4)] transition cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                অর্ডার সংরক্ষণ হচ্ছে...
              </span>
            ) : (
              <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
