import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MessageSquare, MapPin, Mail, ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setSelectedCategory, setActiveModal } = useStore();

  return (
    <footer className="bg-[#090a0f] border-t border-amber-500/20 text-gray-300 pt-12 pb-24 md:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-800/80">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Online Dress Mart"
                className="w-12 h-12 rounded-full border border-amber-400/60 object-cover shadow"
              />
              <div>
                <h3 className="font-brand font-bold text-base text-amber-200 tracking-wider">
                  ONLINE DRESS MART
                </h3>
                <p className="text-[10px] text-amber-400/80 tracking-widest uppercase">
                  Curated Fashion
                </p>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed text-xs">
              অনলাইন ড্রেস মার্ট — আপনার পছন্দের এক্সক্লুসিভ কাতান সিল্ক শাড়ি, প্রিমিয়াম জর্জেট থ্রি-পিস, ব্রাইডাল লেহেঙ্গা ও ডিজাইনার গাউনের বিশ্বস্ত অনলাইন ফ্যাশন শপ।
            </p>

            <div className="flex items-center gap-3 pt-1">
              {/* Facebook Button */}
              <a
                href="https://www.facebook.com/profile.php?id=61565221242728"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 transition"
                title="Online Dress Mart Facebook Page"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/8801897514604"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 transition"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              {/* Call Button */}
              <a
                href="tel:01897514604"
                className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links / Categories */}
          <div>
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-3">
              জনপ্রিয় ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => setSelectedCategory('শাড়ি (Saree)')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  বেনারসি ও কাতান সিল্ক শাড়ি
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('থ্রি-পিস (Three Piece)')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  এক্সক্লুসিভ জর্জেট থ্রি-পিস
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('লেহেঙ্গা (Lehenga)')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  ব্রাইডাল ভেলভেট লেহেঙ্গা
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('গাউন (Gown)')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  ফ্লোর টাচ ডিজাইনার গাউন
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('বোরকা ও হিজাব (Abaya & Borka)')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  দুবাই চেরি স্টোন বোরকা
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-3">
              গ্রাহক সেবা ও পলিসি
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => setActiveModal('complaintBox')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  অভিযোগ ও সাপোর্ট বক্স
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('login')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  কাস্টমার অ্যাকাউন্ট লগইন
                </button>
              </li>
              <li>
                <span className="text-gray-300">ডেলিভারি চার্জ: ঢাকা ৳৭০, বাইরে ৳১৩০</span>
              </li>
              <li>
                <span className="text-gray-300">ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)</span>
              </li>
              <li>
                <span className="text-gray-300">সহজ ৭ দিনের এক্সচেঞ্জ সুবিধা</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Hotline */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-3">
              যোগাযোগ ও হটলাইন
            </h4>
            
            <a
              href="tel:01897514604"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141522] border border-amber-500/20 hover:border-amber-400/50 text-white transition group"
            >
              <Phone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] text-gray-400 block">সরাসরি ফোন করুন:</span>
                <strong className="text-amber-300 text-sm">01897514604</strong>
              </div>
            </a>

            <a
              href="https://wa.me/8801897514604"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-white transition group"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] text-gray-400 block">WhatsApp অর্ডার:</span>
                <strong className="text-emerald-300 text-sm">01897514604</strong>
              </div>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61565221242728"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:underline pt-1"
            >
              <span>আমাদের ফেসবুক পেইজ ভিজিট করুন</span>
            </a>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Online Dress Mart. সর্বস্বত্ব সংরক্ষিত।
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModal('adminPanel')}
              className="text-gray-500 hover:text-amber-400 transition cursor-pointer"
            >
              Admin Portal
            </button>
            <span>•</span>
            <span className="text-amber-400/80 font-medium">
              Curated Fashion for Bangladesh
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
