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
=======
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
### **Frontend Setup**
Navigate to the BrokTok folder and install dependencies:
```bash
cd BrokTok
# Install dependencies
npm install
# Verify installation
npm list
```
