import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

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
      time: new Date().toISOString(),
    });
  });

  // AI Chat Assistant endpoint grounded in Online Dress Mart domain
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      if (!ai || !process.env.GEMINI_API_KEY) {
        // Local intelligent response fallback when API key is pending
        res.json({
          reply: 'আসসালামু আলাইকুম! Online Dress Mart-এর পোশাক ও অর্ডার সম্পর্কে যেকোনো সহায়তার জন্য সরাসরি আমাদের হটলাইনে ফোন বা WhatsApp করুন: 01897514604। ফেসবুক পেইজ: https://www.facebook.com/profile.php?id=61565221242728',
        });
        return;
      }

      const prompt = `You are the official AI Customer Support Assistant for "Online Dress Mart" (অনলাইন ড্রেস মার্ট), an exclusive Bangladeshi online fashion store.
Store Information:
- Brand Name: Online Dress Mart
- Hotline & Phone: 01897514604
- WhatsApp Order: 01897514604
- Facebook Page: https://www.facebook.com/profile.php?id=61565221242728
- Categories: বেনারসি ও কাতান সিল্ক শাড়ি, প্রিমিয়াম জর্জেট থ্রি-পিস, ব্রাইডাল লেহেঙ্গা, ফ্লোর-টাচ গাউন, দুবাই চেরি স্টোন বোরকা ও হিজাব, ক্যাজুয়াল কটন কুর্তি।
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
