import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, User, Phone, MapPin, Package, LogOut, CheckCircle2, Clock, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, orders, logout, updateUserProfile, setActiveModal } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter orders that belong to this customer (by userId, email, or phone)
  const myOrders = orders.filter((o) => {
    if (!currentUser) return false;
    return (
      o.userId === currentUser.id ||
      (currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.phone && o.customerPhone === currentUser.phone) ||
      o.customerName.toLowerCase() === currentUser.name.toLowerCase()
    );
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone, address });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">ডেলিভার্ড</span>;
      case 'Shipped':
        return <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 text-[11px] font-semibold">শিপড / পথে আছে</span>;
      case 'Confirmed':
      case 'Processing':
        return <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">কনফার্মড</span>;
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-[11px] font-semibold">বাতিল</span>;
      case 'Pending':
      default:
        return <span className="px-2 py-0.5 rounded-full bg-yellow-950 text-yellow-300 border border-yellow-500/40 text-[11px] font-semibold">অপেক্ষমাণ (Pending)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#111219] border border-amber-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 text-gray-100 my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-12 h-12 rounded-full object-cover border border-amber-400" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{currentUser?.name || 'কাস্টমার প্রোফাইল'}</h3>
              <p className="text-xs text-amber-400/80">{currentUser?.email || 'অ্যাকাউন্ট ভেরিফাইড'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!</span>
          </div>
        )}

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Profile Details Box */}
          <div className="p-4 rounded-2xl bg-[#161826] border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                ব্যক্তিগত তথ্য
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                {isEditing ? 'বাতিল' : 'পরিবর্তন করুন'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">পূর্ণ নাম:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1e2030] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">মোবাইল নম্বর:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1e2030] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">ডেলিভারি ঠিকানা:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#1e2030] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block">নাম:</span>
                  <span className="font-semibold text-white">{currentUser?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">মোবাইল:</span>
                  <span className="font-semibold text-white">{currentUser?.phone || 'যুক্ত করা হয়নি'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block">ঠিকানা:</span>
                  <span className="font-semibold text-white">{currentUser?.address || 'কোনো ঠিকানা সেভ করা নেই'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">আমার অর্ডারসমূহ ({myOrders.length})</h4>
              </div>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#161826] border border-gray-800 text-center">
                <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">এখনও কোনো অর্ডার করেননি।</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    const el = document.getElementById('products-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold"
                >
                  পোশাক দেখুন ও অর্ডার করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-[#161826] border border-gray-800 hover:border-amber-500/30 transition">
                    <div className="flex items-center justify-between border-b border-gray-800/80 pb-2 mb-2.5">
                      <div>
                        <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">{ord.id}</span>
                        <span className="text-[11px] text-gray-400 block">
                          {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>{getStatusBadge(ord.status)}</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                          <span className="truncate max-w-[200px] sm:max-w-xs">
                            {item.productName} ({item.size}) × {item.quantity}
                          </span>
                          <span className="text-amber-200 font-semibold">৳{item.subtotal.toLocaleString('bn-BD')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400">সর্বমোট (ডেলিভারিসহ):</span>
                      <span className="text-amber-300 text-sm">৳{ord.total.toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#151724] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveModal('complaintBox')}
            className="text-xs text-gray-400 hover:text-amber-300 underline"
          >
            সাহায্য বা অভিযোগ জানাতে চান?
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
