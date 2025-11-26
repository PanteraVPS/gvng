# 🛠️ Development Guide - Clothing Shop

Your complete guide to developing and extending the clothing shop application.

---

## 🚀 Quick Start (You're Here!)

### Current Status
- ✅ Backend: Running at http://localhost:5000
- ✅ Frontend: Running at http://localhost:5173
- ✅ Both servers in development mode with hot reload

### Access Points
```
Frontend:     http://localhost:5173
Backend API:  http://localhost:5000
API Health:   http://localhost:5000/api/health
```

---

## 📂 Project Structure

```
clothing-shop/
│
├── backend/                          # Express.js API
│   ├── src/
│   │   ├── index.ts                 # Main server entry
│   │   ├── seed.ts                  # Database seeder for sample data
│   │   │
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.ts             # Authentication routes
│   │   │   └── products.ts         # Product CRUD routes
│   │   │
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.ts             # User schema with password hashing
│   │   │   ├── Product.ts          # Product schema
│   │   │   └── Order.ts            # Order schema
│   │   │
│   │   ├── controllers/             # Request handlers
│   │   │   └── productController.ts # Product CRUD logic
│   │   │
│   │   ├── services/                # Business logic layer
│   │   │   ├── userService.ts      # User operations
│   │   │   └── productService.ts   # Product operations
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts             # JWT authentication
│   │   │   └── errorHandler.ts     # Error handling
│   │   │
│   │   └── config/                  # Configuration
│   │       └── database.ts          # MongoDB connection
│   │
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── .env                        # Environment variables
│   └── .env.example                # Environment template
│
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root component with navigation
│   │   │
│   │   ├── pages/                  # Page components
│   │   │   ├── HomePage.tsx        # Homepage with featured products
│   │   │   ├── ProductsPage.tsx    # Product listing & filtering
│   │   │   └── CartPage.tsx        # Shopping cart
│   │   │
│   │   ├── components/             # Reusable components (add here)
│   │   │   └── (ready for new components)
│   │   │
│   │   ├── services/               # API integration
│   │   │   ├── api.ts             # Axios config with JWT
│   │   │   ├── productService.ts  # Product API calls
│   │   │   └── authService.ts     # Auth API calls
│   │   │
│   │   ├── utils/                  # Helper functions & hooks
│   │   │   └── useCart.ts         # Shopping cart hook
│   │   │
│   │   ├── types/                  # TypeScript interfaces
│   │   │   └── index.ts           # Type definitions
│   │   │
│   │   ├── styles/                 # CSS files (add here)
│   │   │   ├── index.css          # Global styles
│   │   │   └── App.css            # App component styles
│   │   │
│   │   └── store/                  # State management (ready)
│   │
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML template
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json              # TypeScript config
│   ├── package.json               # Frontend dependencies
│   └── .env.example               # Environment template
│
├── package.json                    # Monorepo root config
├── docker-compose.yml             # MongoDB Docker setup
├── .gitignore                      # Git ignore rules
│
├── README.md                       # Full documentation
├── SETUP.md                        # Setup instructions
├── QUICK_START.md                  # Quick reference
├── TODO.md                         # Future features
├── IMPLEMENTATION_COMPLETE.md      # Completion summary
└── DEVELOPMENT.md                  # This file

```

---

## 🔧 Development Workflow

### Starting Development

**Terminal 1 - Backend**
```powershell
cd C:\Users\Pantera\Desktop\clothing-shop\backend
npx ts-node src/index.ts
```

**Terminal 2 - Frontend**
```powershell
cd C:\Users\Pantera\Desktop\clothing-shop\frontend
npm run dev
```

**Terminal 3 - MongoDB (Optional)**
```powershell
# Option A: Docker
cd C:\Users\Pantera\Desktop\clothing-shop
docker-compose up -d

# Option B: Local MongoDB
mongod
```

### Code Changes

**Backend:**
- Edit files in `backend/src/`
- Changes auto-reload (you'll see in terminal)
- No restart needed

**Frontend:**
- Edit files in `frontend/src/`
- Changes auto-reload (you'll see in browser)
- Vite hot module replacement enabled

---

## 📝 Adding New Features

### Adding a New API Endpoint

1. **Create the route** in `backend/src/routes/newroute.ts`:
```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from new route' });
});

export default router;
```

2. **Import in** `backend/src/index.ts`:
```typescript
import newRoutes from './routes/newroute';

// Add to app:
app.use('/api/newroute', newRoutes);
```

3. **Test the endpoint:**
```bash
curl http://localhost:5000/api/newroute
```

### Adding a New React Page

1. **Create component** in `frontend/src/pages/NewPage.tsx`:
```typescript
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      <p>Your content here</p>
    </div>
  )
}
```

2. **Add route in** `frontend/src/App.tsx`:
```typescript
import NewPage from './pages/NewPage'

// In Routes:
<Route path="/newpage" element={<NewPage />} />
```

3. **Add navigation link** in `App.tsx`:
```typescript
<Link to="/newpage" className="...">New Page</Link>
```

### Adding a New Service

1. **Create service** in `backend/src/services/newService.ts`:
```typescript
export class NewService {
  async doSomething() {
    // Your logic here
  }
}
```

2. **Use in controller**:
```typescript
import { NewService } from '../services/newService';

const service = new NewService();
const result = await service.doSomething();
```

---

## 🧪 Testing

### Manual Testing

**Test User Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Test Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Test with Postman:**
1. Download Postman
2. Create a new request
3. Set method to GET/POST
4. Enter URL: http://localhost:5000/api/products
5. Click Send

### Frontend Testing

1. Open http://localhost:5173
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try different actions:
   - Click "Shop Now"
   - Filter products
   - Add to cart
   - Update quantities

---

## 🔍 Debugging

### Backend Debugging

**Check Logs:**
- Look at terminal where `npm run dev` is running
- Error messages show request/response issues

**MongoDB Issues:**
```typescript
// In backend/src/index.ts, check the connection:
console.log('MongoDB Status:', mongoose.connection.readyState);
// 0 = disconnected, 1 = connected
```

**API Errors:**
```bash
# Check what the API is returning
curl -v http://localhost:5000/api/products
```

### Frontend Debugging

**Browser Console:**
- F12 → Console tab
- Shows errors and API responses

**Network Tab:**
- F12 → Network tab
- Watch API calls being made
- See response status and data

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state

---

## 📦 Installing Dependencies

### Backend
```bash
cd backend

# Add a new package
npm install package-name

# Add as dev dependency
npm install --save-dev package-name

# View all packages
npm list
```

### Frontend
```bash
cd frontend

# Add a new package
npm install package-name

# Example: Add Tailwind CSS
npm install -D tailwindcss

# View all packages
npm list
```

---

## 🗄️ Database Management

### MongoDB Commands

**Connect to MongoDB:**
```bash
# Using mongo shell
mongosh

# Select database
use clothing-shop

# View collections
show collections

# View products
db.products.find()

# Clear collection
db.products.deleteMany({})
```

**Seed Sample Data:**
```bash
cd backend
npx ts-node src/seed.ts
```

**Using MongoDB Compass (GUI):**
1. Download MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Browse collections visually
4. Add/edit/delete documents

---

## 🚀 Performance Tips

### Frontend Optimization
```typescript
// Use React.memo for expensive components
const ProductCard = React.memo(({ product }) => {
  return <div>{product.name}</div>;
});

// Use useCallback for event handlers
const handleAddToCart = useCallback((product) => {
  // ...
}, []);

// Lazy load components
const HeavyComponent = lazy(() => import('./Heavy'));
```

### Backend Optimization
```typescript
// Use indexes for frequently queried fields
productSchema.index({ category: 1, price: 1 });

// Cache frequently accessed data
const cachedProducts = new Map();

// Use pagination for large datasets
const page = req.query.page || 1;
const limit = 20;
const skip = (page - 1) * limit;
```

---

## 📱 Mobile Development

### Testing on Mobile

**Local Network Testing:**
```bash
# Find your computer IP
ipconfig

# Access from mobile on same network
http://YOUR_IP:5173
```

**Using ngrok (Test from anywhere):**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5173
```

---

## 🔐 Security Best Practices

### Environment Variables
```
✅ Never commit .env file
✅ Use .env.example as template
✅ Keep secrets in environment vars
✅ Use strong random strings for JWT_SECRET
```

### Input Validation
```typescript
// Always validate user input
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const { error, value } = schema.validate(req.body);
```

### API Security
```typescript
// Use rate limiting
npm install express-rate-limit

// Add HTTPS in production
// Validate all requests
// Sanitize database queries
// Use prepared statements
```

---

## 🎯 Common Development Tasks

### Add a New Product Category

1. **Update Product Model** (`backend/src/models/Product.ts`):
```typescript
category: {
  enum: ['men', 'women', 'kids', 'accessories', 'newcategory'],
  // ...
}
```

2. **Update Frontend Filter** (`frontend/src/pages/ProductsPage.tsx`):
```typescript
<option value="newcategory">New Category</option>
```

### Add User Profile Page

1. **Create new page** (`frontend/src/pages/ProfilePage.tsx`):
```typescript
export default function ProfilePage() {
  const user = getCurrentUser();
  return <div>Profile: {user?.email}</div>;
}
```

2. **Add route** (`frontend/src/App.tsx`):
```typescript
<Route path="/profile" element={<ProfilePage />} />
```

### Add Product Search

1. **Update API** (`backend/src/controllers/productController.ts`):
```typescript
const searchTerm = req.query.search;
if (searchTerm) {
  query.$or = [
    { name: { $regex: searchTerm, $options: 'i' } },
    { description: { $regex: searchTerm, $options: 'i' } }
  ];
}
```

2. **Update Frontend**:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const products = await getProducts({ search: searchTerm });
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process or change PORT in .env |
| Port 5173 in use | Kill process or change port in vite.config.ts |
| MongoDB not connecting | Start MongoDB/Docker, check URI in .env |
| API not responding | Check backend is running, check firewall |
| CORS errors | Check CORS_ORIGIN in backend .env |
| Module not found | Run `npm install` in that directory |
| TypeScript errors | Check `tsconfig.json`, run `npm run lint` |

---

## 📚 Useful Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

## ✅ Development Checklist

Before committing code:
- [ ] Code compiles without errors
- [ ] No console warnings
- [ ] Tested locally
- [ ] Updated tests if needed
- [ ] Added comments for complex code
- [ ] Followed project structure
- [ ] Confirmed API endpoints work
- [ ] Confirmed UI looks good
- [ ] No sensitive data in code
- [ ] Updated documentation

---

## 🎓 Learning Path

1. **Week 1:** Understand project structure, modify existing code
2. **Week 2:** Add new API endpoints, create new components
3. **Week 3:** Implement features from TODO.md
4. **Week 4:** Add testing, optimize performance
5. **Week 5:** Deploy to production

---

## 💡 Tips for Success

1. **Read the code first** - Understand patterns
2. **Make small changes** - Test frequently
3. **Use version control** - Commit often
4. **Test thoroughly** - Frontend and backend
5. **Document changes** - Future you will thank you
6. **Ask questions** - Check docs first
7. **Start simple** - Build complexity gradually
8. **Keep it clean** - Refactor regularly

---

## 🎉 Ready to Develop!

You now have everything you need to:
- ✅ Understand the codebase
- ✅ Make changes confidently
- ✅ Add new features
- ✅ Debug issues
- ✅ Deploy updates

**Happy coding!** 🚀

---

**Last Updated:** November 13, 2025  
**Version:** 1.0  
**Status:** Ready for Development
