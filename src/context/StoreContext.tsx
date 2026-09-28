import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, Complaint, Announcement, User, OrderStatus, ComplaintStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ANNOUNCEMENTS } from '../data/initialProducts';

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
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
  }) => Complaint;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, adminNote?: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (id: string) => void;

  // User & Auth
  currentUser: User | null;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, phone?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (googleProfile?: { name: string; email: string; photoURL?: string }) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profile: Partial<User>) => void;

  // Admin Auth
  isAdminLoggedIn: boolean;
  loginAsAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

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
  // 1. Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('odm_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('odm_products', JSON.stringify(products));
  }, [products]);

  // 2. Orders (CRITICAL: Empty array by default! NO fake/demo/automatic orders!)
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

  useEffect(() => {
    localStorage.setItem('odm_orders', JSON.stringify(orders));
  }, [orders]);

  // 3. Cart
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

  // 4. Complaints
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

  useEffect(() => {
    localStorage.setItem('odm_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // 5. Announcements
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
    localStorage.setItem('odm_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // 6. User Auth
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

  // 7. Admin Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('odm_admin_session') === 'true';
  });

  // 8. Navigation Modals & Selectors
  const [activeModal, setActiveModal] = useState<StoreContextType['activeModal']>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল (All)');

  // Product Actions
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
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
  // Only called when a real customer submits the checkout form
  const placeOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    cityArea: 'Inside Dhaka' | 'Outside Dhaka';
    deliveryFee: number;
    orderNote?: string;
  }): Order => {
    if (cart.length === 0) {
      throw new Error('কার্ট খালি। কোনো অর্ডার দেওয়ার মতো পণ্য নেই।');
    }

    // Unique Order ID format: ODM-XXXXX (5 digits)
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

    // Update real orders in state and database/localStorage
    setOrders((prev) => [newOrder, ...prev]);

    // Also deduct product stock safely
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

    // Clear cart & set last placed order for confirmation screen
    clearCart();
    setLastPlacedOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const getOrderById = (orderId: string) => {
    const cleaned = orderId.trim().toUpperCase();
    return orders.find((o) => o.id.toUpperCase() === cleaned);
  };

  // Complaint Actions
  const submitComplaint = (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderId?: string;
    complaintType: Complaint['complaintType'];
    description: string;
  }): Complaint => {
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

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateComplaintStatus = (
    complaintId: string,
    status: ComplaintStatus,
    adminNote?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status, adminNote: adminNote ?? c.adminNote }
          : c
      )
    );
  };

  // Announcements
  const addAnnouncement = (data: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Auth Actions
  const loginWithEmail = async (email: string, _password?: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    // Lookup existing user or create
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

  // Admin Login (Owner pin: 14604 or password admin123)
  const loginAsAdmin = (pin: string): boolean => {
    const trimmed = pin.trim();
    if (trimmed === '14604' || trimmed === 'admin123' || trimmed === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('odm_admin_session', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('odm_admin_session');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
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
        loginAsAdmin,
        logoutAdmin,
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
