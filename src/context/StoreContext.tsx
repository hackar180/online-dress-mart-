import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, Complaint, Announcement, User, OrderStatus, ComplaintStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ANNOUNCEMENTS } from '../data/initialProducts';

interface StoreContextType {
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders (STRICT: Real orders only, 0 initially!)
  orders: Order[];
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    cityArea: 'Inside Dhaka' | 'Outside Dhaka';
    deliveryFee: number;
    orderNote?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;

  // Complaints
  complaints: Complaint[];
  submitComplaint: (complaintData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderId?: string;
    complaintType: Complaint['complaintType'];
    description: string;
  }) => Promise<Complaint>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, adminNote?: string) => Promise<void>;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // User & Auth
  currentUser: User | null;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, phone?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (googleProfile?: { name: string; email: string; photoURL?: string }) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profile: Partial<User>) => void;

  // Admin Auth (Server-side verified, NO hardcoded password in frontend!)
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  loginAsAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // UI Navigation / Modals
  activeModal: 'none' | 'login' | 'cart' | 'checkout' | 'orderConfirmation' | 'productDetails' | 'userProfile' | 'complaintBox' | 'adminPanel' | 'search';
  setActiveModal: (modal: 'none' | 'login' | 'cart' | 'checkout' | 'orderConfirmation' | 'productDetails' | 'userProfile' | 'complaintBox' | 'adminPanel' | 'search') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Admin Authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('odm_admin_token') || null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Helper for admin headers
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    };
  }, [adminToken]);

  // Verify stored token on boot
  useEffect(() => {
    if (adminToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsAdminLoggedIn(true);
          } else {
            setIsAdminLoggedIn(false);
            setAdminToken(null);
            localStorage.removeItem('odm_admin_token');
          }
        })
        .catch(() => {
          setIsAdminLoggedIn(false);
        });
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [adminToken]);

  // 2. Real Database Products State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          localStorage.setItem('odm_products', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch real-time products, fallback to local', e);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch products initially and subscribe to Real-time SSE Stream
  useEffect(() => {
    refreshProducts();

    // Setup Server-Sent Events (SSE) for instant real-time sync!
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/products/stream');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && Array.isArray(parsed.data)) {
            setProducts(parsed.data);
          }
        } catch (err) {
          console.warn('SSE parse error:', err);
        }
      };
      eventSource.onerror = () => {
        // Close on error; the periodic fallback below will keep it fresh
        eventSource?.close();
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
    }

    // Periodic safety sync every 15 seconds
    const interval = setInterval(refreshProducts, 15000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [refreshProducts]);

  // 3. Orders (STRICT: Real orders only, 0 initially!)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('odm_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse orders', e);
      }
    }
    return []; // ZERO orders initially
  });

  // If Admin is logged in, fetch all real orders from the database
  const refreshOrders = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/orders', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          localStorage.setItem('odm_orders', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('Orders fetch error:', e);
    }
  }, [adminToken, getAuthHeaders]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      refreshOrders();
    }
  }, [isAdminLoggedIn, refreshOrders]);

  // 4. Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('odm_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('odm_cart', JSON.stringify(cart));
  }, [cart]);

  // 5. Complaints
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('odm_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse complaints', e);
      }
    }
    return [];
  });

  const refreshComplaints = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/complaints', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setComplaints(data);
          localStorage.setItem('odm_complaints', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('Complaints fetch error:', e);
    }
  }, [adminToken, getAuthHeaders]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      refreshComplaints();
    }
  }, [isAdminLoggedIn, refreshComplaints]);

  // 6. Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('odm_announcements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse announcements', e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnnouncements(data);
          localStorage.setItem('odm_announcements', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  // 7. User Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('odm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('odm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('odm_user');
    }
  }, [currentUser]);

  // 8. Navigation Modals & Selectors
  const [activeModal, setActiveModal] = useState<StoreContextType['activeModal']>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল (All)');

  // Product Actions (Real Backend Database + Storage)
  const addProduct = async (newProdData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProdData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add product');
      }
      const created: Product = await res.json();
      setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      return created;
    } catch (e: any) {
      // Local fallback
      const fallback: Product = {
        ...newProdData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update product');
      }
      const savedProd: Product = await res.json();
      setProducts((prev) => prev.map((item) => (item.id === id ? savedProd : item)));
      return savedProd;
    } catch {
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch {
      setProducts((prev) => prev.filter((item) => item.id !== id));
      return true;
    }
  };

  // Cart Actions
  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateCartQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const effectivePrice = item.product.discountPrice ?? item.product.price;
    return sum + effectivePrice * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // STRICT ORDER PLACEMENT FLOW
  // Preserves full product snapshot so deleting a product does NOT break past orders!
  const placeOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    cityArea: 'Inside Dhaka' | 'Outside Dhaka';
    deliveryFee: number;
    orderNote?: string;
  }): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('কার্ট খালি। কোনো অর্ডার দেওয়ার মতো পণ্য নেই।');
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ODM-${randomDigits}`;

    const itemsSummary = cart.map((item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.bengaliName || item.product.name,
        productImage: item.product.images[0] || '/logo.jpg',
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
      };
    });

    const subtotal = itemsSummary.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + orderData.deliveryFee;

    const newOrder: Order = {
      id: orderId,
      customerName: orderData.customerName.trim(),
      customerPhone: orderData.customerPhone.trim(),
      customerEmail: orderData.customerEmail?.trim(),
      deliveryAddress: orderData.deliveryAddress.trim(),
      cityArea: orderData.cityArea,
      deliveryFee: orderData.deliveryFee,
      items: itemsSummary,
      subtotal,
      total,
      orderNote: orderData.orderNote?.trim(),
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };

    // Send to Real Backend Database
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setOrders((prev) => [savedOrder, ...prev]);
      } else {
        setOrders((prev) => [newOrder, ...prev]);
      }
    } catch {
      setOrders((prev) => [newOrder, ...prev]);
    }

    // Deduct stock locally as well
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = cart.find((c) => c.product.id === prod.id);
        if (orderedItem) {
          const newStock = Math.max(0, prod.stock - orderedItem.quantity);
          return {
            ...prod,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : prod.status,
          };
        }
        return prod;
      })
    );

    clearCart();
    setLastPlacedOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn('Update order status error', e);
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const getOrderById = (orderId: string) => {
    const cleaned = orderId.trim().toUpperCase();
    return orders.find((o) => o.id.toUpperCase() === cleaned);
  };

  // Complaint Actions
  const submitComplaint = async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderId?: string;
    complaintType: Complaint['complaintType'];
    description: string;
  }): Promise<Complaint> => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `ODM-CMP-${randomDigits}`;

    const newComplaint: Complaint = {
      id: complaintId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim(),
      orderId: data.orderId?.trim(),
      complaintType: data.complaintType,
      description: data.description.trim(),
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint),
      });
    } catch {}

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    adminNote?: string
  ) => {
    try {
      await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNote }),
      });
    } catch {}

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status, adminNote: adminNote ?? c.adminNote }
          : c
      )
    );
  };

  // Announcements
  const addAnnouncement = async (data: Omit<Announcement, 'id'>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setAnnouncements((prev) => [created, ...prev]);
        return;
      }
    } catch {}

    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {}
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // User Auth Actions
  const loginWithEmail = async (email: string, _password?: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    const user: User = {
      id: `usr-${Date.now()}`,
      name: trimmedEmail.split('@')[0],
      email: trimmedEmail,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    return true;
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    phone?: string,
    _password?: string
  ): Promise<boolean> => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    return true;
  };

  const loginWithGoogle = async (googleProfile?: {
    name: string;
    email: string;
    photoURL?: string;
  }): Promise<boolean> => {
    const user: User = {
      id: `usr-google-${Date.now()}`,
      name: googleProfile?.name || 'Customer Account',
      email: googleProfile?.email || 'customer@gmail.com',
      photoURL: googleProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      ...profile,
    });
  };

  // Admin Authentication Actions (Verified on Server, ZERO plain text in client!)
  const loginAsAdmin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setIsAdminLoggedIn(true);
        localStorage.setItem('odm_admin_token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'ভুল অ্যাডমিন পাসওয়ার্ড।' };
      }
    } catch {
      return { success: false, error: 'সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।' };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('odm_admin_token');
  };

  const changeAdminPassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'পাসওয়ার্ড পরিবর্তন করা যায়নি।' };
      }
    } catch {
      return { success: false, error: 'সার্ভার এরর।' };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        complaints,
        submitComplaint,
        updateComplaintStatus,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        currentUser,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        isAdminLoggedIn,
        adminToken,
        loginAsAdmin,
        logoutAdmin,
        changeAdminPassword,
        activeModal,
        setActiveModal,
        selectedProduct,
        setSelectedProduct,
        lastPlacedOrder,
        setLastPlacedOrder,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
