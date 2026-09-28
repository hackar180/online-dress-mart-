import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface PullStringLampLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PullStringLampLogin: React.FC<PullStringLampLoginProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, currentUser } = useStore();

  // Lamp state: false = off (dark), true = on (warm golden light beam + login card visible)
  const [isLampOn, setIsLampOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Tab: 'login' | 'register' | 'forgot'
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pull interaction refs
  const stringRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);

  // When modal opens, lamp starts OFF so customer pulls the string to turn on!
  useEffect(() => {
    if (isOpen) {
      setIsLampOn(false);
      setPullDistance(0);
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Handle pull action trigger
  const triggerLampPull = () => {
    // String bounce effect
    setIsPulling(true);
    setPullDistance(32);
    
    setTimeout(() => {
      setPullDistance(0);
      setIsPulling(false);
      setIsLampOn((prev) => !prev);
    }, 220);
  };

  // Mouse & Touch Drag handling
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startYRef.current === null) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = clientY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta, 50));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 18) {
      triggerLampPull();
    } else {
      setPullDistance(0);
    }
    startYRef.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        if (!email.trim() || !password) {
          setStatusMessage({ type: 'error', text: 'দয়া করে ইমেইল এবং পাসওয়ার্ড দিন।' });
          setIsSubmitting(false);
          return;
        }
        await loginWithEmail(email, password);
        setStatusMessage({ type: 'success', text: 'স্বাগতম! সফলভাবে লগইন হয়েছে।' });
        setTimeout(() => onClose(), 900);
      } else if (tab === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          setStatusMessage({ type: 'error', text: 'দয়া করে নাম, ইমেইল এবং পাসওয়ার্ড দিন।' });
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(name, email, phone, password);
        setStatusMessage({ type: 'success', text: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' });
        setTimeout(() => onClose(), 900);
      } else if (tab === 'forgot') {
        if (!email.trim()) {
          setStatusMessage({ type: 'error', text: 'আপনার নিবন্ধিত ইমেইল ঠিকানা লিখুন।' });
          setIsSubmitting(false);
          return;
        }
        setStatusMessage({ type: 'success', text: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' });
        setTimeout(() => setTab('login'), 1500);
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      // Simulate real Google Sign-In with customer profile creation
      await loginWithGoogle({
        name: currentUser?.name || 'Customer Profile',
        email: 'customer@gmail.com',
      });
      setStatusMessage({ type: 'success', text: 'Google দিয়ে সফলভাবে লগইন হয়েছে!' });
      setTimeout(() => onClose(), 900);
    } catch {
      setStatusMessage({ type: 'error', text: 'Google লগইন সম্পন্ন করা যায়নি।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex flex-col items-center justify-start min-h-screen px-3 py-4 sm:p-6 transition-colors duration-700">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-[#161720]/80 border border-amber-500/20 text-gray-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Ceiling Lamp Structure */}
      <div className="relative w-full max-w-sm flex flex-col items-center pt-0 pb-4 select-none shrink-0">
        {/* Ceiling mount rosette */}
        <div className="w-12 h-2.5 bg-gradient-to-r from-amber-800 via-amber-400 to-amber-900 rounded-b-sm shadow-md" />

        {/* Lamp wire cord */}
        <div className="w-0.5 h-10 sm:h-12 bg-gradient-to-b from-stone-600 via-amber-700/60 to-stone-500 shadow-sm" />

        {/* Lamp Shade fixture */}
        <div className="relative flex flex-col items-center">
          {/* Socket cap */}
          <div className="w-6 h-3 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-t-sm border-t border-amber-200/40" />
          
          {/* Elegant Bell Shade */}
          <div className="relative w-28 sm:w-32 h-14 bg-gradient-to-b from-[#211f18] via-[#151410] to-[#0c0b08] rounded-t-2xl rounded-b-lg border border-amber-500/35 shadow-xl flex items-center justify-center overflow-hidden">
            {/* Shade gold trim ring */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700" />
            
            {/* Subtle inner reflection */}
            <div className="absolute inset-x-3 top-2 h-4 bg-gradient-to-b from-amber-400/20 to-transparent rounded-t-xl" />
          </div>

          {/* Glowing Bulb inside */}
          <div
            className={`w-7 h-7 -mt-2 rounded-full transition-all duration-500 flex items-center justify-center ${
              isLampOn
                ? 'bg-amber-100 shadow-[0_0_35px_12px_rgba(251,191,36,0.9),0_0_70px_25px_rgba(217,119,6,0.6)]'
                : 'bg-stone-800 border border-stone-600 shadow-inner'
            }`}
          >
            {isLampOn && <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-60" />}
          </div>

          {/* Pull String mechanism */}
          <div
            ref={stringRef}
            onClick={triggerLampPull}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            style={{
              transform: `translateY(${pullDistance}px)`,
              transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            className="cursor-pointer group flex flex-col items-center mt-0 pt-0 select-none z-30"
          >
            {/* Slender golden cord */}
            <div className="w-[1.5px] h-14 sm:h-16 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-200 shadow-sm" />
            
            {/* Golden Round Pull Handle with realistic luster */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 via-amber-200 to-amber-500 shadow-[0_2px_8px_rgba(212,175,55,0.7)] group-hover:scale-125 transition-transform border border-amber-100/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Light Beam / Illumination Cone when ON */}
      {isLampOn && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-10 overflow-hidden">
          <div className="w-[140vw] max-w-4xl h-[120vh] -top-24 absolute lamp-glow-cone opacity-90 transition-opacity duration-700 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Login Card appears smoothly when lamp is ON */}
      <AnimatePresence>
        {isLampOn && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 w-full max-w-md mx-auto my-auto"
          >
            <div className="relative rounded-3xl p-6 sm:p-8 bg-[#12131b]/90 backdrop-blur-2xl border border-amber-500/35 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.18)] text-gray-100 overflow-hidden">
              {/* Subtle top golden light rim */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

              {/* Official Logo & Branding Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="absolute -inset-1.5 rounded-full bg-amber-400/25 blur-md" />
                  <img
                    src="/logo.jpg"
                    alt="Online Dress Mart Logo"
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400/60 shadow-xl"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-brand tracking-wider text-amber-200">
                  Online Dress Mart
                </h2>
                <p className="text-xs sm:text-sm text-amber-400/80 font-medium mt-0.5">
                  Welcome to Online Dress Mart
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {tab === 'login' && 'আপনার অ্যাকাউন্টে লগইন করুন'}
                  {tab === 'register' && 'নতুন কাস্টমার অ্যাকাউন্ট তৈরি করুন'}
                  {tab === 'forgot' && 'পাসওয়ার্ড রিসেট করতে ইমেইল দিন'}
                </p>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`mb-5 p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 border ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Continue with Google Button */}
              {tab !== 'forgot' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1b1d28] hover:bg-[#232635] border border-amber-500/25 hover:border-amber-400/50 text-gray-200 font-medium text-sm transition-all shadow-md group cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-5 flex items-center justify-center">
                    <div className="border-t border-gray-700/60 w-full" />
                    <span className="bg-[#12131b] px-3 text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold shrink-0">
                      অথবা Email Login
                    </span>
                    <div className="border-t border-gray-700/60 w-full" />
                  </div>
                </>
              )}

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {tab === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        আপনার পূর্ণ নাম (Full Name)
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="উদাঃ জান্নাতুল ফেরদৌস"
                          className="w-full bg-[#181924] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        মোবাইল নম্বর (Phone)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-[#181924] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-[#181924] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>

                {tab !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">
                        Password
                      </label>
                      {tab === 'login' && (
                        <button
                          type="button"
                          onClick={() => setTab('forgot')}
                          className="text-[11px] text-amber-400/80 hover:text-amber-300 transition"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#181924] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(217,119,6,0.35)] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      অপেক্ষা করুন...
                    </span>
                  ) : tab === 'login' ? (
                    'Login button'
                  ) : tab === 'register' ? (
                    'Create Account'
                  ) : (
                    'পাসওয়ার্ড লিংক পাঠান'
                  )}
                </button>
              </form>

              {/* Bottom toggle between Login & Register */}
              <div className="mt-5 text-center text-xs text-gray-400">
                {tab === 'login' ? (
                  <p>
                    নতুন গ্রাহক?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('register');
                        setStatusMessage(null);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                ) : (
                  <p>
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        setStatusMessage(null);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
                    >
                      লগইন করুন (Login)
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
