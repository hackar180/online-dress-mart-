import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, ShieldCheck, Lock, Package, ShoppingCart, Plus, Edit2, 
  Trash2, Eye, CheckCircle2, AlertTriangle, Megaphone, HelpCircle, 
  Upload, Search, DollarSign, Users, ChevronRight, RefreshCw, LogOut, KeyRound, Filter
} from 'lucide-react';
import { Product, ProductCategory, OrderStatus, Order, ComplaintStatus } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { 
    isAdminLoggedIn, 
    loginAsAdmin, 
    logoutAdmin, 
    changeAdminPassword,
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    orders, 
    updateOrderStatus, 
    complaints, 
    updateComplaintStatus, 
    announcements, 
    addAnnouncement, 
    deleteAnnouncement 
  } = useStore();

  // Admin Login state (Zero hardcoded password!)
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'dashboard' | 'products' | 'orders' | 'complaints' | 'announcements'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'complaints' | 'announcements'>('products');

  // Product Management Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Filter orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBengaliName, setProdBengaliName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('থ্রি-পিস (Three Piece)');
  const [prodSizes, setProdSizes] = useState<string>('M, L, XL, XXL');
  const [prodColors, setProdColors] = useState<string>('মেরুন, ব্লু, গোল্ড');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annBadge, setAnnBadge] = useState('অফার');

  if (!isOpen) return null;

  // Handle Admin Password Login (Secure Server Verification)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    const res = await loginAsAdmin(passwordInput);
    setIsLoggingIn(false);
    if (!res.success) {
      setAuthError(res.error || 'ভুল অ্যাডমিন পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } else {
      setPasswordInput('');
    }
  };

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);
    const res = await changeAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordChangeStatus({ type: 'success', text: res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordChangeStatus(null);
      }, 1500);
    } else {
      setPasswordChangeStatus({ type: 'error', text: res.error || 'পাসওয়ার্ড পরিবর্তন করা যায়নি।' });
    }
  };

  // Real-time calculations strictly from actual orders (starts at 0)
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.status === 'Confirmed').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCustomers = new Set(orders.map((o) => o.customerPhone)).size;
  const newComplaintsCount = complaints.filter((c) => c.status === 'New').length;

  // Filtered Products for Management Section
  const filteredProductsList = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const query = productSearch.toLowerCase().trim();
    const matchesSearch = !query || 
      p.name.toLowerCase().includes(query) || 
      p.bengaliName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  // Open Edit Product Modal
  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdBengaliName(prod.bengaliName);
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdDiscountPrice(prod.discountPrice);
    setProdStock(prod.stock);
    setProdCategory(prod.category);
    setProdSizes(prod.sizes.join(', '));
    setProdColors(prod.colors.join(', '));
    setProdImages(prod.images || ['/logo.jpg']);
    setIsProductModalOpen(true);
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdBengaliName('');
    setProdDescription('');
    setProdPrice(2500);
    setProdDiscountPrice(1950);
    setProdStock(15);
    setProdCategory('থ্রি-পিস (Three Piece)');
    setProdSizes('M, L, XL, XXL');
    setProdColors('মেরুন, ব্লু, গোল্ড');
    setProdImages([]);
    setIsProductModalOpen(true);
  };

  // Handle local image file upload directly from device (phone/PC)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProdImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setProdImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  // Save Product to Real Database
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || prodPrice <= 0) return;

    setIsSavingProduct(true);
    const parsedSizes = prodSizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedColors = prodColors.split(',').map((c) => c.trim()).filter(Boolean);

    const productPayload = {
      name: prodName,
      bengaliName: prodBengaliName || prodName,
      description: prodDescription,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
      stock: Number(prodStock),
      category: prodCategory,
      sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
      colors: parsedColors.length > 0 ? parsedColors : ['Standard'],
      images: prodImages.length > 0 ? prodImages : ['/logo.jpg'],
      status: Number(prodStock) > 0 ? ('In Stock' as const) : ('Out of Stock' as const),
    };

    if (editingProductId) {
      await updateProduct(editingProductId, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsSavingProduct(false);
    setIsProductModalOpen(false);
  };

  // Confirm and Execute Real Database & Storage Product Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const success = await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    if (success) {
      setDeleteSuccessMessage(`"${productToDelete.bengaliName || productToDelete.name}" সফলভাবে ডাটাবেজ ও স্টোরেজ থেকে মুছে ফেলা হয়েছে!`);
      setTimeout(() => setDeleteSuccessMessage(''), 3500);
    }
    setProductToDelete(null);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      badge: annBadge.trim(),
      date: new Date().toLocaleDateString('bn-BD'),
      isActive: true,
    });

    setAnnTitle('');
    setAnnContent('');
  };

  const categoriesList: ProductCategory[] = [
    'থ্রি-পিস (Three Piece)',
    'শাড়ি (Saree)',
    'জামা ও কুর্তি (Kameez & Kurti)',
    'লেহেঙ্গা (Lehenga)',
    'গাউন (Gown)',
    'পাঞ্জাবি (Panjabi)',
    'বোরকা ও হিজাব (Abaya & Borka)',
    'অন্যান্য পোশাক (Other Dresses)',
    'এক্সক্লুসিভ পার্টি ড্রেস (Party Dress)'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-[#0d0e14] border border-amber-500/40 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] overflow-hidden z-10 text-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-[#141520] via-[#1a1c2b] to-[#141520] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Online Dress Mart"
                className="w-10 h-10 rounded-full border border-amber-400/70"
              />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-[#0d0e14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-brand font-bold text-sm sm:text-base text-amber-200">
                  ONLINE DRESS MART — ADMIN PANEL
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300 font-mono">
                  SECURE PORTAL
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                রিয়েল প্রোডাক্ট আপলোড, ডাটাবেজ ও স্টক কন্ট্রোল প্যানেল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="পাসওয়ার্ড পরিবর্তন করুন"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">পাসওয়ার্ড পরিবর্তন</span>
                </button>

                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Delete Success Toast */}
        {deleteSuccessMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
        )}

        {/* If Admin NOT logged in, show Secure Password Prompt (Zero plain text in client!) */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center my-auto max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 mb-4 shadow-[0_0_25px_rgba(217,119,6,0.3)]">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">অ্যাডমিন প্রমাণীকরণ</h3>
            <p className="text-xs text-gray-400 mb-6">
              Online Dress Mart-এর অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আপনার সুরক্ষিত পাসওয়ার্ড দিন।
            </p>

            {authError && (
              <div className="mb-4 w-full p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="অ্যাডমিন পাসওয়ার্ড প্রবেশ করান"
                className="w-full bg-[#161824] border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-base text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm shadow-[0_4px_20px_rgba(217,119,6,0.35)] transition cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'যাচাই করা হচ্ছে...' : 'ড্যাশবোর্ডে প্রবেশ করুন'}
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#10111a] border-r border-amber-500/15 p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0">
              {/* Product Management tab is primary */}
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Product Management</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'products' ? 'bg-stone-950 text-amber-300' : 'bg-gray-800 text-gray-300'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ওভারভিউ ড্যাশবোর্ড</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4" />
                  <span>অর্ডারসমূহ</span>
                </div>
                {totalOrdersCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-stone-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {totalOrdersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'complaints'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>অভিযোগ ও সাপোর্ট</span>
                </div>
                {newComplaintsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {newComplaintsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'announcements'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>নোটিশ ও অফার</span>
              </button>
            </div>

            {/* Main Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0b10]">
              
              {/* TAB 1: PRODUCT MANAGEMENT (Core feature requested) */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                    <div>
                      <h4 className="font-bold text-base text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-400" />
                        <span>Product Management</span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        রিয়েল ডাটাবেজ থেকে প্রোডাক্ট আপলোড, একাধিক ছবি যোগ, প্রাইস ও স্টক ম্যানেজ করুন
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(217,119,6,0.35)] transition cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Add Product</span>
                    </button>
                  </div>

                  {/* Search & Category Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#141622] border border-gray-800">
                    {/* Search */}
                    <div className="relative sm:col-span-2">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="প্রোডাক্টের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                        className="w-full bg-[#1b1d2c] border border-amber-500/20 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="w-full bg-[#1b1d2c] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="All">সকল ক্যাটাগরি ({products.length})</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product List Table / Cards */}
                  {filteredProductsList.length === 0 ? (
                    <div className="p-12 text-center bg-[#12141e] rounded-2xl border border-gray-800">
                      <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 font-semibold">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি</p>
                      <p className="text-xs text-gray-500 mt-1">
                        সার্চ ফিল্টার পরিবর্তন করুন অথবা "+ Add Product" বাটনে ক্লিক করে নতুন প্রোডাক্ট যোগ করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredProductsList.map((p) => {
                        const effectivePrice = p.discountPrice ?? p.price;
                        return (
                          <div
                            key={p.id}
                            className="p-3.5 sm:p-4 rounded-2xl bg-[#12141e] border border-gray-800/90 hover:border-amber-500/35 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                          >
                            {/* Product Image & Main Details */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#181a26] border border-gray-700/80 shrink-0">
                                <img
                                  src={p.images[0] || '/logo.jpg'}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                {p.images.length > 1 && (
                                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] text-amber-300 font-mono">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {p.category}
                                </span>
                                <h5 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition">
                                  {p.bengaliName || p.name}
                                </h5>
                                <div className="text-[11px] text-gray-400 truncate max-w-md">
                                  {p.name}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                                  <span className="font-extrabold text-amber-300">
                                    ৳{effectivePrice.toLocaleString('bn-BD')}
                                  </span>
                                  {p.discountPrice && (
                                    <span className="text-[11px] text-gray-500 line-through">
                                      ৳{p.price.toLocaleString('bn-BD')}
                                    </span>
                                  )}
                                  <span className="text-gray-600">•</span>
                                  <span className="text-gray-300">
                                    স্টক: <strong className={p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>{p.stock} টি</strong>
                                  </span>
                                  <span className="text-gray-600">•</span>
                                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                                    p.stock > 0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                  }`}>
                                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Edit & Delete */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditProduct(p)}
                                className="px-3 py-1.5 rounded-xl bg-[#1b1d2b] hover:bg-[#25283a] border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top Real Stats Grid (STRICT: All real values, 0 if no real order!) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/20">
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <span>মোট প্রোডাক্ট</span>
                        <Package className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {products.length} <span className="text-xs font-normal text-gray-400">টি</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 mt-1 block">ডাটাবেজে সংরক্ষিত</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/20">
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <span>মোট অর্ডার</span>
                        <ShoppingCart className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-amber-300 mt-2">
                        {totalOrdersCount} <span className="text-xs font-normal text-gray-400">টি</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        বাস্তব কাস্টমার অর্ডার
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/20">
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <span>পেন্ডিং অর্ডার</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-300 mt-2">
                        {pendingOrdersCount} <span className="text-xs font-normal text-gray-400">টি</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">অপেক্ষমাণ কনফার্মেশন</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/20">
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <span>মোট রেভিনিউ</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-2">
                        ৳{totalRevenue.toLocaleString('bn-BD')}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">মোট অর্ডার বিক্রয়</span>
                    </div>
                  </div>

                  {/* Secondary stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#131522] border border-gray-800">
                      <span className="text-gray-400">কনফার্মড:</span>
                      <strong className="text-white ml-1.5">{confirmedOrdersCount}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#131522] border border-gray-800">
                      <span className="text-gray-400">ডেলিভার্ড:</span>
                      <strong className="text-emerald-400 ml-1.5">{deliveredOrdersCount}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#131522] border border-gray-800">
                      <span className="text-gray-400">কাস্টমার সংখ্যা:</span>
                      <strong className="text-amber-300 ml-1.5">{totalCustomers}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#131522] border border-gray-800">
                      <span className="text-gray-400">নতুন অভিযোগ:</span>
                      <strong className="text-rose-400 ml-1.5">{newComplaintsCount}</strong>
                    </div>
                  </div>

                  {/* RECENT ORDERS SECTION */}
                  <div className="p-5 rounded-2xl bg-[#12141e] border border-amber-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-sm text-white">সাম্প্রতিক অর্ডারসমূহ (RECENT ORDERS)</h4>
                        <p className="text-[11px] text-gray-400">শুধুমাত্র বাস্তব কাস্টমার অর্ডার সংরক্ষিত হয়</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
                      >
                        সব দেখুন
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center bg-[#151724] rounded-xl border border-gray-800/80">
                        <ShoppingCart className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-amber-200/90 font-medium">এখনও কোনো অর্ডার পাওয়া যায়নি</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          কাস্টমার ওয়েবসাইট থেকে পণ্য পছন্দ করে অর্ডার নিশ্চিত করার পর এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {orders.slice(0, 5).map((o) => (
                          <div
                            key={o.id}
                            onClick={() => setSelectedOrderDetails(o)}
                            className="p-3 rounded-xl bg-[#161826] border border-gray-800 hover:border-amber-400/40 transition flex items-center justify-between text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-amber-300">{o.id}</span>
                              <div>
                                <strong className="text-white block">{o.customerName}</strong>
                                <span className="text-[11px] text-gray-400">{o.customerPhone}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-amber-300 block">৳{o.total.toLocaleString('bn-BD')}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#12141e] border border-amber-500/20">
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                            orderStatusFilter === st
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-[#181a26] text-gray-300 hover:text-white'
                          }`}
                        >
                          {st === 'All' ? 'সব অর্ডার' : st}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-gray-400">
                      মোট পাওয়া গেছে: <strong className="text-amber-300">{filteredOrders.length}</strong> টি
                    </span>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center bg-[#12141e] rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400">এখনও কোনো অর্ডার পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 hover:border-amber-500/30 transition space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-amber-300 text-sm">{ord.id}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(ord.createdAt).toLocaleString('bn-BD')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status changer dropdown */}
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="bg-[#1a1c2a] border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending (অপেক্ষমাণ)</option>
                                <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                                <option value="Processing">Processing (প্রস্তুতি)</option>
                                <option value="Shipped">Shipped (কুরিয়ারে)</option>
                                <option value="Delivered">Delivered (পৌঁছেছে)</option>
                                <option value="Cancelled">Cancelled (বাতিল)</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs flex items-center gap-1 cursor-pointer"
                                title="পূর্ণ বিবরণ দেখুন"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Customer & Address */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-300">
                            <div>
                              <span className="text-gray-500 block">কাস্টমার নাম:</span>
                              <strong className="text-white">{ord.customerName}</strong>
                            </div>
                            <div>
                              <span className="text-gray-500 block">মোবাইল:</span>
                              <a href={`tel:${ord.customerPhone}`} className="text-amber-300 font-semibold hover:underline">
                                {ord.customerPhone}
                              </a>
                            </div>
                            <div>
                              <span className="text-gray-500 block">ঠিকানা:</span>
                              <span>{ord.deliveryAddress} ({ord.cityArea})</span>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="p-2.5 rounded-xl bg-[#161826] text-xs space-y-1">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-gray-300">
                                <span>{it.productName} (সাইজ: {it.size}, কালার: {it.color}) × {it.quantity}</span>
                                <span className="font-semibold text-amber-300">৳{it.subtotal.toLocaleString('bn-BD')}</span>
                              </div>
                            ))}
                            <div className="pt-1.5 mt-1 border-t border-gray-700/60 flex justify-between font-bold text-white">
                              <span>ডেলিভারি চার্জ: ৳{ord.deliveryFee} | সর্বমোট বিল:</span>
                              <span className="text-amber-300">৳{ord.total.toLocaleString('bn-BD')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: COMPLAINTS MANAGEMENT */}
              {activeTab === 'complaints' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-[#12141e] border border-amber-500/20">
                    <h4 className="font-bold text-sm text-white">গ্রাহক অভিযোগ ও অনুসন্ধান ({complaints.length})</h4>
                    <p className="text-[11px] text-gray-400">কাস্টমারদের পাঠানো সকল অভিযোগ পর্যালোচনা ও সমাধান করুন</p>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="p-12 text-center bg-[#12141e] rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400">বর্তমানে কোনো অভিযোগ জমা নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                            <div>
                              <span className="font-mono font-bold text-amber-300">{c.id}</span>
                              <span className="text-gray-400 ml-2">{c.customerName} ({c.customerPhone})</span>
                            </div>
                            <select
                              value={c.status}
                              onChange={(e) => updateComplaintStatus(c.id, e.target.value as ComplaintStatus)}
                              className="bg-[#1a1c2a] border border-amber-500/30 rounded-xl px-2 py-1 text-xs text-amber-300 cursor-pointer"
                            >
                              <option value="New">New (নতুন)</option>
                              <option value="Reviewing">Reviewing (পর্যালোচনা)</option>
                              <option value="Processing">Processing (কাজ চলছে)</option>
                              <option value="Resolved">Resolved (সমাধান হয়েছে)</option>
                              <option value="Closed">Closed (বন্ধ)</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-gray-500 block">বিষয়: {c.complaintType}</span>
                            {c.orderId && <span className="text-amber-200 block">অর্ডার আইডি: {c.orderId}</span>}
                            <p className="p-2.5 rounded-lg bg-[#161826] text-gray-200 mt-1">{c.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ANNOUNCEMENTS & OFFERS */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  {/* Form to publish */}
                  <form onSubmit={handlePublishAnnouncement} className="p-5 rounded-2xl bg-[#12141e] border border-amber-500/20 space-y-3">
                    <h4 className="font-bold text-sm text-white">নতুন অফার বা নোটিশ প্রকাশ করুন</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">শিরোনাম:</label>
                        <input
                          type="text"
                          required
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="উদাঃ ঈদ স্পেশাল ৩০% ছাড়"
                          className="w-full bg-[#181a26] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">ব্যাজ / ট্যাগ:</label>
                        <input
                          type="text"
                          value={annBadge}
                          onChange={(e) => setAnnBadge(e.target.value)}
                          placeholder="উদাঃ স্পেশাল অফার"
                          className="w-full bg-[#181a26] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">বিস্তারিত বিবরণ:</label>
                      <textarea
                        required
                        rows={2}
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="অফার বা নোটিশের পূর্ণ বিবরণ লিখুন..."
                        className="w-full bg-[#181a26] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition cursor-pointer"
                    >
                      পাবলিশ করুন
                    </button>
                  </form>

                  {/* Active Announcements */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-amber-300 uppercase tracking-wider">চলমান ঘোষণাসমূহ</h5>
                    {announcements.map((a) => (
                      <div key={a.id} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                              {a.badge || 'আপডেট'}
                            </span>
                            <strong className="text-white text-sm">{a.title}</strong>
                          </div>
                          <p className="text-gray-300 mt-1">{a.content}</p>
                          <span className="text-[10px] text-gray-500 mt-1 block">{a.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(a.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* 1. PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#131520] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-gray-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>{editingProductId ? 'পোশাক তথ্য এডিট করুন' : 'নতুন পোশাক আপলোড করুন'}</span>
              </h4>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={prodBengaliName}
                    onChange={(e) => setProdBengaliName(e.target.value)}
                    placeholder="উদাঃ হেভি এম্ব্রয়ডারি জর্জেট থ্রি-পিস"
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">ইংরেজি নাম *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Georgette Three-Piece Suit"
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">ক্যাটাগরি *</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                  className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">মূল দাম (৳) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">ডিসকাউন্ট দাম (৳)</label>
                  <input
                    type="number"
                    value={prodDiscountPrice ?? ''}
                    onChange={(e) => setProdDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="যেমন: 2150"
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">স্টক পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">সাইজসমূহ (কমা দিয়ে লিখুন)</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="M (৩৮), L (৪০), XL (৪২), XXL (৪৪)"
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">কালারসমূহ (কমা দিয়ে লিখুন)</label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    placeholder="মেরুন, নেভি ব্লু, বটল গ্রিন"
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">বিবরণ ও ফেব্রিক তথ্য *</label>
                <textarea
                  required
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="পোশাকের কাপড়, কারুকাজ, ম্যাচিং ও কোয়ালিটি সম্পর্কিত বিস্তারিত লিখুন..."
                  className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="p-3.5 rounded-2xl bg-[#171926] border border-amber-500/25 space-y-2.5">
                <span className="font-bold text-amber-300 block">প্রোডাক্টের ছবি আপলোড করুন (একাধিক ছবি সমর্থিত)</span>
                <p className="text-[11px] text-gray-400">
                  মোবাইল বা কম্পিউটার থেকে সরাসরি ছবি ফাইল নির্বাচন করুন অথবা ছবির অনলাইন লিংক যুক্ত করুন:
                </p>

                {/* Local File Picker */}
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-semibold flex items-center gap-2 cursor-pointer shadow">
                    <Upload className="w-4 h-4" />
                    <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="অথবা ছবির URL পেস্ট করুন..."
                    className="flex-1 bg-[#1c1e2b] border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 rounded-xl bg-gray-800 text-amber-300 font-semibold cursor-pointer"
                  >
                    যুক্ত করুন
                  </button>
                </div>

                {/* Preview uploaded images */}
                {prodImages.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {prodImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-xl overflow-hidden border border-gray-700 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-rose-400 hover:text-white transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 italic">কোনো ছবি নির্বাচিত নেই। অন্তত একটি ছবি দিন।</p>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow cursor-pointer disabled:opacity-50"
                >
                  {isSavingProduct ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELETE CONFIRMATION MODAL (Strict requirement from brief) */}
      {productToDelete && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#131522] border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-gray-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">
                আপনি কি এই Product টি Delete করতে চান?
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                এটি স্থায়ীভাবে ডাটাবেজ এবং স্টোরেজ থেকে মুছে যাবে। কাস্টমার ওয়েবসাইটে এটি আর প্রদর্শিত হবে না। (পুরোনো অর্ডারের ইতিহাস অক্ষুণ্ণ থাকবে)।
              </p>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1c2b] border border-gray-800 text-left">
              <img
                src={productToDelete.images[0] || '/logo.jpg'}
                alt=""
                className="w-12 h-14 rounded-xl object-cover border border-gray-700 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-400 uppercase font-semibold">{productToDelete.category}</span>
                <h5 className="font-bold text-xs text-white truncate">{productToDelete.bengaliName || productToDelete.name}</h5>
                <span className="text-xs text-amber-300 font-bold">৳{(productToDelete.discountPrice || productToDelete.price).toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#131522] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন</span>
              </h4>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordChangeStatus && (
              <div className={`p-3 rounded-xl text-xs ${
                passwordChangeStatus.type === 'success' 
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200' 
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
              }`}>
                {passwordChangeStatus.text}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">বর্তমান পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full bg-[#1b1d2c] border border-amber-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">নতুন পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন (কমপক্ষে ৫ অক্ষর)"
                  className="w-full bg-[#1b1d2c] border border-amber-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ORDER DETAILS POPUP */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-[#141522] border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-bold text-sm text-white">
                অর্ডার বিস্তারিত: <span className="font-mono text-amber-300">{selectedOrderDetails.id}</span>
              </h4>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-gray-300">
              <div><strong className="text-white">গ্রাহক:</strong> {selectedOrderDetails.customerName}</div>
              <div><strong className="text-white">ফোন:</strong> {selectedOrderDetails.customerPhone}</div>
              <div><strong className="text-white">ঠিকানা:</strong> {selectedOrderDetails.deliveryAddress} ({selectedOrderDetails.cityArea})</div>
              {selectedOrderDetails.orderNote && (
                <div className="p-2 rounded bg-[#1c1e2b] text-amber-200">
                  <strong>গ্রাহকের বিশেষ নোট:</strong> {selectedOrderDetails.orderNote}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#1b1d2c] text-xs space-y-1.5">
              <strong className="text-amber-300 block mb-1">অর্ডারকৃত পণ্যসমূহ:</strong>
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-gray-300">
                  <span>{it.productName} ({it.size}, {it.color}) × {it.quantity}</span>
                  <span className="font-bold text-amber-300">৳{it.subtotal.toLocaleString('bn-BD')}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-700 flex justify-between font-bold text-white">
                <span>সর্বমোট বিল (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-amber-300 text-sm">৳{selectedOrderDetails.total.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`tel:${selectedOrderDetails.customerPhone}`}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-semibold"
              >
                কল করুন
              </a>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
