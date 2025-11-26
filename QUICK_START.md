# 🎯 Quick Reference - Clothing Shop

## ✅ Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | ✅ Running | http://localhost:5000 |
| Frontend App | ✅ Running | http://localhost:5173 |
| MongoDB | ⚠️ Not Connected | Start MongoDB first |
| Project Root | `C:\Users\Pantera\Desktop\clothing-shop` | |

## 🎬 How to Start

### Terminal 1 - Backend
```powershell
cd C:\Users\Pantera\Desktop\clothing-shop\backend
npx ts-node src/index.ts
```

### Terminal 2 - Frontend
```powershell
cd C:\Users\Pantera\Desktop\clothing-shop\frontend
npm run dev
```

### Terminal 3 - MongoDB (Optional but Recommended)
```powershell
# Option A: Using Docker (if installed)
cd C:\Users\Pantera\Desktop\clothing-shop
docker-compose up -d

# Option B: Local MongoDB
mongod
```

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |
| API Products | http://localhost:5000/api/products |

## 📁 Important Folders

| Folder | Purpose |
|--------|---------|
| `backend/src` | Backend source code |
| `frontend/src` | Frontend React components |
| `backend/src/routes` | API endpoint definitions |
| `backend/src/models` | MongoDB schemas |
| `frontend/src/pages` | Page components |
| `frontend/src/services` | API integration |

## 🚀 Key Features Available

✅ **Homepage** - Welcome page with featured products  
✅ **Products Page** - Browse and filter products by category  
✅ **Shopping Cart** - Add items, adjust quantity, view total  
✅ **Authentication** - User registration and login endpoints  
✅ **API** - RESTful endpoints for products, users, auth  
✅ **Database** - MongoDB integration ready  
✅ **TypeScript** - Full type safety on frontend and backend  

## 🛠️ Common Commands

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Start servers
# Backend: npx ts-node src/index.ts
# Frontend: npm run dev

# Seed sample products
cd backend && npx ts-node src/seed.ts

# Build for production
cd frontend && npm run build

# Format code
npm run lint

# View logs
# Check terminal output where server is running
```

## 📊 Project Stats

- **Backend Files**: 15+ TypeScript files
- **Frontend Files**: 10+ React components
- **Total Dependencies**: 400+
- **Project Size**: ~500MB (with node_modules)
- **Setup Time**: Complete! Ready to use

## 🔧 Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clothing-shop
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env) - Optional**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Clothing Shop
VITE_ENABLE_ANALYTICS=false
```

## 📝 Sample API Calls

### Get All Products
```bash
curl http://localhost:5000/api/products
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","firstName":"John","lastName":"Doe"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

## 🎨 Frontend Routes

| Route | Component | Features |
|-------|-----------|----------|
| `/` | HomePage | Featured products |
| `/products` | ProductsPage | Browse all products |
| `/cart` | CartPage | Shopping cart |
| `/account` | Link Ready | User account (coming soon) |

## 💾 File Structure at a Glance

```
clothing-shop/
├── backend/
│   ├── src/
│   │   ├── index.ts ................... Server entry
│   │   ├── seed.ts .................... Sample data
│   │   ├── routes/
│   │   │   ├── auth.ts ............... Auth endpoints
│   │   │   └── products.ts ........... Product endpoints
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   └── Order.ts
│   │   ├── controllers/
│   │   │   └── productController.ts
│   │   ├── services/
│   │   │   ├── userService.ts
│   │   │   └── productService.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── config/
│   │       └── database.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx .................. Entry point
│   │   ├── App.tsx ................... Root component
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   └── CartPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── productService.ts
│   │   │   └── authService.ts
│   │   ├── utils/
│   │   │   └── useCart.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml
├── package.json
├── README.md
├── SETUP.md
└── .gitignore
```

## 🐛 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process or change PORT in .env |
| Cannot find module | Run `npm install` in that directory |
| MongoDB not connecting | Start MongoDB or Docker container |
| CORS errors | Check backend CORS_ORIGIN matches frontend URL |
| Products not loading | Run seed script: `npx ts-node src/seed.ts` |
| Blank homepage | Check browser console for API errors |

## 📞 Next Steps

1. **View the App**: http://localhost:5173
2. **Check Products**: Add sample data with seeder
3. **Test Cart**: Add products to shopping cart
4. **Explore API**: Test endpoints with curl or Postman
5. **Customize**: Modify colors, products, features
6. **Deploy**: Push to production when ready

## 📚 Documentation Files

- **README.md** - Full project documentation
- **SETUP.md** - Detailed setup instructions
- **This file** - Quick reference guide

## 🎓 Learning Resources

- Express.js: https://expressjs.com/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- MongoDB: https://docs.mongodb.com/
- Vite: https://vitejs.dev/

---

**🚀 Happy Coding! Your clothing shop is ready to go!**

For detailed information, check README.md and SETUP.md in the project root.
