# 💰 Kharcha-Core: Full-Stack Expense Tracking Application

A modern, full-stack financial expense management application built with **React** (frontend) and **Node.js/Express** (backend). Designed to help users track expenses, manage budgets, and gain financial insights through intuitive interfaces and AI-powered chatbot assistance.

**Live Repository:** [Financcino on GitHub](https://github.com/Ramesh1234-ai/Financcino)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Kharcha-Core** is a comprehensive expense tracking system designed for personal finance management. The application enables users to:

- 📝 Log and categorize expenses
- 💳 Upload and process receipts with OCR capabilities
- 📊 Visualize spending patterns with analytics dashboards
- 💬 Get AI-powered financial advice through the integrated chatbot
- 🏦 Set and track budget goals
- 🔐 Secure authentication and data privacy

**Project Name Etymology:** "Kharcha" (खर्च) is Urdu/Hindi for "expense" - reflecting the application's core functionality.

---

## 🛠️ Technology Stack

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | ^5.2.1 | Web framework & routing |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | ^9.2.3 | MongoDB ODM |
| **JWT** | ^9.0.0 | Authentication & authorization |
| **Bcrypt** | ^5.1.0 | Password hashing |
| **Multer** | ^1.4.5 | File upload handling |
| **Helmet** | ^7.0.0 | Security headers |
| **Express-Validator** | ^7.0.0 | Input validation |
| **Winston** | ^3.10.0 | Logging |
| **CORS** | ^2.8.5 | Cross-origin requests |
| **Express-Rate-Limit** | ^7.0.0 | API rate limiting |

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.2.0 | UI framework |
| **Vite** | Latest | Build tool & dev server |
| **React Router** | ^7.12.0 | Client-side routing |
| **TailwindCSS** | ^4.2.0 | Styling |
| **Clerk** | ^5.59.4 | Authentication service |
| **Recharts** | ^3.6.0 | Data visualization |
| **React Icons** | ^5.5.0 | Icon components |
| **Lucide React** | ^0.408.0 | UI icons |
| **Axios** | (via API service) | HTTP client |

### **Additional Tools**
- **Git** - Version control
- **ESLint** - Code linting
- **Jest** - Testing framework (backend)

---

## ✨ Features

### **Expense Management**
- ✅ Add, edit, and delete expenses
- ✅ Categorize expenses (Food, Transport, Utilities, etc.)
- ✅ Filter expenses by date, category, and amount
- ✅ Real-time expense tracking

### **Receipt Processing**
- ✅ Upload receipt images (JPG, PNG)
- ✅ Automatic expense extraction from receipts
- ✅ Bulk upload capabilities
- ✅ Receipt storage and retrieval

### **Analytics & Reporting**
- ✅ Interactive spending charts and graphs
- ✅ Category-wise expense breakdown
- ✅ Monthly and yearly trends
- ✅ Export reports (planned)

### **Budget Management**
- ✅ Set budget limits per category
- ✅ Budget vs actual spending comparison
- ✅ Budget alerts and notifications

### **Authentication & Security**
- ✅ Secure JWT-based authentication
- ✅ Clerk integration for modern auth flows
- ✅ Role-based access control
- ✅ Password encryption with Bcrypt
- ✅ Rate limiting on API endpoints

### **AI Assistance**
- ✅ ChatBot for financial advice
- ✅ Spending pattern analysis
- ✅ Smart recommendations

---

## 📁 Project Structure

```
Kharcha-Core/
├── Backend/                          # Node.js Express API
│   ├── config/
│   │   └── config.js                # Database & app configuration
│   ├── controllers/                  # Business logic
│   │   ├── auth.controller.js
│   │   ├── expense.controller.js
│   │   ├── category.controller.js
│   │   ├── receipts.controller.js
│   │   ├── chatbot.controller.js
│   │   └── analytics.controller.js
│   ├── models/                       # MongoDB schemas
│   │   ├── User.models.js
│   │   ├── expense.models.js
│   │   ├── Category.models.js
│   │   ├── Receipt.models.js
│   │   ├── Budget.models.js
│   │   ├── Transaction.models.js
│   │   └── Analytics.models.js
│   ├── routes/                       # API endpoints
│   │   ├── auth.routes.js
│   │   ├── expenses.routes.js
│   │   ├── categories.routes.js
│   │   ├── receipts.routes.js
│   │   ├── chatbot.routes.js
│   │   ├── budgets.routes.js
│   │   └── analytics.routes.js
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js
│   │   ├── validation.js            # Input validation
│   │   └── requestLogger.js
│   ├── utils/
│   │   └── logger.js                # Winston logger
│   ├── logs/                         # Application logs
│   ├── package.json
│   ├── server.js                    # Entry point
│   ├── seed.js                      # Database seeding
│   └── test-routes.sh               # Testing script
│
├── BrokTok/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── auth/                # Auth components
│   │   │   ├── common/              # Reusable components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── dashboard/           # Dashboard pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Help.jsx
│   │   │   ├── expenses/            # Expense components
│   │   │   │   ├── ExpenseList.jsx
│   │   │   │   ├── ExpenseItem.jsx
│   │   │   │   └── ManualExpenseForm.jsx
│   │   │   ├── chatbot/             # Chatbot components
│   │   │   │   ├── Chatbotwidget.jsx
│   │   │   │   ├── chatwindow.jsx
│   │   │   │   └── MessageBubble.jsx
│   │   │   ├── alerting/            # Alert components
│   │   │   └── receipts/            # Receipt upload
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Auth hook
│   │   │   ├── useExpenses.js       # Expenses data hook
│   │   │   └── useToast.js          # Toast notifications
│   │   ├── services/
│   │   │   └── api.js               # API client & endpoints
│   │   ├── utils/
│   │   │   └── formatters.js        # Utility functions
│   │   ├── assets/                  # Images, icons, styles
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/                       # Static assets
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── eslint.config.js             # ESLint rules
│   ├── tailwind.config.js           # TailwindCSS config
│   ├── package.json
│   └── .env.example                 # Environment template
│
├── .gitignore                        # Git ignore rules
├── .git/                             # Git repository
├── README.md                         # This file
├── GIT_FIX_GUIDE.md                 # Git troubleshooting
├── QUICK_FIX_REFERENCE.md           # Quick Git reference
└── [other docs]
```

---

## ✅ Prerequisites

Before setting up the project, ensure you have:

### **System Requirements**
- **Node.js** 18.x or higher
- **npm** 8.x or higher (comes with Node.js)
- **Git** 2.30+
- **MongoDB** (local or cloud instance via Atlas)

### **Software to Install**

```bash
# Check Node.js and npm versions
node --version    # Should be v18 or higher
npm --version     # Should be v8 or higher

# Install Git if not already installed
git --version
```

### **External Services**
- **MongoDB Atlas** (free tier available at https://www.mongodb.com/cloud/atlas)
- **Clerk Auth** (free tier at https://clerk.com)

---

## 🚀 Installation & Setup

This is a monorepo with both backend and frontend. Clone once, configure both separately.

### **Clone the Repository**

```bash
# Clone the main repository
git clone https://github.com/Ramesh1234-ai/Financcino.git
cd Kharcha-Core

# Verify structure
ls -la
# Should show: Backend/, BrokTok/, .git/, .gitignore, README.md, etc.
```

---

### **Backend Setup**

Navigate to the Backend folder and install dependencies:

```bash
cd Backend

# Install dependencies
npm install

# Verify installation
npm list
```

#### **Backend Environment Configuration**

Create a `.env` file in the `Backend/` folder:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kharcha?retryWrites=true&w=majority
# Or local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/kharcha

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Clerk Configuration (if using Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15000000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

**See [Backend .env.example](Backend/.env.example) for all available options.**

---

### **Frontend Setup**

Navigate to the BrokTok folder and install dependencies:

```bash
cd BrokTok

# Install dependencies
npm install

# Verify installation
npm list
```

#### **Frontend Environment Configuration**

Create a `.env` file in the `BrokTok/` folder:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Vite configuration
VITE_APP_NAME=Kharcha-Core

# Backend API Configuration
VITE_API_URL=http://localhost:3000/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_OCR=true
```

**See [Frontend .env.example](BrokTok/.env.example) for all available options.**

---

## 🔐 Environment Configuration

### **Complete .env Setup Guide**

#### **.env.example Files**

Both Backend and BrokTok folders contain `.env.example` files. **Never commit real `.env` files to Git** - they contain secrets!

```bash
# ✅ DO: Commit .env.example (template)
git add Backend/.env.example BrokTok/.env.example

# ❌ DON'T: Commit .env files with real secrets
git add Backend/.env          # ❌ WRONG
git add BrokTok/.env          # ❌ WRONG
```

#### **MongoDB Setup**

1. **Option A: MongoDB Atlas (Cloud - Recommended)**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a cluster
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/kharcha`

2. **Option B: Local MongoDB**
   - Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
   - Start MongoDB service
   - Use: `mongodb://localhost:27017/kharcha`

#### **Clerk Authentication Setup**

1. Go to https://clerk.com and create an account
2. Create a new application
3. Copy your keys from the Clerk Dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY` (Publishable Key)
   - `CLERK_SECRET_KEY` (Secret Key)

#### **JWT Secret Generation**

Generate secure JWT secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (using Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ▶️ Running the Application

You can run the backend and frontend simultaneously. Use two terminal windows or tabs:

### **Terminal 1: Start Backend Server**

```bash
cd Backend

# Development mode (with auto-reload)
npm run dev

# Or standard start
npm start
```

**Expected Output:**
```
Server is running on port 3000
MongoDB connected successfully
```

### **Terminal 2: Start Frontend Development Server**

```bash
cd BrokTok

# Start Vite dev server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### **Access the Application**

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health (if implemented)

---

### **Build for Production**

#### **Backend Build**
```bash
cd Backend
npm run build  # If build script exists
# Backend runs directly from source with: node server.js
```

#### **Frontend Build**
```bash
cd BrokTok

# Build for production
npm run build

# Output will be in dist/ folder
# Preview production build
npm run preview
```

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:3000/api
```

### **Authentication**
All protected endpoints require JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### **Main API Routes**

#### **Authentication Routes** (`/auth`)
```
POST   /auth/register          Register new user
POST   /auth/login             Login user
POST   /auth/refresh           Refresh JWT token
POST   /auth/logout            Logout user
GET    /auth/me                Get current user info
```

#### **Expense Routes** (`/expenses`)
```
GET    /expenses               Get all expenses
POST   /expenses               Create new expense
GET    /expenses/:id           Get expense by ID
PUT    /expenses/:id           Update expense
DELETE /expenses/:id           Delete expense
GET    /expenses/category/:cat Get expenses by category
```

#### **Category Routes** (`/categories`)
```
GET    /categories             Get all categories
POST   /categories             Create category
PUT    /categories/:id         Update category
DELETE /categories/:id         Delete category
```

#### **Receipt Routes** (`/receipts`)
```
GET    /receipts               Get all receipts
POST   /receipts/upload        Upload receipt image
GET    /receipts/:id           Get receipt details
DELETE /receipts/:id           Delete receipt
POST   /receipts/extract       Extract data from receipt (OCR)
```

#### **Budget Routes** (`/budgets`)
```
GET    /budgets                Get all budgets
POST   /budgets                Create budget
PUT    /budgets/:id            Update budget
DELETE /budgets/:id            Delete budget
GET    /budgets/status         Get budget status
```

#### **Analytics Routes** (`/analytics`)
```
GET    /analytics/summary      Get spending summary
GET    /analytics/trends       Get spending trends
GET    /analytics/breakdown    Get category breakdown
GET    /analytics/forecast     Get spending forecast
```

#### **Chatbot Routes** (`/chatbot`)
```
POST   /chatbot/message        Send message to chatbot
GET    /chatbot/history        Get chat history
POST   /chatbot/clear          Clear chat history
```

### **Error Responses**

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

---

## 🏗️ Project Architecture

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Analytics, Expenses, Settings    │   │
│  │  Components: Charts, Forms, Lists, Sidebars         │   │
│  │  State: AuthContext, useExpenses, useToast hooks    │   │
│  │  Styling: TailwindCSS + Custom CSS                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────_______________─────────────────────┘
                         │
         ┌───────────────┴──────────────┐
         │    HTTP/HTTPS + JWT Auth      │
         │   (Axios Client in api.js)    │
         └───────────────┬──────────────┘
                         │
┌─────────────────────────┴──────────────────────────────────┐
│              Backend (Node.js/Express)                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Routes Layer: /auth, /expenses, /analytics, etc.    │ │
│  │  Controllers: Business logic & request handling      │ │
│  │  Middleware: Auth, validation, error handling        │ │
│  │  Models: Mongoose schemas for MongoDB               │ │
│  │  Database: MongoDB collections                       │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴──────────────┐
         │   MongoDB Driver/Mongoose    │
         └───────────────┬──────────────┘
                         │
         ┌───────────────┴──────────────┐
         │     MongoDB Database         │
         │   (Local or MongoDB Atlas)   │
         └──────────────────────────────┘
```

### **Data Flow Example: Create Expense**

```
1. User fills expense form (React component)
   ↓
2. Form submission triggers POST /api/expenses
   ↓
3. Frontend (api.js) sends HTTP request with JWT token
   ↓
4. Backend receives request
   ├─ Middleware: JWT verification
   ├─ Middleware: Input validation
   ├─ Controller: expense.controller.js processes data
   ├─ Model: expense.models.js validates schema
   └─ Database: MongoDB stores document
   ↓
5. Backend returns 201 + expense data
   ↓
6. Frontend receives response
   ├─ Updates state (useExpenses hook)
   ├─ Re-renders component with new expense
   └─ Shows success toast notification
```

---

## 👨‍💻 Development Workflow

### **Git Workflow**

This project uses a **monorepo structure** with both backend and frontend in one Git repository.

```
Main Branch Structure:
─────────────────────
Kharcha-Core/
  ├── .git/              ← Single Git repository for entire project
  ├── Backend/           ← NO .git here
  ├── BrokTok/           ← NO .git here
  └── [other files]
```

**Important:** Never initialize `.git` in subdirectories. All commits should be made from the root.

### **Git Commands for Development**

```bash
# Always work from root directory
cd Kharcha-Core

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/expense-filters

# Work on files in either Backend or BrokTok (or both)
# Edit: Backend/controllers/expense.controller.js
# Edit: BrokTok/src/components/expenses/ExpenseList.jsx

# Stage and commit together
git add Backend/ BrokTok/
git commit -m "feat: Add expense filtering by date range"

# Push to GitHub
git push origin feature/expense-filters

# Create Pull Request on GitHub for review
```

### **Common Development Scenarios**

#### **Backend Only Changes**
```bash
git checkout -b feature/new-api-endpoint
# Modify Backend/ files
git add Backend/
git commit -m "feat: Add budget API endpoints"
git push origin feature/new-api-endpoint
```

#### **Frontend Only Changes**
```bash
git checkout -b feature/new-dashboard
# Modify BrokTok/ files
git add BrokTok/
git commit -m "feat: New analytics dashboard design"
git push origin feature/new-dashboard
```

#### **Full-Stack Feature (Both Frontend & Backend)**
```bash
git checkout -b feature/receipt-upload
# Modify Backend/controllers/receipts.controller.js
# Modify BrokTok/src/components/receipts/
git add Backend/ BrokTok/
git commit -m "feat: Implement receipt upload with OCR processing"
git push origin feature/receipt-upload
```

### **Debugging Tips**

#### **Backend Debugging**
```bash
cd Backend

# Run with debug logging
DEBUG=* npm run dev

# Or check logs
tail -f logs/app.log

# Test specific route
curl http://localhost:3000/api/expenses -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Frontend Debugging**
```bash
cd BrokTok

# Check browser console (Chrome DevTools)
# Inspect React components (React Developer Tools extension)
# Check Network tab for API calls

# Run linting
npm run lint
```

---

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### **1. MongoDB Connection Error**

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
```bash
# If using MongoDB Atlas, verify connection string in .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kharcha

# If using local MongoDB, ensure it's running:
# macOS
brew services start mongodb-community

# Windows (in MongoDB installation directory)
mongod

# Linux
sudo systemctl start mongod
```

#### **2. Port Already in Use**

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000        # macOS/Linux
netstat -ano | grep 3000  # Windows

# Kill the process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

#### **3. Vite Dev Server Won't Start**

**Error Message:**
```
Error: EADDRINUSE: address already in use :::5173
```

**Solutions:**
```bash
cd BrokTok

# Kill process using port 5173
lsof -i :5173

# Or change port
npm run dev -- --port 5174
```

#### **4. JWT Token Expired**

**Symptom:** Getting 401 Unauthorized after some time

**Solution:**
```bash
# Generate a new token by logging in again
# Or implement refresh token endpoint

# In .env, increase JWT_EXPIRE if needed
JWT_EXPIRE=30d
```

#### **5. CORS Error in Browser**

**Error Message:**
```
Access to XMLHttpRequest at blocked by CORS policy
```

**Solution:**
```bash
# Ensure backend CORS is configured correctly in .env:
CORS_ORIGIN=http://localhost:5173

# And in Backend/server.js:
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

#### **6. Files Not Committing (Git Issue)**

**Problem:** Modified files not showing in `git status`

**Check .gitignore:**
```bash
# Verify file pattern in .gitignore
cat .gitignore | grep "node_modules\|.env"

# Force add if needed (dangerous - check first!)
git add -f Backend/.env.example  # Only .example files!
```

#### **7. Clerk Authentication Not Working**

**Solution:**
```bash
# 1. Verify Clerk keys in .env:
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 2. Check Clerk Dashboard for domain whitelist
# 3. Ensure http://localhost:5173 is whitelisted
# 4. Clear browser cookies and retry
```

### **Getting Help**

```bash
# Check logs
cd Backend && tail -f logs/app.log

# Test backend connections
curl http://localhost:3000/api/health

# Check environment
node -v && npm -v && git --version

# See detailed error in validation
npm run lint
```

---

## 🔒 Security Notes

### **Important Security Practices**

#### **1. Never Commit Secrets**
```bash
# ❌ WRONG - Never commit .env files with real values
git add Backend/.env    # Contains real credentials!

# ✅ CORRECT - Only commit .example files
git add Backend/.env.example
```

#### **2. Environment Variables**
```bash
# All sensitive data goes in .env files:
- JWT_SECRET
- MongoDB connection strings
- API keys (Clerk, payment processors, etc.)
- EMAIL passwords
- OAuth tokens
```

#### **3. JWT Best Practices**
```env
# Use strong, random secrets
JWT_SECRET=your-very-long-random-string-at-least-32-chars

# Set reasonable expiration
JWT_EXPIRE=7d

# Use HTTPS in production
```

#### **4. Database Security**
```bash
# Use strong MongoDB passwords
# Enable MongoDB Atlas IP whitelist
# Use encryption at rest
# Regular backups
```

#### **5. Password Security**
```javascript
// Backend automatically hashes passwords with Bcrypt
// Never log passwords
// Use HTTPS for password transmission
```

#### **6. Rate Limiting**
```env
# Configured in Backend .env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests
```

#### **7. File Upload Security**
```bash
# Validate file types strictly
# Limit file size
# Scan for malware
# Store outside web root
```

---

## 📦 Deployment

### **Deploying to Production**

#### **Backend Deployment (Heroku/Railway/Render)**

```bash
cd Backend

# Build for production
npm run build

# Add Procfile
echo "web: node server.js" > Procfile

# Set production environment variables
# DATABASE_URL, JWT_SECRET, NODE_ENV=production, etc.

# Deploy
git push heroku main
```

#### **Frontend Deployment (Vercel/Netlify)**

```bash
cd BrokTok

# Build static files
npm run build

# Output in: dist/

# Netlify
netlify deploy --prod --dir=dist

# Or Vercel
vercel deploy --prod
```

### **Environment Variables for Production**

```env
# Backend
NODE_ENV=production
MONGODB_URI=<production-database-url>
JWT_SECRET=<strong-production-secret>
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_CLERK_PUBLISHABLE_KEY=<production-key>
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Before Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

### **Code Standards**

- **Backend**: Follow Express.js conventions
- **Frontend**: Follow React hooks patterns
- **Comments**: Document complex logic
- **Linting**: Run `npm run lint` before committing
- **Testing**: Add tests for new features

### **Commit Message Format**

```
feat: Add new expense categories
fix: Resolve JWT expiration bug
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify expense controller
test: Add expense filter tests
chore: Update dependencies
```

---

## 📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

---

## 👥 Authors & Contact

**Project:** Kharcha-Core (Financcino)

**Repository:** [GitHub - Ramesh1234-ai/Financcino](https://github.com/Ramesh1234-ai/Financcino)

For questions or support, please open an issue on GitHub.

---

## 📚 Additional Resources

### **Documentation**
- [Backend Setup Guide](Backend/README.md) (if exists)
- [Frontend Deployment Guide](BrokTok/DEPLOYMENT.md)
- [Git Fix Guide](GIT_FIX_GUIDE.md)
- [Security Fix Reference](QUICK_FIX_REFERENCE.md)

### **External Resources**
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [JWT Authentication](https://jwt.io/)
- [Clerk Authentication](https://clerk.com/docs)

### **Useful Commands**

```bash
# Repository Setup
git clone <repo>
cd Kharcha-Core

# Backend Development
cd Backend && npm install && npm run dev

# Frontend Development
cd BrokTok && npm install && npm run dev

# Full-stack development (requires 2 terminals)
# Terminal 1: npm run dev (in Backend)
# Terminal 2: npm run dev (in BrokTok)

# Linting
cd Backend && npm run lint      # If available
cd BrokTok && npm run lint

# Building for production
cd Backend                      # Run as-is
cd BrokTok && npm run build     # Creates dist/

# Testing
cd Backend && npm test          # If available
```

---

## 🎉 Getting Started Checklist

- [ ] Clone repository
- [ ] Install Node.js 18+
- [ ] Create `.env` files (Backend and BrokTok)
- [ ] Set up MongoDB (Atlas or local)
- [ ] Set up Clerk authentication
- [ ] Install backend dependencies: `cd Backend && npm install`
- [ ] Install frontend dependencies: `cd BrokTok && npm install`
- [ ] Start backend: `npm run dev` (in Backend)
- [ ] Start frontend: `npm run dev` (in BrokTok)
- [ ] Access application at http://localhost:5173
- [ ] Create your first expense!

---

**Happy expense tracking! 💰**

*Last Updated: March 2026*
