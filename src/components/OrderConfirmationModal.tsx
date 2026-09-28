import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, MessageSquare, Printer, ArrowRight, Package, Phone, MapPin } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose }) => {
  const { lastPlacedOrder, setActiveModal } = useStore();

  if (!isOpen || !lastPlacedOrder) return null;

  const order = lastPlacedOrder;

  const handleWhatsAppConfirm = () => {
    const itemsText = order.items
      .map((item, i) => `${i + 1}. ${item.productName} (${item.size}, ${item.color}) × ${item.quantity} = ৳${item.subtotal}`)
      .join('\n');

    const message = `আসসালামু আলাইকুম অনলাইন ড্রেস মার্ট!
আমি এইমাত্র একটি নতুন অর্ডার সম্পন্ন করেছি।

অর্ডার আইডি: ${order.id}
গ্রাহকের নাম: ${order.customerName}
মোবাইল: ${order.customerPhone}
ঠিকানা: ${order.deliveryAddress} (${order.cityArea})
অর্ডার আইটেম:
${itemsText}

ডেলিভারি চার্জ: ৳${order.deliveryFee}
সর্বমোট বিল: ৳${order.total.toLocaleString('bn-BD')}
পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি

দয়া করে দ্রুত কনফার্ম করে ডেলিভারির ব্যবস্থা করবেন। ধন্যবাদ!`;

    window.open(`https://wa.me/8801897514604?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#12131c] border border-amber-500/35 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] overflow-hidden z-10 text-gray-100 my-auto print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Celebration Bar */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#1c1a14] to-[#12131c] text-center border-b border-amber-500/20">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/90 mt-1">
            ধন্যবাদ! Online Dress Mart-এ আপনার অর্ডারটি সংরক্ষিত হয়েছে।
          </p>

          {/* Unique Order ID Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-sm sm:text-base font-bold shadow-sm">
            <span>অর্ডার আইডি:</span>
            <span className="text-white tracking-widest">{order.id}</span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-5 sm:p-7 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#171826] border border-gray-800 text-xs text-gray-300">
            <div>
              <span className="text-gray-400 block mb-0.5">গ্রাহকের নাম:</span>
              <strong className="text-white text-sm">{order.customerName}</strong>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">যোগাযোগ নম্বর:</span>
              <strong className="text-amber-300 text-sm">{order.customerPhone}</strong>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-gray-800/80">
              <span className="text-gray-400 block mb-0.5">ডেলিভারি ঠিকানা:</span>
              <p className="text-white">{order.deliveryAddress} ({order.cityArea})</p>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="p-4 rounded-2xl bg-[#171826] border border-gray-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5">
              অর্ডারের আইটেমসমূহ
            </h4>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-gray-300 border-b border-gray-800/60 pb-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-700" />
                    <div>
                      <div className="font-semibold text-white truncate max-w-xs">{item.productName}</div>
                      <div className="text-[11px] text-gray-400">সাইজ: {item.size} | কালার: {item.color} | পরিমাণ: {item.quantity}টি</div>
                    </div>
                  </div>
                  <span className="font-bold text-amber-300 ml-2 shrink-0">
                    ৳{item.subtotal.toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-3 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>পণ্য মূল্য:</span>
                <span>৳{order.subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{order.deliveryFee.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                <span className="text-amber-300">সর্বমোট প্রদেয় (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-amber-300 text-base">৳{order.total.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 sm:p-6 border-t border-gray-800 bg-[#151622] space-y-2.5 print:hidden">
          <button
            type="button"
            onClick={handleWhatsAppConfirm}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.35)] transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp-এ অর্ডার কনফার্মেশন পাঠান</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-[#1c1e2b] hover:bg-[#25283a] border border-gray-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>রসিদ প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveModal('userProfile');
              }}
              className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>আমার অর্ডারসমূহ দেখুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
