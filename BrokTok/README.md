
# BrokeTok - Financial Expense Tracker

A modern web application for tracking expenses, uploading receipts, and analyzing spending patterns with AI-powered insights.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-v18+-brightgreen)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Project Components](#project-components)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Git Workflow](#git-workflow)
- [Development Tips](#development-tips)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Resources](#resources)

## 🎯 Overview

BrokeTok is a comprehensive financial expense tracker that helps users manage their spending through:
- **Receipt scanning** with automatic expense extraction
- **Analytics dashboard** with spending insights
- **Smart categorization** of expenses
- **AI chatbot** for financial advice
- **User authentication** for secure access

## ✨ Features

- 📸 **Receipt Upload & Processing** - Upload receipts for automatic expense tracking
- 📊 **Analytics Dashboard** - View spending patterns, trends, and insights
- 💰 **Expense Management** - Organize and categorize expenses
- ⚙️ **Settings & Preferences** - Customize your experience
- 🤖 **Chatbot Widget** - AI-powered financial advice
- 🔐 **User Authentication** - Secure login and registration
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean and intuitive interface

## 📁 Project Structure

```
brokeTok/
├── frontend/                 # React + Vite frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Login/Register components
│   │   │   ├── chatbot/     # Chatbot widget
│   │   │   ├── common/      # Shared components (Header, Sidebar)
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Uploads.jsx
│   │   │   │   └── ...
│   │   │   └── expenses/    # Expense components
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── useExpenses.js
│   │   ├── services/        # API services
│   │   │   ├── api.js
│   │   │   └── expenses.js
│   │   ├── utils/           # Utilities
│   │   │   └── formatters.js
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Dependencies
│   ├── .env                 # Environment variables
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   └── vercel.json          # Vercel deployment config
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 📦 Prerequisites

Before you start, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (included with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify installation:
```bash
node --version
npm --version
git --version
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=BrokeTok
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

Access the application at: **http://localhost:5173**

## 📜 Available Scripts

Run these commands from the `frontend` directory:

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint to check code quality
npm run format       # Format code with Prettier
```

## 🧩 Project Components

### Dashboard
Main page showing:
- Spending overview
- Recent transactions
- Budget summary
- Quick actions

### Analytics
Detailed analytics with:
- Spending trends (weekly/monthly/yearly)
- Category breakdown (pie chart)
- Budget vs actual spending
- Savings rate metrics

### Uploads
Receipt gallery management:
- View uploaded receipts
- Search and filter receipts
- Bulk delete operations
- Category updating

### Settings
User preferences:
- **Profile Tab** - Personal info, currency, timezone
- **Notifications Tab** - Email and app notification preferences
- **Privacy Tab** - Data privacy settings, connected sessions

### Chatbot
AI-powered financial assistant:
- Real-time chat interface
- Financial advice and insights
- Transaction analysis

## 🔌 API Endpoints

Expected backend API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/expenses` | Get all user expenses |
| POST | `/api/expenses` | Create new expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/analytics?range=month` | Get analytics data |
| POST | `/api/upload` | Upload receipt |
| GET | `/api/receipts?page=1` | Get receipt gallery |
| POST | `/api/chat` | Send chatbot message |

## 🛠️ Technology Stack

### Frontend Framework
- **React 18+** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Components & UI
- **Lucide React** - Modern icon library
- **React Icons** - Icon library
- **Recharts** - Chart library

### State Management
- **React Context API** - Global state management

### Authentication
- **Custom Auth Context** - User session management

## 🔧 Environment Variables

Create `.env` or `.env.local` in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=BrokeTok
VITE_APP_VERSION=1.0.0

# Optional: Analytics & Monitoring
VITE_SENTRY_DSN=your_sentry_dsn_here
```

**Note:** Variables must be prefixed with `VITE_` to be accessible in the browser.

## 📚 Git Workflow

### Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Make Changes and Commit
```bash
git add .
git commit -m "feat: add your feature description"
```

### Commit Message Conventions
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

### Push to Remote
```bash
git push origin feature/your-feature-name
```

### Create Pull Request
Open a PR on GitHub for code review.

## 💡 Development Tips

### Browser DevTools
- Install **React DevTools** browser extension for debugging
- Use **Redux DevTools** for state inspection

### Console Logging
- Check browser console for API errors and warnings
- Use `console.log()` for debugging during development

### Responsive Design
- Test on different screen sizes
- Use browser DevTools device emulation

### Code Quality
- Run ESLint before committing: `npm run lint`
- Format code: `npm run format`
- Keep component files under 300 lines

### Performance
- Use React.memo() for expensive components
- Implement lazy loading with React.lazy()
- Profile with React Profiler

### API Testing
- Use Postman or Insomnia for testing endpoints
- Check network tab in DevTools
- Mock API responses during development

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 5174
```

### Module Not Found Error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
1. Ensure `.env` is in `frontend/` directory
2. Variables must start with `VITE_`
3. Restart dev server after changing `.env`

### Build Fails
```bash
npm run build -- --debug
```

### Hot Reload Not Working
- Check VS Code ESLint extension (may conflict)
- Restart dev server: `Ctrl+C` then `npm run dev`

### API Calls Failing
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

## 🌐 Deployment

### Vercel Deployment

BrokeTok is pre-configured for Vercel:

1. Push code to GitHub repository
2. Connect repository to [Vercel](https://vercel.com)
3. Vercel automatically deploys on push to `main` branch

**Configuration file:** `vercel.json`

### Environment Variables on Vercel
1. Go to Project Settings → Environment Variables
2. Add all required variables from `.env`
3. Redeploy to apply changes

### Build Configuration
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 📖 Resources

### Documentation
- [React Docs](https://react.dev) - React documentation
- [Vite Docs](https://vitejs.dev) - Vite guide
- [Tailwind CSS](https://tailwindcss.com) - Tailwind documentation
- [Recharts](https://recharts.org) - Chart library docs

### Tools & Services
- [Vercel Docs](https://vercel.com/docs) - Deployment platform
- [GitHub Docs](https://docs.github.com) - Version control
- [npm Docs](https://docs.npmjs.com) - Package manager

### Community
- [React Community](https://react.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)
- [Dev.to](https://dev.to) - Developer blog platform
