import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, ShieldCheck, Lock, Package, ShoppingCart, Plus, Edit2, 
  Trash2, Eye, EyeOff, CheckCircle2, AlertTriangle, Megaphone, HelpCircle, 
  Upload, Search, DollarSign, Users, ChevronRight, RefreshCw, LogOut, KeyRound, Filter,
  Layers, Sparkles, ArrowUp, ArrowDown, Check, Tag, FolderPlus
} from 'lucide-react';
import { Product, ProductCategory, OrderStatus, Order, ComplaintStatus, CategoryItem } from '../types';

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
    deleteAnnouncement,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    suggestCategory,
  } = useStore();

  // Admin Login state (Zero hardcoded password!)
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'dashboard' | 'products' | 'categories' | 'orders' | 'complaints' | 'announcements'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'complaints' | 'announcements'>('products');

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
  const [prodCategory, setProdCategory] = useState<string>('শাড়ি');
  const [prodSubCategory, setProdSubCategory] = useState<string>('');
  const [prodTags, setProdTags] = useState<string>('');
  const [prodSizes, setProdSizes] = useState<string>('M, L, XL, XXL');
  const [prodColors, setProdColors] = useState<string>('মেরুন, ব্লু, গোল্ড');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // AI Classification Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; subCategory?: string; confidence: number; reasoning: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Category Management Modal & Actions State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catEnglishName, setCatEnglishName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('/logo.jpg');
  const [catSubCategories, setCatSubCategories] = useState<string[]>([]);
  const [newSubCatInput, setNewSubCatInput] = useState('');
  const [catOrder, setCatOrder] = useState<number>(1);
  const [catIsActive, setCatIsActive] = useState<boolean>(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Category Delete with Product Count Confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

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
    const matchesCategory = productCategoryFilter === 'All' || 
      (p.category && p.category.trim() === productCategoryFilter.trim());
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
    setProdSubCategory(prod.subCategory || '');
    setProdTags(prod.tags ? prod.tags.join(', ') : '');
    setProdSizes(prod.sizes.join(', '));
    setProdColors(prod.colors.join(', '));
    setProdImages(prod.images || ['/logo.jpg']);
    setAiSuggestion(null);
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
    const defaultCat = categories.length > 0 ? categories[0].name : 'শাড়ি';
    setProdCategory(defaultCat);
    const matchedObj = categories.find((c) => c.name === defaultCat);
    setProdSubCategory(matchedObj?.subCategories?.[0] || '');
    setProdTags('');
    setProdSizes('M, L, XL, XXL');
    setProdColors('মেরুন, ব্লু, গোল্ড');
    setProdImages([]);
    setAiSuggestion(null);
    setIsProductModalOpen(true);
  };

  // Request Smart AI Category Classification Suggestion
  const handleRequestAiSuggestion = async () => {
    const textToAnalyze = `${prodBengaliName} ${prodName}`.trim();
    if (!textToAnalyze) return;
    setIsSuggesting(true);
    try {
      const res = await suggestCategory(textToAnalyze, prodDescription);
      setAiSuggestion(res);
    } catch (err) {
      console.error('Failed to get AI category suggestion:', err);
    } finally {
      setIsSuggesting(false);
    }
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
    const parsedTags = prodTags.split(',').map((t) => t.trim()).filter(Boolean);

    const productPayload = {
      name: prodName,
      bengaliName: prodBengaliName || prodName,
      description: prodDescription,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
      stock: Number(prodStock),
      category: prodCategory,
      subCategory: prodSubCategory ? prodSubCategory.trim() : undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
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

  // Category Management Handlers
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatEnglishName('');
    setCatDescription('');
    setCatImage('/logo.jpg');
    setCatSubCategories([]);
    setNewSubCatInput('');
    setCatOrder((categories.length || 0) + 1);
    setCatIsActive(true);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatEnglishName(cat.englishName || '');
    setCatDescription(cat.description || '');
    setCatImage(cat.image || '/logo.jpg');
    setCatSubCategories([...(cat.subCategories || [])]);
    setNewSubCatInput('');
    setCatOrder(cat.order);
    setCatIsActive(cat.isActive !== false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setIsSavingCategory(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name: catName.trim(),
          englishName: catEnglishName.trim() || undefined,
          description: catDescription.trim() || undefined,
          image: catImage.trim() || '/logo.jpg',
          subCategories: catSubCategories,
          order: Number(catOrder) || 1,
          isActive: catIsActive,
        });
      } else {
        await addCategory({
          name: catName.trim(),
          englishName: catEnglishName.trim() || undefined,
          description: catDescription.trim() || undefined,
          image: catImage.trim() || '/logo.jpg',
          subCategories: catSubCategories,
          order: Number(catOrder) || 1,
          isActive: catIsActive,
        });
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Save category error:', err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      await deleteCategory(categoryToDelete.id, true);
      setDeleteSuccessMessage(`"${categoryToDelete.name}" ক্যাটাগরি সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে!`);
      setTimeout(() => setDeleteSuccessMessage(''), 3500);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Delete category error:', err);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleMoveCategoryOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    await reorderCategories(newOrder.map((c) => c.id));
  };

  const handleToggleCategoryActive = async (cat: CategoryItem) => {
    await updateCategory(cat.id, { isActive: !cat.isActive });
  };

  const handleAddSubCategoryTag = () => {
    if (!newSubCatInput.trim()) return;
    const tag = newSubCatInput.trim();
    if (!catSubCategories.includes(tag)) {
      setCatSubCategories([...catSubCategories, tag]);
    }
    setNewSubCatInput('');
  };

  const handleRemoveSubCategoryTag = (tagToRemove: string) => {
    setCatSubCategories(catSubCategories.filter((t) => t !== tagToRemove));
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

  const categoriesList: string[] = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => c.name);
    }
    return [
      'শাড়ি',
      'থ্রি-পিস',
      'টি-শার্ট',
      'গেঞ্জি',
      'ছেলেদের পোশাক',
      'কসমেটিকস',
      'চুড়ি',
      'জুয়েলারি',
      'অন্যান্য'
    ];
  }, [categories]);

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

              {/* Category & Sub-Category Control Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-[#181a26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>ক্যাটাগরি ও সাব-ক্যাটাগরি</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'categories' ? 'bg-stone-950 text-amber-300' : 'bg-gray-800 text-gray-300'
                }`}>
                  {categories.length}
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

              {/* TAB: CATEGORY & SUB-CATEGORY MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="p-4 rounded-2xl bg-[#12141e] border border-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                    <div>
                      <h4 className="font-bold text-base text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-400" />
                        <span>ক্যাটাগরি ও সাব-ক্যাটাগরি কন্ট্রোল (Real Database)</span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        ক্যাটাগরি তৈরি, নাম ও ছবি পরিবর্তন, সাব-ক্যাটাগরি পরিচালনা, ক্রম পরিবর্তন এবং শো/হাইড করুন
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddCategory}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(217,119,6,0.35)] transition cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ নতুন ক্যাটাগরি তৈরি করুন</span>
                    </button>
                  </div>

                  {/* Categories Grid */}
                  {categories.length === 0 ? (
                    <div className="p-12 text-center bg-[#131520] rounded-2xl border border-gray-800">
                      <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                      <button
                        type="button"
                        onClick={handleOpenAddCategory}
                        className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
                      >
                        প্রথম ক্যাটাগরি তৈরি করুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((cat, index) => {
                        const prodCount = products.filter((p) => p.category && p.category.trim() === cat.name.trim()).length;
                        return (
                          <div
                            key={cat.id}
                            className={`p-4 rounded-2xl bg-[#12141e] border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              cat.isActive !== false ? 'border-amber-500/20' : 'border-gray-800 opacity-60'
                            }`}
                          >
                            {/* Left: Info */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              {/* Order Badge */}
                              <div className="w-7 h-7 rounded-lg bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold shrink-0">
                                {index + 1}
                              </div>

                              {/* Image Preview */}
                              <div className="w-12 h-12 rounded-xl bg-black/40 border border-gray-800 overflow-hidden shrink-0">
                                <img
                                  src={cat.image || '/logo.jpg'}
                                  alt={cat.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Title & Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="font-bold text-sm text-white">{cat.name}</h5>
                                  {cat.englishName && (
                                    <span className="text-xs text-gray-400 font-mono">({cat.englishName})</span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    {prodCount} টি প্রোডাক্ট
                                  </span>
                                  {cat.isActive === false && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      লুকানো (Hidden)
                                    </span>
                                  )}
                                </div>

                                {cat.description && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cat.description}</p>
                                )}

                                {/* Subcategories */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <span className="text-[11px] text-gray-400 font-medium">সাব-ক্যাটাগরি:</span>
                                  {cat.subCategories && cat.subCategories.length > 0 ? (
                                    cat.subCategories.map((sub) => (
                                      <span
                                        key={sub}
                                        className="px-2 py-0.5 rounded-md bg-[#1a1c2c] border border-amber-500/25 text-amber-300 text-[11px]"
                                      >
                                        {sub}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-gray-500 italic">সাব-ক্যাটাগরি যুক্ত করা হয়নি</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              {/* Order controls */}
                              <div className="flex items-center gap-1 bg-[#181a26] p-1 rounded-xl border border-gray-800">
                                <button
                                  type="button"
                                  onClick={() => handleMoveCategoryOrder(index, 'up')}
                                  disabled={index === 0}
                                  className="p-1.5 text-gray-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-gray-400 transition cursor-pointer"
                                  title="উপরে নিন"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveCategoryOrder(index, 'down')}
                                  disabled={index === categories.length - 1}
                                  className="p-1.5 text-gray-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-gray-400 transition cursor-pointer"
                                  title="নিচে নিন"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Show / Hide Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryActive(cat)}
                                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                                  cat.isActive !== false
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                                }`}
                                title={cat.isActive !== false ? 'গ্রাহকদের দেখানো হচ্ছে' : 'লুকানো রয়েছে'}
                              >
                                {cat.isActive !== false ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="hidden sm:inline">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="hidden sm:inline">Hidden</span>
                                  </>
                                )}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleEditCategory(cat)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setCategoryToDelete(cat)}
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

              {/* Category & Sub-Category with Smart AI Assist */}
              <div className="space-y-2.5 p-3 rounded-2xl bg-[#171926] border border-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300">ক্যাটাগরি ও সাব-ক্যাটাগরি নির্বাচন</span>
                  </div>

                  {/* AI Suggestion Button */}
                  <button
                    type="button"
                    onClick={handleRequestAiSuggestion}
                    disabled={isSuggesting || (!prodBengaliName && !prodName)}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 self-start sm:self-auto"
                    title="নাম ও বিবরণ অনুযায়ী স্মার্ট AI ক্যাটাগরি পরামর্শ নিন"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isSuggesting ? 'animate-spin' : ''}`} />
                    <span>{isSuggesting ? 'AI বিশ্লেষণ করছে...' : '✨ AI ক্যাটাগরি পরামর্শ'}</span>
                  </button>
                </div>

                {/* AI Suggestion Banner if available */}
                {aiSuggestion && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fade-in">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-amber-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                        <span>AI প্রস্তাব:</span>
                        <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {aiSuggestion.category}
                        </span>
                        {aiSuggestion.subCategory && (
                          <span className="text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            › {aiSuggestion.subCategory}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          ({Math.round(aiSuggestion.confidence * 100)}% মিল)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{aiSuggestion.reasoning}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setProdCategory(aiSuggestion.category);
                          if (aiSuggestion.subCategory) {
                            setProdSubCategory(aiSuggestion.subCategory);
                          }
                          setAiSuggestion(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Check className="w-3 h-3" />
                        <span>গ্রহণ করুন (Apply)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSuggestion(null)}
                        className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">মূল ক্যাটাগরি *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setProdCategory(newCat);
                        const matchedCat = categories.find((c) => c.name === newCat);
                        if (matchedCat && matchedCat.subCategories && matchedCat.subCategories.length > 0) {
                          setProdSubCategory(matchedCat.subCategories[0]);
                        } else {
                          setProdSubCategory('');
                        }
                      }}
                      className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">সাব-ক্যাটাগরি (Sub-Category)</label>
                    {(() => {
                      const matchedCat = categories.find((c) => c.name === prodCategory);
                      const currentSubs = matchedCat?.subCategories || [];
                      if (currentSubs.length > 0) {
                        return (
                          <select
                            value={prodSubCategory}
                            onChange={(e) => setProdSubCategory(e.target.value)}
                            className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white cursor-pointer"
                          >
                            <option value="">-- সাব-ক্যাটাগরি নির্বাচন করুন (ঐচ্ছিক) --</option>
                            {currentSubs.map((sub) => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="text"
                          value={prodSubCategory}
                          onChange={(e) => setProdSubCategory(e.target.value)}
                          placeholder="যেমন: জামদানি, কাতান, কটন..."
                          className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                        />
                      );
                    })()}
                  </div>
                </div>
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

              <div>
                <label className="block text-gray-300 font-semibold mb-1">ট্যাগসমূহ (Tags - কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={prodTags}
                  onChange={(e) => setProdTags(e.target.value)}
                  placeholder="যেমন: জামদানি, সিল্ক, পার্টি ওয়্যার, প্রিমিয়াম, নতুন"
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

      {/* 5. CATEGORY ADD / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#131520] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-gray-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{editingCategoryId ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি তৈরি করুন'}</span>
              </h4>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">ক্যাটাগরির বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="যেমন: শাড়ি, থ্রি-পিস, জুয়েলারি..."
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">ইংরেজি নাম (English Name)</label>
                  <input
                    type="text"
                    value={catEnglishName}
                    onChange={(e) => setCatEnglishName(e.target.value)}
                    placeholder="e.g. Saree, Three-Piece, Jewelry..."
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">ক্যাটাগরি ছবি URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="https://... অথবা /logo.jpg"
                    className="flex-1 bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                  {catImage && (
                    <div className="w-9 h-9 rounded-lg bg-black border border-gray-700 overflow-hidden shrink-0">
                      <img src={catImage} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Categories Manager */}
              <div className="p-3 rounded-2xl bg-[#171926] border border-amber-500/20 space-y-2">
                <label className="block text-amber-300 font-bold">
                  সাব-ক্যাটাগরি পরিচালনা (Sub-Categories)
                </label>
                <p className="text-[11px] text-gray-400">
                  এই ক্যাটাগরির অন্তর্ভুক্ত সাব-ক্যাটাগরিগুলো যুক্ত করুন (যেমন: শাড়ির ক্ষেত্রে জামদানি, কাতান, সিল্ক, কটন):
                </p>

                {/* Subcategory Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-[#12131d] border border-gray-800">
                  {catSubCategories.length === 0 ? (
                    <span className="text-[11px] text-gray-500 italic">কোনো সাব-ক্যাটাগরি এখনো যোগ করা হয়নি</span>
                  ) : (
                    catSubCategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubCategoryTag(sub)}
                          className="hover:text-rose-400 cursor-pointer ml-0.5"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Subcategory input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubCatInput}
                    onChange={(e) => setNewSubCatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubCategoryTag();
                      }
                    }}
                    placeholder="সাব-ক্যাটাগরির নাম লিখে যোগ করুন (যেমন: জামদানি)"
                    className="flex-1 bg-[#1b1d2c] border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategoryTag}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow shrink-0"
                  >
                    + যোগ করুন
                  </button>
                </div>
              </div>

              {/* Order & Display Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">প্রদর্শনের ক্রম (Order)</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                    <input
                      type="checkbox"
                      checked={catIsActive}
                      onChange={(e) => setCatIsActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="font-semibold">গ্রাহকদের জন্য সক্রিয় রাখুন (Show to customers)</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="এই ক্যাটাগরির পোশাকের বর্ণনা..."
                  className="w-full bg-[#1b1d2c] border border-amber-500/20 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-[0_4px_15px_rgba(217,119,6,0.35)] transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingCategory ? 'সংরক্ষণ হচ্ছে...' : editingCategoryId ? 'আপডেট করুন' : 'ক্যাটাগরি তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CATEGORY DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (() => {
        const productCount = products.filter(
          (p) => p.category && p.category.trim() === categoryToDelete.name.trim()
        ).length;

        return (
          <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="relative w-full max-w-md bg-[#131520] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-gray-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">ক্যাটাগরি মুছে ফেলার নিশ্চয়তা</h4>
                  <p className="text-xs text-rose-300 font-semibold font-mono">{categoryToDelete.name}</p>
                </div>
              </div>

              {productCount > 0 ? (
                <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-rose-300">
                    <span>⚠️ সতর্কতা:</span>
                    <span>এই ক্যাটাগরিতে {productCount} টি সক্রিয় প্রোডাক্ট রয়েছে!</span>
                  </p>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    এই ক্যাটাগরি মুছে ফেললে সংশ্লিষ্ট প্রোডাক্টগুলো স্থায়ীভাবে মুছে যাবে না, তবে তাদের ক্যাটাগরি 'অন্যান্য'-তে চলে যাবে। আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-300">
                  আপনি কি নিশ্চিতভাবে <strong>"{categoryToDelete.name}"</strong> ক্যাটাগরি ডাটাবেজ থেকে মুছে ফেলতে চান?
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  disabled={isDeletingCategory}
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isDeletingCategory}
                  onClick={handleConfirmDeleteCategory}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isDeletingCategory ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ক্যাটাগরি মুছে ফেলুন'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
