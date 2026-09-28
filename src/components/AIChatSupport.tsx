import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, X, Send, Bot, Sparkles, User, Phone, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIChatSupport: React.FC = () => {
  const { orders, products } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি Online Dress Mart-এর AI সহকারী। শাড়ি, থ্রি-পিস, লেহেঙ্গা, সাইজ, ডেলিভারি বা আপনার অর্ডার স্ট্যাটাস সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।',
      time: 'এখন',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Intelligent local & real DB response engine ensuring strict order reality!
  const generateResponse = async (userQuery: string): Promise<string> => {
    const q = userQuery.toLowerCase().trim();

    // 1. ORDER STATUS QUERY CHECK
    // Check if query contains ODM-XXXXX or asks about order status
    const orderIdMatch = userQuery.match(/odm-[\d\w]+/i) || userQuery.match(/\b\d{5}\b/);
    if (orderIdMatch || q.includes('অর্ডার') || q.includes('order') || q.includes('স্ট্যাটাস') || q.includes('status')) {
      if (orderIdMatch) {
        const queryId = orderIdMatch[0].toUpperCase().startsWith('ODM-') 
          ? orderIdMatch[0].toUpperCase() 
          : `ODM-${orderIdMatch[0]}`;
        
        // Query REAL database only!
        const foundOrder = orders.find((o) => o.id.toUpperCase() === queryId);
        if (foundOrder) {
          const itemsSummary = foundOrder.items.map((it) => `${it.productName} (${it.size}) × ${it.quantity}`).join(', ');
          return `আপনার অর্ডার ${foundOrder.id} এর বর্তমান অবস্থা:\n\n• বর্তমান স্ট্যাটাস: ${foundOrder.status}\n• গ্রাহকের নাম: ${foundOrder.customerName}\n• পণ্য: ${itemsSummary}\n• সর্বমোট প্রদেয় বিল: ৳${foundOrder.total.toLocaleString('bn-BD')}\n• ডেলিভারি ঠিকানা: ${foundOrder.deliveryAddress}\n\nআমাদের ডেলিভারি টিম দ্রুত ডেলিভারি সম্পন্ন করার জন্য কাজ করছে। কোনো জরুরি প্রয়োজনে সরাসরি কল করুন 01897514604 নম্বরে।`;
        } else {
          return `দুঃখিত, '${queryId}' আইডি দিয়ে আমাদের ডাটাবেজে কোনো অর্ডার খুঁজে পাওয়া যায়নি। দয়া করে সঠিক Order ID দিন অথবা আমাদের হটলাইন 01897514604 নম্বরে যোগাযোগ করুন।`;
        }
      } else if (q.includes('অর্ডার') || q.includes('order')) {
        return 'আপনার অর্ডার স্ট্যাটাস জানতে দয়া করে আপনার ৫ ডিজিটের Order ID (যেমন: ODM-12345) লিখে পাঠান। আমাদের সিস্টেম সরাসরি ডাটাবেজ থেকে চেক করে জানিয়ে দেবে।';
      }
    }

    // 2. DELIVERY & CHARGES
    if (q.includes('ডেলিভারি') || q.includes('delivery') || q.includes('চার্জ') || q.includes('খরচ') || q.includes('কবে পাব')) {
      return `আমাদের ডেলিভারি নীতিমালা:\n\n• ঢাকার ভেতরে ডেলিভারি চার্জ: ৳৭০ (সময়: ২ থেকে ৩ কার্যদিবস)\n• ঢাকার বাইরে (সারা বাংলাদেশ): ৳১৩০ (সময়: ৩ থেকে ৫ কার্যদিবস)\n• পেমেন্ট: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা)।\n\nযে কোনো ৩টি ড্রেস একসাথে অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি অফার চলছে!`;
    }

    // 3. SIZE & MEASUREMENTS
    if (q.includes('সাইজ') || q.includes('size') || q.includes('বডি') || q.includes('ফিটিং')) {
      return `আমাদের থ্রি-পিস ও কুর্তির স্ট্যান্ডার্ড সাইজ চার্ট:\n\n• M: বডি ৩৮ ইঞ্চি\n• L: বডি ৪০ ইঞ্চি\n• XL: বডি ৪২ ইঞ্চি\n• XXL: বডি ৪৪ ইঞ্চি\n• শাড়ি: ফুল ১২ হাত এবং আনস্টিচড ব্লাউজ পিসসহ।\n• বোরকা: উচ্চতা অনুযায়ী সাইজ ৫২, ৫৪ এবং ৫৬ অ্যাভেইলেবল।\n\nঅর্ডারের সময় আপনার মাপ অনুযায়ী সাইজ সিলেক্ট করুন।`;
    }

    // 4. PHONE / CALL / WHATSAPP / CONTACT
    if (q.includes('কল') || q.includes('call') || q.includes('নাম্বার') || q.includes('ফোন') || q.includes('whatsapp') || q.includes('যোগাযোগ')) {
      return `Online Dress Mart-এর যোগাযোগের নম্বর:\n\n📞 হটলাইন কল: 01897514604\n💬 WhatsApp: 01897514604\n🌐 ফেসবুক পেজ: https://www.facebook.com/profile.php?id=61565221242728\n\nআমরা প্রতিদিন সকাল ১০টা থেকে রাত ১১টা পর্যন্ত কাস্টমার সেবা দিয়ে থাকি।`;
    }

    // 5. RETURN / COMPLAINT / EXCHANGE
    if (q.includes('রিটার্ন') || q.includes('return') || q.includes('অভিযোগ') || q.includes('সমস্যা') || q.includes('বদলে') || q.includes('exchange')) {
      return `আমাদের এক্সচেঞ্জ ও অভিযোগ নীতিমালা:\n\n• ডেলিভারিম্যানের সামনে ড্রেস চেক করার পূর্ণ সুবিধা রয়েছে।\n• সাইজ বা ফেব্রিকে কোনো সমস্যা হলে ৭ দিনের মধ্যে সহজে এক্সচেঞ্জ করতে পারবেন।\n• অভিযোগ জানাতে আমাদের ওয়েবসাইটের মেনু থেকে 'অভিযোগ বক্স'-এ গিয়ে অভিযোগ দাখিল করতে পারেন। অ্যাডমিন প্যানেল থেকে দ্রুত সমাধান দেওয়া হবে।`;
    }

    // 6. PRODUCT & CATEGORY INQUIRIES
    if (q.includes('শাড়ি') || q.includes('saree') || q.includes('কাতান')) {
      const sarees = products.filter((p) => p.category === 'শাড়ি');
      const names = sarees.map((s) => `• ${s.bengaliName} (মূল্য: ৳${s.discountPrice || s.price})`).join('\n');
      return `আমাদের বর্তমান শাড়ি কালেকশন:\n\n${names}\n\nপণ্যগুলোর ছবি ও বিস্তারিত দেখতে ওয়েবসাইট স্ক্রল করুন এবং 'কার্টে নিন' অথবা 'অর্ডার' বাটনে চাপুন।`;
    }

    if (q.includes('থ্রি-পিস') || q.includes('three piece') || q.includes('জর্জেট')) {
      return `আমাদের কাছে প্রিমিয়াম কাশ্মীরি এম্ব্রয়ডারি জর্জেট থ্রি-পিস এবং লাক্সারি ভেলভেট পার্টি ড্রেস রয়েছে। আকর্ষণীয় ছাড়ের পর মূল্য ৳২,৪৫০ থেকে ৳৩,১৫০ পর্যন্ত। সবগুলো ড্রেস সাইজ অনুযায়ী রেডি পাওয়া যাবে।`;
    }

    if (q.includes('লেহেঙ্গা') || q.includes('lehenga') || q.includes('ব্রাইডাল')) {
      return `আমাদের ব্রাইডাল কালেকশনে হেভি ভেলভেট জারি লেহেঙ্গা (৪.৫ মিটার ঘেরসহ) রয়েছে। বর্তমান স্পেশাল ডিসকাউন্ট মূল্য ৳৫,৮০০। প্রিমিয়াম কোয়ালিটি ও গর্জিয়াস লুকের জন্য বিয়ে ও বিশেষ অনুষ্ঠানে সেরা!`;
    }

    // Try backend AI call if available
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    } catch {
      // Backend fallback handled below
    }

    // Safe helpful fallback
    return `আমি আপনার প্রশ্নটি নোট করেছি। Online Dress Mart-এর পোশাক, অর্ডার বা সাইজ সম্পর্কে আরো বিস্তারিত জানতে সরাসরি আমাদের প্রতিনিধির সাথে WhatsApp বা ফোনে যোগাযোগ করুন: 01897514604। অথবা আমাদের ফেসবুক পেইজ ভিজিট করুন: https://www.facebook.com/profile.php?id=61565221242728`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await generateResponse(userText);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: 'দুঃখিত, সংযোগে সমস্যা হয়েছে। দয়া করে 01897514604 নম্বরে যোগাযোগ করুন।',
        time: 'এখন',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Positioned safely above bottom nav on mobile) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 shadow-[0_4px_25px_rgba(217,119,6,0.5)] border border-amber-300 transition-all transform hover:scale-110 cursor-pointer flex items-center justify-center"
          aria-label="AI Customer Support"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 fill-stone-950" />
              {/* Glowing Pulse Ring */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-96 max-w-sm h-[480px] bg-[#10121a]/95 backdrop-blur-xl border border-amber-500/35 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] flex flex-col z-50 overflow-hidden text-gray-100">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#171926] via-[#1f2235] to-[#171926] border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Online Dress Mart"
                  className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#10121a]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>AI কাস্টমার সহকারী</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[10px] text-amber-400/80">Online Dress Mart 24/7 সাপোর্ট</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-medium rounded-tr-none'
                      : 'bg-[#181a26] border border-amber-500/20 text-gray-200 rounded-tl-none shadow'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-stone-900/80' : 'text-gray-500'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-gray-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#181a26] border border-amber-500/20 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 bg-[#0d0e14] border-t border-gray-800/80 flex gap-1.5 overflow-x-auto text-[10px] text-amber-300/90 whitespace-nowrap">
            <button
              onClick={() => setInput('ডেলিভারি চার্জ ও সময় কত?')}
              className="px-2.5 py-1 rounded-full bg-[#181924] border border-amber-500/20 hover:border-amber-400/50"
            >
              ডেলিভারি কত?
            </button>
            <button
              onClick={() => setInput('আমার অর্ডার স্ট্যাটাস কী?')}
              className="px-2.5 py-1 rounded-full bg-[#181924] border border-amber-500/20 hover:border-amber-400/50"
            >
              অর্ডার স্ট্যাটাস
            </button>
            <button
              onClick={() => setInput('থ্রি-পিস কালেকশন দেখান')}
              className="px-2.5 py-1 rounded-full bg-[#181924] border border-amber-500/20 hover:border-amber-400/50"
            >
              থ্রি-পিস কালেকশন
            </button>
            <button
              onClick={() => setInput('যোগাযোগের ফোন নম্বর')}
              className="px-2.5 py-1 rounded-full bg-[#181924] border border-amber-500/20 hover:border-amber-400/50"
            >
              হটলাইন নম্বর
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#13151f] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="একটি প্রশ্ন লিখুন..."
              className="flex-1 bg-[#1a1c28] border border-amber-500/25 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
