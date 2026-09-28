import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order, Complaint, Announcement, OrderStatus, ComplaintStatus } from '../src/types';
import { INITIAL_PRODUCTS, INITIAL_ANNOUNCEMENTS } from '../src/data/initialProducts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
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

  // --- 2. Products Management ---
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
