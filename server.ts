import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { Database } from './server/db';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const db = Database.getInstance();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve persistent uploaded images
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Admin Authorization Middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!db.validateAdminToken(token)) {
      res.status(403).json({ error: 'আপনার সেশনটি অকার্যকর বা মেয়াদোত্তীর্ণ হয়েছে। পুনরায় লগইন করুন।' });
      return;
    }
    next();
  };

  // --- ADMIN AUTH ROUTES ---
  // Login: verifies password securely on server, returns session token
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'পাসওয়ার্ড প্রদান করুন।' });
      return;
    }
    const isValid = db.verifyAdminPassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'ভুল অ্যাডমিন পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' });
      return;
    }
    const token = db.createAdminSession();
    res.json({ success: true, token, role: 'admin' });
  });

  // Verify active token
  app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false });
      return;
    }
    const token = authHeader.split(' ')[1];
    const valid = db.validateAdminToken(token);
    res.json({ valid });
  });

  // Change Admin Password
  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'বর্তমান এবং নতুন পাসওয়ার্ড উভয়ই দিন।' });
      return;
    }
    const result = db.changeAdminPassword(oldPassword, newPassword);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({ success: true, message: result.message });
  });

  // --- CATEGORIES ROUTES ---
  // Public: Get all categories
  app.get('/api/categories', (_req, res) => {
    const categories = db.getCategories();
    res.json(categories);
  });

  // Admin: Create Category
  app.post('/api/categories', requireAdmin, (req, res) => {
    try {
      const { name, englishName, description, image, subCategories, order, isActive } = req.body;
      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'ক্যাটাগরির নাম আবশ্যক।' });
        return;
      }
      const newCat = db.addCategory({
        name: name.trim(),
        englishName: englishName?.trim(),
        description: description?.trim(),
        image: image || '/logo.jpg',
        subCategories: Array.isArray(subCategories) ? subCategories : [],
        order: Number(order) || 99,
        isActive: isActive !== false,
      });
      res.status(201).json(newCat);
    } catch (err: any) {
      res.status(500).json({ error: 'ক্যাটাগরি তৈরি করা সম্ভব হয়নি।' });
    }
  });

  // Admin: Update Category
  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateCategory(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'ক্যাটাগরি আপডেট করা যায়নি।' });
    }
  });

  // Admin: Delete Category (checks if products exist)
  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const force = req.query.force === 'true';
      const result = db.deleteCategory(id, force);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।' });
    } catch {
      res.status(500).json({ error: 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।' });
    }
  });

  // Admin: Reorder Categories
  app.post('/api/categories/reorder', requireAdmin, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ error: 'অকার্যকর ক্রম তালিকা।' });
        return;
      }
      const reordered = db.reorderCategories(orderedIds);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'ক্যাটাগরি সাজানো যায়নি।' });
    }
  });

  // Smart Category Suggestion endpoint
  app.post('/api/categories/suggest', (req, res) => {
    try {
      const { name, description } = req.body;
      const suggestion = db.suggestCategory(name || '', description || '');
      res.json(suggestion);
    } catch {
      res.status(500).json({ category: 'অন্যান্য', confidence: 0.5 });
    }
  });

  // --- PRODUCTS ROUTES ---
  // Public: Get all products
  app.get('/api/products', (_req, res) => {
    const products = db.getProducts();
    res.json(products);
  });

  // Public: Real-time Server-Sent Events (SSE) stream for instant updates
  app.get('/api/products/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const listener = (data: any) => {
      res.write(`data: ${data}\n\n`);
    };

    db.subscribeSSE(listener);

    // Initial message
    res.write(`data: ${JSON.stringify({ type: 'connected', data: db.getProducts(), categories: db.getCategories() })}\n\n`);

    req.on('close', () => {
      db.unsubscribeSSE(listener);
    });
  });

  // Admin: Upload images
  app.post('/api/upload-images', requireAdmin, (req, res) => {
    try {
      const { images } = req.body;
      if (!Array.isArray(images) || images.length === 0) {
        res.status(400).json({ error: 'No images provided' });
        return;
      }
      const savedUrls = images.map((img: string) => {
        if (img.startsWith('data:image')) {
          return db.saveUploadedImage(img);
        }
        return img;
      });
      res.json({ urls: savedUrls });
    } catch (err: any) {
      console.error('Image upload error:', err);
      res.status(500).json({ error: 'ছবি আপলোড করতে ব্যর্থ হয়েছে।' });
    }
  });

  // Admin: Add Product
  app.post('/api/products', requireAdmin, (req, res) => {
    try {
      const { name, bengaliName, description, price, discountPrice, stock, category, subCategory, sizes, colors, images, isFeatured, isNewArrival, isPopular, tags, rating, salesCount } = req.body;
      if (!name || !price) {
        res.status(400).json({ error: 'নাম ও মূল্য আবশ্যক।' });
        return;
      }

      // Convert any base64 images to server-side stored files
      const processedImages = (images || []).map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          return db.saveUploadedImage(img);
        }
        return img;
      });

      const newProduct = db.addProduct({
        name,
        bengaliName: bengaliName || name,
        description: description || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock ?? 10),
        category,
        subCategory: subCategory || undefined,
        tags: Array.isArray(tags) ? tags : [],
        rating: rating ? Number(rating) : 4.8,
        ratingCount: 1,
        salesCount: salesCount ? Number(salesCount) : 0,
        sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Standard'],
        colors: Array.isArray(colors) && colors.length > 0 ? colors : ['Standard'],
        images: processedImages.length > 0 ? processedImages : ['/logo.jpg'],
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isPopular: Boolean(isPopular),
        status: Number(stock ?? 10) > 0 ? 'In Stock' : 'Out of Stock',
      });

      res.status(201).json(newProduct);
    } catch (err: any) {
      console.error('Add product error:', err);
      res.status(500).json({ error: 'প্রোডাক্ট সংরক্ষণ করা যায়নি।' });
    }
  });

  // Admin: Update Product
  app.put('/api/products/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.images && Array.isArray(updates.images)) {
        updates.images = updates.images.map((img: string) => {
          if (typeof img === 'string' && img.startsWith('data:image')) {
            return db.saveUploadedImage(img);
          }
          return img;
        });
      }

      const updated = db.updateProduct(id, updates);
      if (!updated) {
        res.status(404).json({ error: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি।' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Update product error:', err);
      res.status(500).json({ error: 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  // Admin: Delete Product (Deletes from DB and cleans image storage)
  app.delete('/api/products/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteProduct(id);
      if (!success) {
        res.status(404).json({ error: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি।' });
        return;
      }
      res.json({ success: true, message: 'প্রোডাক্ট এবং সংশ্লিষ্ট ছবি সফলভাবে মুছে ফেলা হয়েছে।' });
    } catch (err: any) {
      console.error('Delete product error:', err);
      res.status(500).json({ error: 'প্রোডাক্ট ডিলিট করা যায়নি।' });
    }
  });

  // --- ORDERS ROUTES (STRICT: Real orders only!) ---
  // Public: Customer place order
  app.post('/api/orders', (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData.customerName || !orderData.customerPhone || !orderData.deliveryAddress || !orderData.items || orderData.items.length === 0) {
        res.status(400).json({ error: 'অর্ডারের সকল আবশ্যক তথ্য পূরণ করুন।' });
        return;
      }
      const order = db.createOrder(orderData);
      res.status(201).json(order);
    } catch (err: any) {
      console.error('Create order error:', err);
      res.status(500).json({ error: 'অর্ডার সংরক্ষণ করা যায়নি।' });
    }
  });

  // Admin: Get all orders
  app.get('/api/orders', requireAdmin, (_req, res) => {
    const orders = db.getOrders();
    res.json(orders);
  });

  // Admin: Update order status
  app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'অর্ডার খুঁজে পাওয়া যায়নি।' });
      return;
    }
    res.json(updated);
  });

  // --- COMPLAINTS ROUTES ---
  app.post('/api/complaints', (req, res) => {
    const complaint = db.createComplaint(req.body);
    res.status(201).json(complaint);
  });

  app.get('/api/complaints', requireAdmin, (_req, res) => {
    res.json(db.getComplaints());
  });

  app.put('/api/complaints/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const updated = db.updateComplaintStatus(id, status, adminNote);
    if (!updated) {
      res.status(404).json({ error: 'অভিযোগ পাওয়া যায়নি।' });
      return;
    }
    res.json(updated);
  });

  // --- ANNOUNCEMENTS ROUTES ---
  app.get('/api/announcements', (_req, res) => {
    res.json(db.getAnnouncements());
  });

  app.post('/api/announcements', requireAdmin, (req, res) => {
    const ann = db.addAnnouncement(req.body);
    res.status(201).json(ann);
  });

  app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.deleteAnnouncement(id);
    res.json({ success: true });
  });

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({});
    } catch (e) {
      console.warn('GoogleGenAI initialization notice:', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      brand: 'Online Dress Mart',
      productsCount: db.getProducts().length,
      ordersCount: db.getOrders().length,
      time: new Date().toISOString(),
    });
  });

  // AI Chat Assistant endpoint grounded in Online Dress Mart actual products & orders
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Check if user is asking about order status
      const orderIdMatch = message.match(/odm-[\d\w]+/i) || message.match(/\b\d{5}\b/);
      if (orderIdMatch) {
        const queryId = orderIdMatch[0].toUpperCase().startsWith('ODM-') 
          ? orderIdMatch[0].toUpperCase() 
          : `ODM-${orderIdMatch[0]}`;
        const foundOrder = db.getOrders().find((o) => o.id.toUpperCase() === queryId);
        if (foundOrder) {
          const itemsSummary = foundOrder.items.map((it) => `${it.productName} (${it.size}) × ${it.quantity}`).join(', ');
          res.json({
            reply: `আপনার অর্ডার ${foundOrder.id} এর বর্তমান অবস্থা:\n\n• বর্তমান স্ট্যাটাস: ${foundOrder.status}\n• গ্রাহকের নাম: ${foundOrder.customerName}\n• পণ্য: ${itemsSummary}\n• সর্বমোট বিল: ৳${foundOrder.total.toLocaleString('bn-BD')}\n• ডেলিভারি ঠিকানা: ${foundOrder.deliveryAddress}\n\nকোনো জরুরি প্রয়োজনে সরাসরি কল করুন 01897514604 নম্বরে।`,
          });
          return;
        } else {
          res.json({
            reply: `দুঃখিত, '${queryId}' আইডি দিয়ে আমাদের ডাটাবেজে কোনো অর্ডার খুঁজে পাওয়া যায়নি। সঠিক Order ID দিন অথবা আমাদের হটলাইন 01897514604 নম্বরে যোগাযোগ করুন।`,
          });
          return;
        }
      }

      if (!ai || !process.env.GEMINI_API_KEY) {
        res.json({
          reply: 'আসসালামু আলাইকুম! Online Dress Mart-এর পোশাক ও অর্ডার সম্পর্কে যেকোনো সহায়তার জন্য সরাসরি আমাদের হটলাইনে ফোন বা WhatsApp করুন: 01897514604। ফেসবুক পেইজ: https://www.facebook.com/profile.php?id=61565221242728',
        });
        return;
      }

      const products = db.getProducts();
      const productListSummary = products.slice(0, 10).map(p => `• ${p.bengaliName || p.name} (মূল্য: ৳${p.discountPrice || p.price}, ক্যাটাগরি: ${p.category})`).join('\n');

      const prompt = `You are the official AI Customer Support Assistant for "Online Dress Mart" (অনলাইন ড্রেস মার্ট), an exclusive Bangladeshi online fashion store.
Store Information:
- Brand Name: Online Dress Mart
- Hotline & Phone: 01897514604
- WhatsApp Order: 01897514604
- Facebook Page: https://www.facebook.com/profile.php?id=61565221242728
- Categories: বেনারসি ও কাতান সিল্ক শাড়ি, প্রিমিয়াম জর্জেট থ্রি-পিস, জামা ও কুর্তি, ব্রাইডাল লেহেঙ্গা, ফ্লোর-টাচ গাউন, পাঞ্জাবি, দুবাই চেরি স্টোন বোরকা ও হিজাব।
- Real Available Dresses in Catalog:
${productListSummary}
- Delivery Policy: Cash on Delivery everywhere in Bangladesh. Inside Dhaka delivery fee ৳70 (2-3 days). Outside Dhaka ৳130 (3-5 days). Free delivery on ordering 3+ dresses.
- Return/Exchange Policy: Customers can inspect the dress upon delivery. 7-day hassle-free size/fabric exchange policy.
- Customer Complaint: Can submit complaint through website Complaint Box.
- STRICT RULE ON ORDER STATUS: NEVER invent, hallucinate, or assume fake order details or statuses. If user asks for order status without giving an Order ID, politely ask them for their 5-digit Order ID (e.g. ODM-12345).

Respond politely in natural Bengali (বাংলা) or English according to the customer's query. Keep it warm, polite, and helpful.

Customer Query: "${message}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const replyText = response.text || 'আপনার প্রশ্নের জন্য ধন্যবাদ! বিস্তারিত জানতে আমাদের হটলাইনে কল করুন: 01897514604।';
      res.json({ reply: replyText });
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({
        reply: 'দুঃখিত, সংযোগে সাময়িক বিলম্ব হচ্ছে। জরুরি সহায়তার জন্য সরাসরি কল করুন: 01897514604।',
      });
    }
  });

  // Serve Vite in development, or static build in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Online Dress Mart server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

