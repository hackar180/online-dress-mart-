import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order, Complaint, Announcement, OrderStatus, ComplaintStatus, CategoryItem } from '../src/types';
import { INITIAL_PRODUCTS, INITIAL_ANNOUNCEMENTS } from '../src/data/initialProducts';
import { INITIAL_CATEGORIES } from '../src/data/initialCategories';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Helper to hash passwords securely
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

interface AdminData {
  salt: string;
  hash: string;
  updatedAt: string;
  sessions: { token: string; expiresAt: number }[];
}

export class Database {
  private static instance: Database;
  private sseClients: Set<(data: any) => void> = new Set();

  private constructor() {
    ensureDirs();
    this.initAdmin();
    this.initCategories();
    this.initProducts();
    this.initOrders();
    this.initComplaints();
    this.initAnnouncements();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // --- SSE Real-time Broadcaster ---
  public subscribeSSE(client: (data: any) => void) {
    this.sseClients.add(client);
  }

  public unsubscribeSSE(client: (data: any) => void) {
    this.sseClients.delete(client);
  }

  private broadcastProducts(products: Product[]) {
    const payload = JSON.stringify({ type: 'products_updated', data: products });
    this.sseClients.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.warn('SSE client broadcast error', e);
      }
    });
  }

  private broadcastCategories(categories: CategoryItem[]) {
    const payload = JSON.stringify({ type: 'categories_updated', data: categories });
    this.sseClients.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.warn('SSE client broadcast error', e);
      }
    });
  }

  // --- 1. Admin Authentication ---
  private initAdmin() {
    if (!fs.existsSync(ADMIN_FILE)) {
      // Initial Admin Password from owner brief: "meghna.com"
      // Hashed and salted immediately on the server, NEVER exposed to client!
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('meghna.com', salt);
      const adminData: AdminData = {
        salt,
        hash,
        updatedAt: new Date().toISOString(),
        sessions: [],
      };
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf-8');
    }
  }

  private getAdminData(): AdminData {
    try {
      const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      this.initAdmin();
      return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    }
  }

  private saveAdminData(data: AdminData) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public verifyAdminPassword(password: string): boolean {
    const data = this.getAdminData();
    const computed = hashPassword(password, data.salt);
    return computed === data.hash;
  }

  public createAdminSession(): string {
    const data = this.getAdminData();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days session
    // Purge expired sessions
    data.sessions = data.sessions.filter((s) => s.expiresAt > Date.now());
    data.sessions.push({ token, expiresAt });
    this.saveAdminData(data);
    return token;
  }

  public validateAdminToken(token: string): boolean {
    if (!token) return false;
    const data = this.getAdminData();
    const session = data.sessions.find((s) => s.token === token);
    if (!session) return false;
    if (session.expiresAt <= Date.now()) {
      data.sessions = data.sessions.filter((s) => s.token !== token);
      this.saveAdminData(data);
      return false;
    }
    return true;
  }

  public changeAdminPassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
    const data = this.getAdminData();
    if (hashPassword(oldPassword, data.salt) !== data.hash) {
      return { success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
    }
    if (!newPassword || newPassword.length < 5) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৫ অক্ষরের হতে হবে।' };
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);
    data.salt = newSalt;
    data.hash = newHash;
    data.updatedAt = new Date().toISOString();
    this.saveAdminData(data);
    return { success: true, message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' };
  }

  // --- 2. Categories Management ---
  private initCategories() {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(INITIAL_CATEGORIES, null, 2), 'utf-8');
    }
  }

  public getCategories(): CategoryItem[] {
    try {
      const raw = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public saveCategories(categories: CategoryItem[]) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
    this.broadcastCategories(categories);
  }

  public addCategory(catData: Omit<CategoryItem, 'id' | 'createdAt'>): CategoryItem {
    const categories = this.getCategories();
    const newCategory: CategoryItem = {
      ...catData,
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order: catData.order ?? (categories.length + 1),
      isActive: catData.isActive ?? true,
      subCategories: Array.isArray(catData.subCategories) ? catData.subCategories : [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCategory];
    this.saveCategories(updated);
    return newCategory;
  }

  public updateCategory(id: string, updatedFields: Partial<CategoryItem>): CategoryItem | null {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const oldName = categories[index].name;
    const newName = updatedFields.name;

    categories[index] = {
      ...categories[index],
      ...updatedFields,
    };
    this.saveCategories(categories);

    // If category name was renamed, also seamlessly update matching products!
    if (newName && newName !== oldName) {
      const products = this.getProducts();
      let modified = false;
      products.forEach((p) => {
        if (p.category === oldName) {
          p.category = newName;
          modified = true;
        }
      });
      if (modified) {
        this.saveProducts(products);
      }
    }

    return categories[index];
  }

  public deleteCategory(id: string, force: boolean = false): { success: boolean; productCount?: number; message?: string } {
    const categories = this.getCategories();
    const cat = categories.find((c) => c.id === id);
    if (!cat) {
      return { success: false, message: 'ক্যাটাগরি পাওয়া যায়নি।' };
    }

    // Check if any product belongs to this category
    const products = this.getProducts();
    const matchingProducts = products.filter((p) => p.category === cat.name);

    if (matchingProducts.length > 0 && !force) {
      return {
        success: false,
        productCount: matchingProducts.length,
        message: `এই ক্যাটাগরিতে বর্তমানে ${matchingProducts.length} টি প্রোডাক্ট রয়েছে। মুছে ফেলতে কনফার্ম করুন।`,
      };
    }

    // If force delete is true, reassign products to 'অন্যান্য' so they don't break
    if (matchingProducts.length > 0 && force) {
      products.forEach((p) => {
        if (p.category === cat.name) {
          p.category = 'অন্যান্য';
        }
      });
      this.saveProducts(products);
    }

    const filtered = categories.filter((c) => c.id !== id);
    this.saveCategories(filtered);
    return { success: true };
  }

  public reorderCategories(orderedIds: string[]): CategoryItem[] {
    const categories = this.getCategories();
    const map = new Map(categories.map((c) => [c.id, c]));
    const reordered: CategoryItem[] = [];

    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        item.order = idx + 1;
        reordered.push(item);
        map.delete(id);
      }
    });

    // Append any remaining
    map.forEach((item) => {
      item.order = reordered.length + 1;
      reordered.push(item);
    });

    this.saveCategories(reordered);
    return reordered;
  }

  // --- Smart AI Category Suggestion Engine ---
  public suggestCategory(name: string, description: string = ''): { category: string; subCategory?: string; confidence: number; reasoning: string } {
    const text = `${name} ${description}`.toLowerCase();

    // 1. শাড়ি
    if (text.includes('শাড়ি') || text.includes('শাড়ী') || text.includes('saree') || text.includes('কাতান') || text.includes('বেনারসি') || text.includes('জামদানি') || text.includes('অরগাঞ্জা') || text.includes('আঁচল') || text.includes('ব্লাউজ')) {
      let sub = '';
      if (text.includes('কাতান')) sub = 'কাতান';
      else if (text.includes('বেনারসি')) sub = 'বেনারসি';
      else if (text.includes('জামদানি')) sub = 'জামদানি';
      else if (text.includes('অরগাঞ্জা') || text.includes('টিস্যু')) sub = 'অরগাঞ্জা';
      else if (text.includes('সিল্ক')) sub = 'সিল্ক';
      else if (text.includes('সুতি') || text.includes('কটন')) sub = 'সুতি / কটন';
      return {
        category: 'শাড়ি',
        subCategory: sub || undefined,
        confidence: 0.95,
        reasoning: 'পণ্যের নাম ও বিবরণে ঐতিহ্যবাহী শাড়ির ফেব্রিক ও নকশা পাওয়া গেছে।',
      };
    }

    // 2. থ্রি-পিস
    if (text.includes('থ্রি-পিস') || text.includes('থ্রিপিস') || text.includes('three-piece') || text.includes('three piece') || text.includes('কামিজ') || text.includes('সেলোয়ার') || text.includes('ওড়না') || text.includes('ওড়না') || text.includes('কাশ্মীরি') || text.includes('কারচুপি ড্রেস')) {
      let sub = '';
      if (text.includes('জর্জেট')) sub = 'জর্জেট';
      else if (text.includes('ভেলভেট')) sub = 'ভেলভেট';
      else if (text.includes('লন')) sub = 'লন';
      else if (text.includes('সুতি')) sub = 'সুতি';
      else sub = 'পার্টি থ্রি-পিস';
      return {
        category: 'থ্রি-পিস',
        subCategory: sub,
        confidence: 0.94,
        reasoning: 'কামিজ, ওড়না ও সেলোয়ার সম্পর্কিত তথ্য অনুযায়ী থ্রি-পিস হিসেবে শনাক্ত হয়েছে।',
      };
    }

    // 3. টি-শার্ট
    if (text.includes('টি-শার্ট') || text.includes('t-shirt') || text.includes('tshirt') || text.includes('টিশার্ট') || text.includes('পোলো') || text.includes('ড্রপ শোল্ডার')) {
      let sub = 'রাউন্ড নেক';
      if (text.includes('পোলো') || text.includes('কলার')) sub = 'কলার / পোলো';
      else if (text.includes('ড্রপ শোল্ডার')) sub = 'ড্রপ শোল্ডার';
      else if (text.includes('প্রিন্টেড') || text.includes('graphic')) sub = 'প্রিন্টেড';
      return {
        category: 'টি-শার্ট',
        subCategory: sub,
        confidence: 0.95,
        reasoning: 'টি-শার্ট এর প্যাটার্ন ও কম্বড কটন বৈশিষ্ট্য সনাক্ত হয়েছে।',
      };
    }

    // 4. গেঞ্জি
    if (text.includes('গেঞ্জি') || text.includes('genji') || text.includes('স্লিভলেস') || text.includes('ইনারওয়্যার') || text.includes('স্যান্ডো') || text.includes('সেন্ডো')) {
      let sub = 'স্লিভলেস গেঞ্জি';
      if (text.includes('হাফ-হাতা')) sub = 'হাফ-হাতা';
      else if (text.includes('ভি-নেক')) sub = 'ভি-নেক';
      return {
        category: 'গেঞ্জি',
        subCategory: sub,
        confidence: 0.92,
        reasoning: 'ইনারওয়্যার ও কমফোর্ট গেঞ্জির বৈশিষ্ট্য বিদ্যমান।',
      };
    }

    // 5. ছেলেদের পোশাক
    if (text.includes('পাঞ্জাবি') || text.includes('panjabi') || text.includes('পাঞ্জাবী') || text.includes('পায়জামা') || text.includes('পায়জামা') || text.includes('ছেলেদের') || text.includes('men') || text.includes('mens') || text.includes('শার্ট')) {
      let sub = 'পাঞ্জাবি';
      if (text.includes('পায়জামা')) sub = 'পায়জামা';
      else if (text.includes('শার্ট')) sub = 'শার্ট';
      return {
        category: 'ছেলেদের পোশাক',
        subCategory: sub,
        confidence: 0.93,
        reasoning: 'পুরুষদের উৎসব ও নামাজের ঐতিহ্যবাহী পোশাক হিসেবে শনাক্ত হয়েছে।',
      };
    }

    // 6. কসমেটিকস
    if (text.includes('লিপস্টিক') || text.includes('lipstick') || text.includes('কসমেটিকস') || text.includes('cosmetics') || text.includes('মেকআপ') || text.includes('makeup') || text.includes('স্কিনকেয়ার') || text.includes('লোশন') || text.includes('সিরাম') || text.includes('আইলাইনার') || text.includes('ফাউন্ডেশন') || text.includes('ম্যাট লিপ')) {
      let sub = 'লিপস্টিক';
      if (text.includes('মেকআপ')) sub = 'মেকআপ সেট';
      else if (text.includes('স্কিন') || text.includes('সিরাম')) sub = 'স্কিন কেয়ার';
      return {
        category: 'কসমেটিকস',
        subCategory: sub,
        confidence: 0.95,
        reasoning: 'সৌন্দর্যবর্ধক মেকআপ ও স্কিনকেয়ার পণ্যের সাথে মিলে গেছে।',
      };
    }

    // 7. চুড়ি
    if (text.includes('চুড়ি') || text.includes('চুড়ি') || text.includes('churi') || text.includes('bangles') || text.includes('ভেলভেট চুড়ি') || text.includes('রেশমি সুতা') || text.includes('কাঁচের চুড়ি')) {
      let sub = 'ভেলভেট চুড়ি';
      if (text.includes('রেশমি')) sub = 'রেশমি সুতা';
      else if (text.includes('কুন্দন')) sub = 'কুন্দন চুড়ি';
      else if (text.includes('কাঁচ')) sub = 'কাঁচের চুড়ি';
      return {
        category: 'চুড়ি',
        subCategory: sub,
        confidence: 0.94,
        reasoning: 'হাতের ঐতিহ্যবাহী চুড়ি ও রেশমি সুতার গহনা হিসেবে সনাক্ত।',
      };
    }

    // 8. জুয়েলারি
    if (text.includes('জুয়েলারি') || text.includes('jewelry') || text.includes('jewellery') || text.includes('নেকলেস') || text.includes('necklace') || text.includes('মালা') || text.includes('কানের দুল') || text.includes('ঝুমকা') || text.includes('আংটি') || text.includes('ring') || text.includes('টিকলি') || text.includes('চকার') || text.includes('ব্রেসলেট') || text.includes('পায়ল')) {
      let sub = 'নেকলেস সেট';
      if (text.includes('কানের দুল') || text.includes('ঝুমকা')) sub = 'কানের দুল';
      else if (text.includes('আংটি')) sub = 'আংটি';
      else if (text.includes('ব্রেসলেট')) sub = 'ব্রেসলেট';
      else if (text.includes('পায়ল')) sub = 'পায়ল';
      return {
        category: 'জুয়েলারি',
        subCategory: sub,
        confidence: 0.94,
        reasoning: 'আকর্ষণীয় কুন্দন ও পার্ল জুয়েলারি অলঙ্কার হিসেবে সনাক্ত হয়েছে।',
      };
    }

    // 9. অন্যান্য (বোরকা, হিজাব, গাউন, লেহেঙ্গা ইত্যাদি)
    if (text.includes('বোরকা') || text.includes('borka') || text.includes('abaya') || text.includes('হিজাব') || text.includes('hijab') || text.includes('গাউন') || text.includes('gown') || text.includes('লেহেঙ্গা') || text.includes('lehenga')) {
      let sub = 'বোরকা ও হিজাব';
      if (text.includes('গাউন')) sub = 'ডিজাইনার গাউন';
      else if (text.includes('লেহেঙ্গা')) sub = 'লেহেঙ্গা';
      return {
        category: 'অন্যান্য',
        subCategory: sub,
        confidence: 0.91,
        reasoning: 'বোরকা, গাউন বা লেহেঙ্গা কালেকশনের অংশ হিসেবে শ্রেণীবদ্ধ করা হয়েছে।',
      };
    }

    // Default fallback
    return {
      category: 'অন্যান্য',
      confidence: 0.5,
      reasoning: 'সাধারণ পোশাক বা এক্সেসরিজ হিসেবে অন্যান্য ক্যাটাগরিতে প্রস্তাবিত।',
    };
  }

  // --- 3. Products Management ---
  private initProducts() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
    }
  }

  public getProducts(): Product[] {
    try {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public saveProducts(products: Product[]) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    this.broadcastProducts(products);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  }

  public updateProduct(id: string, updatedFields: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updatedFields,
    };
    this.saveProducts(products);
    return products[index];
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) return false;

    // Delete stored uploaded image files if any exist in /uploads
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imgUrl) => {
        if (imgUrl.startsWith('/uploads/')) {
          const fileName = path.basename(imgUrl);
          const filePath = path.join(UPLOADS_DIR, fileName);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.warn('Failed to delete image file:', filePath, err);
            }
          }
        }
      });
    }

    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
    return true;
  }

  // --- 3. Orders Management (STRICT: Real orders only!) ---
  private initOrders() {
    if (!fs.existsSync(ORDERS_FILE)) {
      // Empty array by default! NO fake/demo orders!
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  public getOrders(): Order[] {
    try {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveOrders(orders: Order[]) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  }

  public createOrder(order: Order): Order {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    this.saveOrders(updated);

    // Also deduct stock for real products
    const products = this.getProducts();
    let productsModified = false;

    order.items.forEach((item) => {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex > -1) {
        const newStock = Math.max(0, products[pIndex].stock - item.quantity);
        products[pIndex].stock = newStock;
        if (newStock === 0) {
          products[pIndex].status = 'Out of Stock';
        }
        productsModified = true;
      }
    });

    if (productsModified) {
      this.saveProducts(products);
    }

    return order;
  }

  public updateOrderStatus(id: string, status: OrderStatus): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    orders[index].status = status;
    this.saveOrders(orders);
    return orders[index];
  }

  // --- 4. Complaints Management ---
  private initComplaints() {
    if (!fs.existsSync(COMPLAINTS_FILE)) {
      fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  public getComplaints(): Complaint[] {
    try {
      const raw = fs.readFileSync(COMPLAINTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveComplaints(complaints: Complaint[]) {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
  }

  public createComplaint(complaint: Complaint): Complaint {
    const complaints = this.getComplaints();
    const updated = [complaint, ...complaints];
    this.saveComplaints(updated);
    return complaint;
  }

  public updateComplaintStatus(id: string, status: ComplaintStatus, adminNote?: string): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === id);
    if (index === -1) return null;
    complaints[index].status = status;
    if (adminNote !== undefined) {
      complaints[index].adminNote = adminNote;
    }
    this.saveComplaints(complaints);
    return complaints[index];
  }

  // --- 5. Announcements ---
  private initAnnouncements() {
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(INITIAL_ANNOUNCEMENTS, null, 2), 'utf-8');
    }
  }

  public getAnnouncements(): Announcement[] {
    try {
      const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  public saveAnnouncements(announcements: Announcement[]) {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2), 'utf-8');
  }

  public addAnnouncement(ann: Omit<Announcement, 'id'>): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    const updated = [newAnn, ...list];
    this.saveAnnouncements(updated);
    return newAnn;
  }

  public deleteAnnouncement(id: string): boolean {
    const list = this.getAnnouncements();
    const updated = list.filter((a) => a.id !== id);
    this.saveAnnouncements(updated);
    return true;
  }

  // --- 6. Image File Storage ---
  public saveUploadedImage(base64Data: string, originalName?: string): string {
    ensureDirs();
    // Parse base64 header if exists: data:image/png;base64,...
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let ext = 'jpg';
    let rawBuffer: Buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      rawBuffer = Buffer.from(matches[2], 'base64');
    } else {
      rawBuffer = Buffer.from(base64Data, 'base64');
    }

    const filename = `product-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, rawBuffer);
    return `/uploads/${filename}`;
  }
}
