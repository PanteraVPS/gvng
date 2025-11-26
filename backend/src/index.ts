import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Product } from './models/Product';
import Order from './models/Order';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import adminProductsRoutes from './routes/adminProducts';
import devRoutes from './routes/dev';
import settingsRoutes from './routes/settings';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:5000', 
    `http://${process.env.SERVER_IP || 'localhost'}:5000`,
    `http://${process.env.SERVER_IP || 'localhost'}:5173`
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// Increase JSON/body size limits to allow base64 images from AdminPanel
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static hosting for uploaded images
try {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {
  console.warn('Could not init uploads static dir:', e);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-shop';
    console.log(`Attempting to connect to MongoDB at ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    await seedOrdersIfEmpty();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Attempting in-memory MongoDB (dev fallback)...');
    try {
      const mem = await MongoMemoryServer.create();
      const uri = mem.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to in-memory MongoDB');
      const count = await Product.countDocuments();
      if (count === 0) {
        await Product.insertMany([
          {
            name: 'Classic Black T-Shirt',
            description: 'Comfortable and versatile black cotton t-shirt, perfect for everyday wear',
            price: 24.99,
            category: 'men',
            size: ['S', 'M', 'L', 'XL', 'XXL'],
            color: ['Black', 'White', 'Gray'],
            stock: 50,
            image: 'https://via.placeholder.com/300x400?text=Black+T-Shirt',
            images: ['https://via.placeholder.com/300x400?text=Black+T-Shirt+1']
          },
          {
            name: "Women's White Blouse",
            description: 'Elegant white blouse suitable for both casual and professional settings',
            price: 39.99,
            category: 'women',
            size: ['XS', 'S', 'M', 'L', 'XL'],
            color: ['White', 'Beige'],
            stock: 35,
            image: 'https://via.placeholder.com/300x400?text=White+Blouse',
            images: ['https://via.placeholder.com/300x400?text=White+Blouse+1']
          },
          {
            name: "Kids' Colorful Hoodie",
            description: 'Fun and colorful hoodie for kids, perfect for playtime and casual outings',
            price: 34.99,
            category: 'kids',
            size: ['2T', '3T', '4T', '5T', '6T'],
            color: ['Blue', 'Pink', 'Yellow'],
            stock: 40,
            image: 'https://via.placeholder.com/300x400?text=Kids+Hoodie',
            images: ['https://via.placeholder.com/300x400?text=Kids+Hoodie+1']
          },
          {
            name: 'Sports Socks Pack',
            description: 'Set of 6 comfortable sports socks with excellent cushioning',
            price: 19.99,
            category: 'accessories',
            size: ['One Size'],
            color: ['Black', 'White', 'Gray'],
            stock: 100,
            image: 'https://via.placeholder.com/300x400?text=Sports+Socks',
            images: ['https://via.placeholder.com/300x400?text=Sports+Socks+1']
          }
        ]);
        console.log('🌱 Seeded in-memory DB with sample products');
      }
      await seedOrdersIfEmpty();
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr);
      console.log('⚠️  Server running without database. Some features may not work.');
    }
  }
};

// Seed a couple of orders so metrics show something in dev
const seedOrdersIfEmpty = async () => {
  try {
    const cnt = await Order.countDocuments();
    if (cnt > 0) return;
    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(today.getDate() - n);
      return d;
    };
    await Order.insertMany([
      {
        items: [
          { name: 'Classic Black T-Shirt', price: 24.99, quantity: 2, category: 'men', isFeatured: true },
          { name: "Women's White Blouse", price: 39.99, quantity: 1, category: 'women', isFeatured: false }
        ],
        total: 24.99 * 2 + 39.99 * 1,
        currency: 'USD',
        status: 'paid',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10)
      },
      {
        items: [
          { name: "Kids' Colorful Hoodie", price: 34.99, quantity: 1, category: 'kids', isFeatured: true },
          { name: 'Sports Socks Pack', price: 19.99, quantity: 3, category: 'accessories', isFeatured: false }
        ],
        total: 34.99 * 1 + 19.99 * 3,
        currency: 'USD',
        status: 'completed',
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6)
      },
      {
        items: [
          { name: 'Classic Black T-Shirt', price: 24.99, quantity: 1, category: 'men', isFeatured: false }
        ],
        total: 24.99,
        currency: 'USD',
        status: 'paid',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3)
      },
      {
        items: [
          { name: 'Sports Socks Pack', price: 19.99, quantity: 2, category: 'accessories', isFeatured: false }
        ],
        total: 39.98,
        currency: 'USD',
        status: 'completed',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1)
      }
    ]);
    console.log('🌱 Seeded Orders for demo metrics');
  } catch (e) {
    console.warn('Order seed skipped:', e);
  }
};

// Global process error diagnostics
process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

// Define startServer before invoking
const startServer = async () => {
  const requested = parseInt(process.env.PORT || '') || 5000;
  let port = requested;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port, '0.0.0.0', () => resolve());
        server.on('error', (err: any) => reject(err));
      });
      console.log(`🚀 Server running on http://localhost:${port} (requested ${requested})`);
      console.log(`📍 API Health: http://localhost:${port}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      return;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port++;
        continue;
      }
      console.error('Failed to start server attempt', attempt + 1, err);
      break;
    }
  }
  console.error('Unable to bind any port after multiple attempts.');
};

connectDB().then(() => {
  // Routes - API Welcome Message (only in dev)
  if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Welcome to Clothing Shop API',
        version: '1.0.0',
        status: 'Server is running',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          products: '/api/products'
        }
      });
    });
  }

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date(), mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/admin-products', adminProductsRoutes);
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    app.use('/api/dev', devRoutes);
  }
  app.use('/api/settings', settingsRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);

  // Serve Frontend in Production
  if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
    console.log(`Serving static files from: ${frontendDist}`);
    
    if (fs.existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      
      // For any other route, serve index.html
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendDist, 'index.html'));
      });
    } else {
      console.warn('WARNING: frontend/dist directory not found. Frontend will not be served.');
    }
  }

  // Sales metrics endpoint for Admin Dashboard
  app.get('/api/metrics/sales', async (req: Request, res: Response) => {
    try {
      const match = { status: { $in: ['paid', 'completed'] } } as any;

      const totalOrders = await Order.countDocuments(match);
      const agg = await Order.aggregate([
        { $match: match },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        { $group: {
            _id: null,
            itemsSold: { $sum: { $ifNull: ['$items.quantity', 0] } },
            totalRevenue: { $sum: { $multiply: [ { $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] } ] } }
          }
        }
      ]);
      const currencyDoc = await Order.findOne(match).select('currency').lean();
      const itemsSold = agg[0]?.itemsSold || 0;
      const totalProfit = agg[0]?.totalRevenue || 0; // using revenue as profit placeholder
      const currency = (currencyDoc as any)?.currency || 'USD';

      res.json({ totalOrders, itemsSold, totalProfit, currency });
    } catch (e) {
      console.error('Metrics error:', e);
      res.status(500).json({ error: 'Unable to retrieve metrics' });
    }
  });

  // Sales trend endpoint: returns last N days daily metrics (orders, items, revenue)
  app.get('/api/metrics/sales/trend', async (req: Request, res: Response) => {
    try {
      const maxDays = 365;
      const days = Math.max(1, Math.min(maxDays, parseInt((req.query.days as string) || '30', 10)));

      const now = new Date();
      let start = new Date();
      let end = new Date();

      const qStart = (req.query.start as string) || '';
      const qEnd = (req.query.end as string) || '';
      if (qStart && qEnd) {
        const s = new Date(qStart);
        const e = new Date(qEnd);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) {
          start = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0));
          end = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 23, 59, 59));
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays > maxDays) {
            // Cap range length to prevent huge queries
            start = new Date(end);
            start.setDate(end.getDate() - (maxDays - 1));
          }
        } else {
          // Fallback to days window if invalid dates
          end = now;
          start = new Date();
          start.setDate(end.getDate() - (days - 1));
        }
      } else {
        end = now;
        start = new Date();
        start.setDate(end.getDate() - (days - 1));
      }

      const match: any = {
        status: { $in: ['paid', 'completed'] },
        createdAt: { $gte: start, $lte: end }
      };

      const agg = await Order.aggregate([
        { $match: match },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        { $addFields: { day: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } } } },
        { $group: {
            _id: '$day',
            orders: { $sum: 0 },
            items: { $sum: { $ifNull: ['$items.quantity', 0] } },
            revenue: { $sum: { $multiply: [ { $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] } ] } }
          }
        },
        { $group: { _id: '$_id', items: { $sum: '$items' }, revenue: { $sum: '$revenue' } } },
        { $project: { _id: 0, date: '$_id', items: 1, revenue: 1 } }
      ]);

      // Fix orders count per day (count unique orders by date)
      const ordersPerDay = await Order.aggregate([
        { $match: match },
        { $addFields: { day: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } } } },
        { $group: { _id: '$day', orders: { $sum: 1 } } },
        { $project: { _id: 0, date: '$_id', orders: 1 } }
      ]);

      const byDate: Record<string, { items: number; revenue: number; orders?: number }> = {};
      for (const r of agg) byDate[r.date] = { items: r.items || 0, revenue: r.revenue || 0 };
      for (const r of ordersPerDay) byDate[r.date] = { ...(byDate[r.date] || { items: 0, revenue: 0 }), orders: r.orders || 0 };

      // Build full series with zeros
      const series: Array<{ date: string; orders: number; items: number; revenue: number }> = [];
      const cursor = new Date(start);
      while (cursor <= end) {
        const y = cursor.getFullYear();
        const m = `${cursor.getMonth() + 1}`.padStart(2, '0');
        const d = `${cursor.getDate()}`.padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        const slot = byDate[key] || { orders: 0, items: 0, revenue: 0 };
        series.push({ date: key, orders: slot.orders || 0, items: slot.items || 0, revenue: slot.revenue || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      res.json({ days, start, end, series });
    } catch (e) {
      console.error('Trend metrics error:', e);
      res.status(500).json({ error: 'Unable to retrieve trend metrics' });
    }
  });

  // Sales breakdown by category and featured
  app.get('/api/metrics/sales/breakdown', async (req: Request, res: Response) => {
    try {
      const maxDays = 365;
      const days = Math.max(1, Math.min(maxDays, parseInt((req.query.days as string) || '30', 10)));
      const now = new Date();
      let start = new Date();
      let end = new Date();
      const qStart = (req.query.start as string) || '';
      const qEnd = (req.query.end as string) || '';
      if (qStart && qEnd) {
        const s = new Date(qStart);
        const e = new Date(qEnd);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) {
          start = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0));
          end = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 23, 59, 59));
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays > maxDays) {
            start = new Date(end);
            start.setDate(end.getDate() - (maxDays - 1));
          }
        } else {
          end = now;
          start = new Date();
          start.setDate(end.getDate() - (days - 1));
        }
      } else {
        end = now;
        start = new Date();
        start.setDate(end.getDate() - (days - 1));
      }

      const match: any = {
        status: { $in: ['paid', 'completed'] },
        createdAt: { $gte: start, $lte: end }
      };

      // Category breakdown (fallback to product.category when item.category missing)
      const byCategory = await Order.aggregate([
        { $match: match },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        { $addFields: { orderId: '$_id' } },
        { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prodById' } },
        { $lookup: {
            from: 'products',
            let: { nm: { $toLower: '$items.name' } },
            pipeline: [
              { $match: { $expr: { $eq: [ { $toLower: '$name' }, '$$nm' ] } } },
              { $project: { category: 1, isFeatured: 1 } },
              { $limit: 1 }
            ],
            as: 'prodByName'
          }
        },
        { $addFields: {
            effCategory: {
              $ifNull: [
                '$items.category',
                { $ifNull: [ { $arrayElemAt: ['$prodById.category', 0] }, { $ifNull: [ { $arrayElemAt: ['$prodByName.category', 0] }, 'unknown' ] } ] }
              ]
            }
          }
        },
        { $addFields: {
            effCategory: {
              $cond: [
                { $in: [ { $toLower: '$effCategory' }, ['men','women','kids','accessories','gvng'] ] },
                '$effCategory',
                'other'
              ]
            }
          }
        },
        { $group: {
            _id: { category: '$effCategory' },
            items: { $sum: { $ifNull: ['$items.quantity', 0] } },
            revenue: { $sum: { $multiply: [ { $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] } ] } },
            ordersSet: { $addToSet: '$orderId' }
          }
        },
        { $project: { _id: 0, category: '$_id.category', items: 1, revenue: 1, orders: { $size: '$ordersSet' } } },
        { $sort: { revenue: -1 } }
      ]);

      // Featured breakdown (fallback to product.isFeatured when item.isFeatured missing)
      const byFeatured = await Order.aggregate([
        { $match: match },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        { $addFields: { orderId: '$_id' } },
        { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prodById' } },
        { $lookup: {
            from: 'products',
            let: { nm: { $toLower: '$items.name' } },
            pipeline: [
              { $match: { $expr: { $eq: [ { $toLower: '$name' }, '$$nm' ] } } },
              { $project: { category: 1, isFeatured: 1 } },
              { $limit: 1 }
            ],
            as: 'prodByName'
          }
        },
        { $addFields: {
            effFeatured: {
              $cond: [
                { $ne: ['$items.isFeatured', null] },
                '$items.isFeatured',
                { $ifNull: [ { $arrayElemAt: ['$prodById.isFeatured', 0] }, { $ifNull: [ { $arrayElemAt: ['$prodByName.isFeatured', 0] }, false ] } ] }
              ]
            }
          }
        },
        { $group: {
            _id: { featured: { $toBool: '$effFeatured' } },
            items: { $sum: { $ifNull: ['$items.quantity', 0] } },
            revenue: { $sum: { $multiply: [ { $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] } ] } },
            ordersSet: { $addToSet: '$orderId' }
          }
        },
        { $project: { _id: 0, isFeatured: '$_id.featured', items: 1, revenue: 1, orders: { $size: '$ordersSet' } } },
        { $sort: { revenue: -1 } }
      ]);

      res.json({ start, end, byCategory, byFeatured });
    } catch (e) {
      console.error('Breakdown metrics error:', e);
      res.status(500).json({ error: 'Unable to retrieve category breakdown' });
    }
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        path: req.path,
        method: req.method
      }
    });
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        status: err.status || 500
      }
    });
  });

  startServer();
});
