import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, HelpCircle, CheckCircle2, Search, MessageSquare, AlertCircle, Phone } from 'lucide-react';
import { Complaint } from '../types';

interface ComplaintBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintBoxModal: React.FC<ComplaintBoxModalProps> = ({ isOpen, onClose }) => {
  const { submitComplaint, complaints, currentUser } = useStore();

  const [tab, setTab] = useState<'submit' | 'track'>('submit');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [orderId, setOrderId] = useState('');
  const [complaintType, setComplaintType] = useState<Complaint['complaintType']>('ডেলিভারি বিলম্ব (Delivery Delay)');
  const [description, setDescription] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  
  // Tracking search
  const [trackId, setTrackId] = useState('');
  const [trackedResult, setTrackedResult] = useState<Complaint | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !description) return;

    const result = await submitComplaint({
      customerName,
      customerPhone,
      customerEmail,
      orderId,
      complaintType,
      description,
    });

    setSubmittedComplaint(result);
    // Reset fields
    setDescription('');
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    const cleaned = trackId.trim().toUpperCase();
    const found = complaints.find(
      (c) => c.id.toUpperCase() === cleaned || (c.orderId && c.orderId.toUpperCase() === cleaned)
    );
    setTrackedResult(found || null);
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">সমাধান হয়েছে (Resolved)</span>;
      case 'Reviewing':
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-bold">পর্যালোচনাধীন (In Review)</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-600 text-xs font-bold">বন্ধ (Closed)</span>;
      case 'New':
      default:
        return <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 text-xs font-bold">নতুন জমা হয়েছে (New)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#111219] border border-amber-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 text-gray-100 my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">অভিযোগ ও গ্রাহক সেবা বক্স</h3>
              <p className="text-xs text-amber-400/80">Online Dress Mart কাস্টমার কেয়ার</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-800 bg-[#0d0e14]">
          <button
            type="button"
            onClick={() => {
              setTab('submit');
              setSubmittedComplaint(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tab === 'submit'
                ? 'text-amber-300 border-b-2 border-amber-400 bg-[#161826]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            অভিযোগ / সমস্যা জানান
          </button>
          <button
            type="button"
            onClick={() => setTab('track')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tab === 'track'
                ? 'text-amber-300 border-b-2 border-amber-400 bg-[#161826]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            অভিযোগের স্ট্যাটাস ট্র্যাক করুন
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {tab === 'submit' ? (
            submittedComplaint ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">অভিযোগ সফলভাবে গ্রহণ করা হয়েছে!</h4>
                <p className="text-xs text-gray-300">
                  আপনার সমস্যাটি পর্যালোচনার জন্য অ্যাডমিন প্যানেলে পাঠানো হয়েছে। আমাদের সাপোর্ট টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-300 font-mono text-sm font-bold inline-block">
                  অভিযোগ আইডি: {submittedComplaint.id}
                </div>
                <div className="pt-3 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedComplaint(null)}
                    className="px-4 py-2 rounded-xl bg-[#1a1c2a] border border-gray-700 text-xs font-semibold text-gray-200"
                  >
                    আরেকটি অভিযোগ জানান
                  </button>
                  <a
                    href="https://wa.me/8801897514604"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp-এ জরুরি কথা বলুন</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">অর্ডার আইডি (যদি থাকে)</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="উদাঃ ODM-12345"
                      className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">অভিযোগের ধরন *</label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value as any)}
                    className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ডেলিভারি বিলম্ব (Delivery Delay)">ডেলিভারি বিলম্ব (Delivery Delay)</option>
                    <option value="সাইজ বা কালার সমস্যা (Size/Color Issue)">সাইজ বা কালার সমস্যা (Size/Color Issue)</option>
                    <option value="পণ্য ক্ষতিগ্রস্ত (Damaged Product)">পণ্য ক্ষতিগ্রস্ত (Damaged Product)</option>
                    <option value="পেমেন্ট সমস্যা (Payment Issue)">পেমেন্ট সমস্যা (Payment Issue)</option>
                    <option value="অন্যান্য (Other)">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">সমস্যা বা অভিযোগের বিস্তারিত *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="আপনার অভিযোগের স্পষ্ট বিবরণ দিন..."
                    className="w-full bg-[#181a26] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow transition cursor-pointer"
                >
                  অভিযোগ দাখিল করুন (Submit Complaint)
                </button>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder="অভিযোগ আইডি বা অর্ডার আইডি দিন..."
                  className="flex-1 bg-[#181a26] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ট্র্যাক</span>
                </button>
              </form>

              {searchAttempted && (
                trackedResult ? (
                  <div className="p-4 rounded-2xl bg-[#161826] border border-gray-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className="font-mono font-bold text-amber-300">{trackedResult.id}</span>
                      {getStatusBadge(trackedResult.status)}
                    </div>
                    <div>
                      <span className="text-gray-400 block">অভিযোগের বিষয়:</span>
                      <span className="font-semibold text-white">{trackedResult.complaintType}</span>
                    </div>
                    {trackedResult.orderId && (
                      <div>
                        <span className="text-gray-400 block">সংশ্লিষ্ট অর্ডার:</span>
                        <span className="font-mono text-amber-200">{trackedResult.orderId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block">বিবরণ:</span>
                      <p className="text-gray-200 bg-[#1f2133] p-2.5 rounded-lg mt-1">{trackedResult.description}</p>
                    </div>
                    {trackedResult.adminNote && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
                        <strong className="block text-amber-400 mb-0.5">অ্যাডমিনের উত্তর/আপডেট:</strong>
                        <span>{trackedResult.adminNote}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-gray-400 bg-[#161826] rounded-xl border border-gray-800">
                    <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-1.5" />
                    <span>এই আইডি দিয়ে কোনো অভিযোগ খুঁজে পাওয়া যায়নি। আইডিটি সঠিক কিনা পরীক্ষা করুন।</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer Contact */}
        <div className="p-4 border-t border-gray-800 bg-[#151724] text-center text-xs text-gray-400">
          জরুরি সাহায্যের জন্য কল করুন: <a href="tel:01897514604" className="text-amber-300 font-bold hover:underline">01897514604</a> (সকাল ১০টা - রাত ১০টা)
        </div>
      </div>
    </div>
  );
};
