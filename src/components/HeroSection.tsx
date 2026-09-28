import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Phone, MessageSquare, ArrowDown, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setSelectedCategory } = useStore();

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-20 bg-gradient-to-b from-[#0e0f17] via-[#090a0f] to-[#08090c] border-b border-amber-500/15">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl h-80 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-24 -left-20 w-72 h-72 bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-3/5 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-medium mb-4 shadow-[0_2px_12px_rgba(217,119,6,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>প্রিমিয়াম কোয়ালিটি ড্রেস কালেকশন ২০২৬</span>
            </div>

            {/* Main Headings (Responsive Bangla Fonts without overflowing or clipping) */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
              <span className="block text-gold-bright">
                অনলাইন ড্রেস মার্ট
              </span>
              <span className="block text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 mt-1 sm:mt-2">
                এক্সক্লুসিভ ফ্যাশন সম্ভার
              </span>
            </h1>

            {/* Description */}
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              দেশি-বিদেশি প্রিমিয়াম কাতান সিল্ক শাড়ি, ভারী এম্ব্রয়ডারি থ্রি-পিস, গর্জিয়াস ব্রাইডাল লেহেঙ্গা, ডিজাইনার গাউন ও দুবাই চেরি বোরকা। সারা বাংলাদেশে দ্রুত ক্যাশ অন ডেলিভারি।
            </p>

            {/* ACTION BUTTONS (Fully Responsive, Mobile-Friendly, No Text Cut-Off) */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto max-w-md sm:max-w-none">
              
              {/* Primary Button */}
              <button
                type="button"
                onClick={scrollToProducts}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm sm:text-base shadow-[0_4px_25px_rgba(217,119,6,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>পোশাক দেখুন ও অর্ডার করুন</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {/* Call Button */}
              <a
                href="tel:01897514604"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#171926] hover:bg-[#202336] border border-amber-500/30 hover:border-amber-400 text-amber-300 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>সরাসরি কল</span>
              </a>

              {/* WhatsApp Order Button */}
              <a
                href="https://wa.me/8801897514604?text=হ্যালো%20অনলাইন%20ড্রেস%20মার্ট!%20আমি%20একটি%20ড্রেস%20অর্ডার%20করতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp অর্ডার</span>
              </a>

            </div>

            {/* Assurance badges */}
            <div className="mt-8 pt-6 border-t border-gray-800/80 grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-lg text-center">
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[11px] sm:text-xs font-semibold text-gray-200">সারাদেশে হোম ডেলিভারি</span>
                <span className="text-[10px] text-gray-400">ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center border-x border-gray-800">
                <ShieldCheck className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[11px] sm:text-xs font-semibold text-gray-200">১০০% প্রিমিয়াম কাপড়</span>
                <span className="text-[10px] text-gray-400">চেক করে নেওয়ার সুবিধা</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[11px] sm:text-xs font-semibold text-gray-200">সহজ রিটার্ন পলিসি</span>
                <span className="text-[10px] text-gray-400">৭ দিনের মধ্যে এক্সচেঞ্জ</span>
              </div>
            </div>

          </div>

          {/* RIGHT SHOWCASE: Official Logo & Showcase Card */}
          <div className="w-full lg:w-2/5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 xs:w-72 xs:h-72 sm:w-88 sm:h-88 flex items-center justify-center group">
              {/* Outer decorative glowing ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600/30 via-amber-400/20 to-transparent blur-xl group-hover:scale-105 transition-transform duration-700" />
              
              {/* Subtle rotating gold border */}
              <div className="absolute inset-1 rounded-full border border-dashed border-amber-400/40 animate-[spin_60s_linear_infinite]" />

              {/* Official Logo Medallion */}
              <div className="relative w-56 h-56 xs:w-64 xs:h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.3)] bg-black">
                <img
                  src="/logo.jpg"
                  alt="Online Dress Mart"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating verified badge */}
              <div className="absolute -bottom-2 right-4 sm:right-6 px-3.5 py-1.5 rounded-full bg-[#12131b]/95 border border-amber-400/60 shadow-xl flex items-center gap-1.5 text-xs text-amber-300 font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>অফিসিয়াল স্টোর</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
