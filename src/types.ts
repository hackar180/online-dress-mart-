export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type ComplaintStatus = 'New' | 'Reviewing' | 'Processing' | 'Resolved' | 'Closed';

export type ProductCategory = 
  | 'শাড়ি' 
  | 'থ্রি-পিস' 
  | 'টি-শার্ট' 
  | 'গেঞ্জি' 
  | 'ছেলেদের পোশাক' 
  | 'কসমেটিকস' 
  | 'চুড়ি' 
  | 'জুয়েলারি' 
  | 'অন্যান্য'
  | string;

export interface CategoryItem {
  id: string;
  name: string; // e.g. "শাড়ি"
  englishName?: string; // e.g. "Saree"
  description?: string;
  image?: string;
  subCategories: string[]; // e.g. ['জামদানি', 'কাতান', 'সিল্ক', 'কটন']
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface FilterCriteria {
  category: string;
  subCategory?: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
  sizes: string[];
  discountOnly: boolean;
  inStockOnly: boolean;
  minRating: number;
}

export interface Product {
  id: string;
  name: string;
  bengaliName: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  category: string;
  subCategory?: string;
  images: string[];
  tags?: string[];
  rating?: number;
  ratingCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isPopular?: boolean;
  status: 'In Stock' | 'Out of Stock' | 'Pre-order';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Order {
  id: string; // e.g. ODM-84920
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  cityArea: 'Inside Dhaka' | 'Outside Dhaka';
  deliveryFee: number;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  total: number;
  orderNote?: string;
  status: OrderStatus;
  paymentMethod: 'Cash on Delivery';
  userId?: string;
  createdAt: string;
}

export interface Complaint {
  id: string; // e.g. ODM-CMP-1042
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderId?: string;
  complaintType: 'ডেলিভারি বিলম্ব (Delivery Delay)' | 'সাইজ বা কালার সমস্যা (Size/Color Issue)' | 'পণ্য ক্ষতিগ্রস্ত (Damaged Product)' | 'পেমেন্ট সমস্যা (Payment Issue)' | 'অন্যান্য (Other)';
  description: string;
  status: ComplaintStatus;
  adminNote?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  badge?: string;
  date: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cityArea?: 'Inside Dhaka' | 'Outside Dhaka';
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
