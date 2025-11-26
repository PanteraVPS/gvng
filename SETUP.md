# 🚀 Clothing Shop Setup Guide

Complete setup instructions for the Clothing Shop e-commerce application.

## ✅ What's Already Done

1. ✅ Project structure created
2. ✅ Backend configured (Express + TypeScript + MongoDB)
3. ✅ Frontend configured (React + Vite + TypeScript)
4. ✅ All dependencies installed
5. ✅ Backend running on http://localhost:5000
6. ✅ Frontend running on http://localhost:5173
7. ✅ Basic routing implemented
8. ✅ Product, User, and Order models created
9. ✅ Authentication routes (register, login)
10. ✅ Product routes (CRUD)

## 🔧 Next Steps

### Step 1: Set Up MongoDB

#### Option A: Using Docker (Recommended)
```powershell
# Install Docker from https://www.docker.com/products/docker-desktop

# Navigate to project directory
cd C:\Users\Pantera\Desktop\clothing-shop

# Start MongoDB container
docker-compose up -d

# Verify MongoDB is running
docker ps
```

#### Option B: Local Installation
**Windows (using Chocolatey):**
```powershell
choco install mongodb
```

**Or download from:** https://www.mongodb.com/try/download/community

**Start MongoDB:**
```powershell
mongod
```

### Step 2: Seed Sample Products

```powershell
cd C:\Users\Pantera\Desktop\clothing-shop\backend

# Run the seed script
npx ts-node src/seed.ts
```

Expected output:
```
Connecting to MongoDB...
✅ MongoDB connected successfully
Clearing existing products...
Seeding database with sample products...
✅ Successfully seeded 10 products!
```

### Step 3: Verify Setup

**Check Backend Health:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-13T...",
  "mongodb": "connected"
}
```

**Check Products API:**
```bash
curl http://localhost:5000/api/products
```

**Open Frontend:**
- Visit: http://localhost:5173
- You should see the clothing shop homepage with featured products

## 📝 Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Backend entry point |
| `backend/src/routes/products.ts` | Product API routes |
| `backend/src/routes/auth.ts` | Authentication routes |
| `backend/src/models/Product.ts` | Product MongoDB schema |
| `backend/src/models/User.ts` | User MongoDB schema |
| `backend/.env` | Backend configuration |
| `frontend/src/App.tsx` | React root component |
| `frontend/src/pages/ProductsPage.tsx` | Products listing page |
| `frontend/src/pages/HomePage.tsx` | Home page |
| `frontend/src/pages/CartPage.tsx` | Shopping cart page |

## 🎯 Feature Overview

### Homepage
- Featured products showcase
- "Shop Now" call-to-action button
- Product cards with images and prices

### Products Page
- Browse all products
- Filter by category (Men, Women, Kids, Accessories)
- Select size and color for each product
- Add to cart functionality
- Responsive grid layout

### Shopping Cart
- View all items in cart
- Adjust quantities
- Remove items
- Order summary with:
  - Subtotal
  - Shipping ($10)
  - Tax (10%)
  - Total price
- Checkout button (ready for payment integration)
- Continue shopping button

### Authentication
- User registration endpoint
- Login endpoint with JWT tokens
- Password hashing with bcryptjs
- Token-based API access

## 🔌 API Endpoints

### Auth Endpoints
```
POST /api/auth/register
Body: { email, password, firstName, lastName }

POST /api/auth/login
Body: { email, password }
```

### Product Endpoints
```
GET /api/products
Query params: ?category=men&minPrice=10&maxPrice=100&search=shirt

GET /api/products/:id

POST /api/products
Body: { name, description, price, category, size, color, stock, image }

PUT /api/products/:id
Body: { ...product fields to update }

DELETE /api/products/:id
```

## 🛒 Frontend Components

### App.tsx
Main application wrapper with:
- Navigation bar
- Router setup
- Footer
- Main content area

### HomePage.tsx
Displays:
- Hero section with welcome message
- Featured products grid
- Links to shop

### ProductsPage.tsx
Features:
- Product grid (responsive)
- Category filter
- Size/Color selectors per product
- Add to cart buttons
- Product information

### CartPage.tsx
Contains:
- Cart items list with images
- Quantity controls
- Remove button for each item
- Order summary
- Checkout button

## 🎨 Styling

The application uses:
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Grid layouts for product display
- Flexbox for navigation and controls

## 🔐 Security Setup

### Environment Variables
Backend `.env` file contains:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clothing-shop
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Important:** In production, change `JWT_SECRET` to a strong random string!

## 📊 Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String, // 'men', 'women', 'kids', 'accessories'
  size: [String],
  color: [String],
  stock: Number,
  image: String,
  images: [String],
  rating: Number,
  reviews: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  city: String,
  country: String,
  role: String, // 'customer' or 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Application

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Test Product Creation
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "category": "men",
    "size": ["M", "L"],
    "color": ["Black"],
    "stock": 50,
    "image": "https://via.placeholder.com/300"
  }'
```

## 🚀 Development Commands

### Backend
```bash
# Start development server
cd backend
npx ts-node src/index.ts

# Or using npm script (after updating package.json)
npm run dev
```

### Frontend
```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Seeding Data
```bash
# Seed sample products
cd backend
npx ts-node src/seed.ts
```

## 📦 Production Deployment

### Before Deploying
1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Update `MONGODB_URI` to production database
4. Update `CORS_ORIGIN` to production frontend URL
5. Enable HTTPS
6. Set up environment variables on hosting platform

### Backend Deployment Options
- **Heroku:** `git push heroku main`
- **AWS:** Deploy to Lambda or EC2
- **DigitalOcean:** Use App Platform
- **Azure:** Use App Service
- **Railway:** Push to railway.app

### Frontend Deployment Options
- **Vercel:** `vercel deploy`
- **Netlify:** Connect GitHub repository
- **AWS:** S3 + CloudFront
- **Azure:** Static Web Apps

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## ❓ FAQs

**Q: Why is MongoDB not connecting?**
A: Ensure MongoDB is running locally or Docker container is active. Check `MONGODB_URI` in `.env`.

**Q: Can I use a different database?**
A: Yes! You can replace MongoDB/Mongoose with PostgreSQL, MySQL, etc. Update models and connection accordingly.

**Q: How do I add authentication to protected routes?**
A: Use the `authenticateToken` middleware from `backend/src/middleware/auth.ts` on routes that require auth.

**Q: Can I use this in production?**
A: Yes, but ensure you:
- Update all security settings
- Use strong JWT secrets
- Enable HTTPS
- Set up proper error logging
- Add input validation
- Implement rate limiting
- Set up monitoring

## 🎉 You're All Set!

Your clothing shop application is ready to use! Start exploring and adding more features.

**Next features to consider:**
1. Payment processing (Stripe/PayPal)
2. Admin dashboard
3. Email notifications
4. Product reviews
5. Wishlist functionality
6. Order tracking
7. User profiles
8. Advanced search and filtering

Happy coding! 🚀
