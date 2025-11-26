# 🛍️ Clothing Shop - Full-Stack E-Commerce Application

A complete Node.js and TypeScript clothing shop web application with a React frontend and Express backend.

## ✅ Project Status: RUNNING

**Backend:** ✅ Running on `http://localhost:5000`  
**Frontend:** ✅ Running on `http://localhost:5173`

## 📋 Quick Start

### Current Status
- ✅ Backend server is running (TypeScript + Express + MongoDB ready)
- ✅ Frontend server is running (React + Vite + TypeScript)
- ✅ All dependencies installed
- ✅ Hot reload enabled for both frontend and backend

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🏗️ Project Structure

```
clothing-shop/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── index.ts           # Main entry point
│   │   ├── controllers/       # API controllers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── middleware/        # Auth, error handling
│   │   ├── config/            # Database config
│   │   └── utils/             # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Environment variables
│
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── pages/             # Page components (Home, Products, Cart)
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API calls (auth, products)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Hooks (useCart)
│   │   ├── store/             # State management (ready)
│   │   ├── styles/            # CSS/styling
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── package.json               # Root monorepo config
├── .gitignore
└── README.md                  # This file
```

## 🚀 Features Implemented

### Backend ✅
- Express.js REST API with TypeScript
- CORS enabled for frontend communication
- JWT authentication middleware
- Error handling middleware
- MongoDB integration (Mongoose models)
- User model with password hashing (bcryptjs)
- Product model with categories, sizes, colors
- Order model for e-commerce
- Authentication routes (register, login)
- Product CRUD routes
- Service layer for business logic

### Frontend ✅
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Axios with JWT token interceptors
- Product browsing with category filtering
- Shopping cart with localStorage persistence
- Add to cart with size and color selection
- Cart management (add, remove, update quantity)
- Home page with featured products
- Products page with category filtering
- Shopping cart page with order summary
- Responsive design with Tailwind CSS classes

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ORM)
- **Authentication:** JWT + bcryptjs
- **API:** RESTful
- **Validation:** Joi (ready)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** CSS + Tailwind classes
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **State Management:** localStorage + React hooks

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Health Check
- `GET /api/health` - Server health status

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clothing-shop
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Clothing Shop
VITE_ENABLE_ANALYTICS=false
```

## 💾 Database Setup

Currently configured to use MongoDB locally at `mongodb://localhost:27017/clothing-shop`.

### Install MongoDB Locally
**Windows (using Chocolatey):**
```powershell
choco install mongodb
```

**Or download from:** https://www.mongodb.com/try/download/community

**Start MongoDB:**
```powershell
mongod
```

## 🎯 Next Steps

### 1. **Sample Products**
Add sample products to the database:
```bash
# Use MongoDB Compass or create a seed script
db.products.insertMany([
  {
    name: "Classic T-Shirt",
    description: "Comfortable cotton t-shirt",
    price: 29.99,
    category: "men",
    size: ["S", "M", "L", "XL"],
    color: ["Black", "White", "Blue"],
    stock: 50,
    image: "https://via.placeholder.com/300"
  },
  // More products...
])
```

### 2. **Payment Integration**
Implement Stripe or PayPal payment processing

### 3. **Admin Dashboard**
Create admin panel for product and order management

### 4. **User Profile**
Implement user account and order history pages

### 5. **Notifications**
Add email notifications for orders and confirmations

### 6. **Testing**
Write unit and integration tests

### 7. **Deployment**
Deploy to production:
- Backend: Heroku, AWS, Azure, or DigitalOcean
- Frontend: Vercel, Netlify, or AWS S3 + CloudFront

## 🐛 Troubleshooting

### Backend Issues

**Error: "Cannot find module 'express'"**
```bash
cd backend
npm install
```

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`

**Port 5000 Already in Use**
```bash
# Change PORT in .env or kill the process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Issues

**Error: "Cannot find module 'react'"**
```bash
cd frontend
npm install
```

**Port 5173 Already in Use**
- Change port in `vite.config.ts`
- Or kill the process using port 5173

**CORS Errors**
- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches frontend URL

### API Connection Issues
- Verify backend is running: `http://localhost:5000/api/health`
- Check `VITE_API_URL` in frontend `.env`
- Verify proxy settings in `frontend/vite.config.ts`

## 📝 Development Workflow

### Terminal 1 - Backend
```bash
cd C:\Users\Pantera\Desktop\clothing-shop\backend
npx ts-node src/index.ts
```

### Terminal 2 - Frontend
```bash
cd C:\Users\Pantera\Desktop\clothing-shop\frontend
npm run dev
```

### Making Changes
- **Backend:** Changes auto-reload with ts-node
- **Frontend:** Changes auto-reload with Vite
- Simply save files and see changes instantly

## 📚 Database Models

### User
```typescript
{
  email: String (unique)
  password: String (hashed)
  firstName: String
  lastName: String
  phone: String
  address: String
  city: String
  country: String
  role: 'customer' | 'admin'
  createdAt: Date
  updatedAt: Date
}
```

### Product
```typescript
{
  name: String
  description: String
  price: Number
  category: 'men' | 'women' | 'kids' | 'accessories'
  size: [String]
  color: [String]
  stock: Number
  image: String (URL)
  images: [String]
  rating: Number (0-5)
  reviews: [ObjectId]
  createdAt: Date
  updatedAt: Date
}
```

### Order
```typescript
{
  userId: ObjectId
  items: [{
    productId: ObjectId
    quantity: Number
    price: Number
    size: String
    color: String
  }]
  totalPrice: Number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  paymentMethod: String
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Security Notes

- JWT secret in production: use strong random string
- Never commit `.env` files to git
- Use HTTPS in production
- Validate all user inputs
- Sanitize database queries
- Implement rate limiting
- Use environment variables for sensitive data

## 📄 License

MIT

## 👤 Author

Created with ❤️ for e-commerce development

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

**Happy Coding! 🚀**

For questions or issues, please check the troubleshooting section or create an issue in the repository.
