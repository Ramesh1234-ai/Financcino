import React, { useState, useEffect } from 'react';
import useExpenses from '../../hooks/useExpenses'
import useAuth from '../../hooks/useAuth'
import Sidebar from '../common/Sidebar';
import ChatbotWidget from '../chatbot/Chatbotwidget';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ManualExpenseForm from '../expenses/ManualExpenseForm';
// Header Component
const Header = ({ userName, onAddExpense }) => {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) {
      setGreeting('Good afternoon');
    } else if (hour >= 18) {
      setGreeting('Good evening');
    } else {
      setGreeting('Good morning');
    }
  }, []);
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="mb-6">
        <h1 className="text-black text-3xl font-bold mb-1">
          {greeting}{userName ? `, ${userName}` : ''} 👋
        </h1>
        <p className="text-gray-400 text-sm">Here's your financial overview</p>
      </div>
      <ManualExpenseForm onSuccess={onAddExpense} />
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ label, value, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
        <div className="h-3 bg-white/10 rounded w-20 mb-3 animate-pulse" />
        <div className="h-7 bg-white/10 rounded w-24 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-black text-2xl font-bold">{value}</div>
    </div>
  );
};

// Spending Chart Component
const SpendingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Spending Trend
        </div>
        <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
        Spending Trend
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
          <YAxis stroke="#9ca3af" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Line type="monotone" dataKey="amount" stroke="#43e97b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Upload Receipt Card Component
const UploadReceiptCard = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const { getToken } = useAuth(); // Get getToken from auth context

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file) => {
    setUploadStatus('processing');
    try {
      const token = await getToken()
      const res = await api.uploadReceipt(file, token)
      if (res?.error) {
        throw new Error(res.error || 'Upload API failed')
      }

      setUploadStatus('success')
      onUpload()
      setTimeout(() => setUploadStatus(null), 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(null)
      alert(`Upload failed. ${error.message || 'Please try again.'}`)
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
      <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📤</span>
        Upload Receipt
      </h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
        className={`text-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging
          ? 'border-indigo-500 bg-indigo-500/15'
          : 'border-indigo-500/50 bg-indigo-500/8 hover:bg-indigo-500/15 hover:border-indigo-500'
          }`}
      >
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-400 text-sm">
          Drag and drop your receipt here or click to select
        </p>
        <input
          id="fileInput"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadStatus && (
        <div className="mt-4 text-center">
          {uploadStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-indigo-400">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
          {uploadStatus === 'success' && (
            <div className="text-emerald-400 text-sm font-medium">✓ Upload successful!</div>
          )}
        </div>
      )}
    </div>
  );
};

// Category Breakdown Component
const CategoryBreakdown = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
        <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📊</span>
          By Category
        </h2>
        <div className="text-center py-8">
          <div className="text-5xl mb-3 opacity-30">📁</div>
          <p className="text-gray-500 text-sm">Upload receipts to see category breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
      <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span>
        By Category
      </h2>
      <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto custom-scrollbar">
        {categories.map((cat, index) => {
          const amount = parseFloat(cat.amount) || 0
          const count = cat.count || 0
          const name = cat.name || 'Other'
          
          return (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-white/3 rounded-lg border-l-4 border-indigo-500 transition-all duration-200 hover:bg-white/5"
            >
              <div>
                <div className="text-white text-sm font-medium">{name}</div>
                <div className="text-black-400 text-xs">{count} transactions</div>
              </div>
              <div className="text-emerald-400 text-sm font-semibold">
                ${amount.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// Recent Transactions Component
const RecentTransactions = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
        <h2 className="text-black text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📋</span>
          Recent Transactions
        </h2>
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-white/3 rounded-lg animate-pulse">
              <div className="h-4 bg-white/10 rounded w-24 mb-2" />
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
        <h2 className="text-black text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📋</span>
          Recent Transactions
        </h2>
        <div className="text-center py-8">
          <div className="text-5xl mb-3 opacity-30">🧾</div>
          <p className="text-gray-500 text-sm">No recent transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl shadow-lg">
      <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📋</span>
        Recent Transactions
      </h2>
      <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto custom-scrollbar">
        {transactions.map((transaction, index) => {
          const amount = parseFloat(transaction.amount) || 0
          const date = transaction.date || transaction.created_at || 'N/A'
          const category = transaction.category || 'Other'
          
          return (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-white/3 rounded-lg border-l-4 border-indigo-500 transition-all duration-200 hover:bg-white/5"
            >
              <div>
                <div className="text-white text-sm font-medium">{date}</div>
                <div className="text-gray-400 text-xs">{category}</div>
              </div>
              <div className="text-emerald-400 text-sm font-semibold">
                ${amount.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// Main App Component
const ExpenseTrackerDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [error, setError] = useState(null);

  const auth = useAuth()
  const navigate = useNavigate()
  const currentUser = auth?.user?.fullName || auth?.user?.firstName || auth?.user?.email || 'Guest'
  const expenses = useExpenses()

  const fetchData = async () => {
    try {
      setError(null)
      await expenses.loadExpenses()
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load expenses')
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-red-600 font-semibold mb-2">Error Loading Data</h2>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchData()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
        onLogout={async () => { await auth.logout(); navigate('/login') }}
      />

      <main
        className={`transition-all duration-300 p-4 md:p-6 ${isSidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-64'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <Header userName={currentUser} onAddExpense={fetchData} />
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatsCard
              label="Total Spent"
              value={`$${(expenses.stats?.totalSpent || 0).toFixed(2)}`}
              isLoading={expenses.loading}
            />
            <StatsCard
              label="Daily Average"
              value={`$${(expenses.stats?.dailyAverage || 0).toFixed(2)}`}
              isLoading={expenses.loading}
            />
            <StatsCard
              label="Transactions"
              value={expenses.stats?.transactions || 0}
              isLoading={expenses.loading}
            />
            <StatsCard
              label="Savings Goal"
              value={`$${(expenses.stats?.savingsGoal || 0).toFixed(2)}`}
              isLoading={expenses.loading}
            />
          </div>

          {/* Chart - Full Width on Mobile */}
          <div className="mb-6">
            <SpendingChart data={expenses.chartData || []} />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <UploadReceiptCard onUpload={fetchData} />
            <CategoryBreakdown categories={expenses.categories || []} />
          </div>

          {/* Recent Transactions - Full Width */}
          <RecentTransactions transactions={expenses.transactions || []} isLoading={expenses.loading} />

          {/* Footer Link */}
          <div className="text-center mt-6">
            <a
              href="#uploads"
              className="inline-block bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              View All Uploads →
            </a>
          </div>

          {/* Chatbot Widget (Fixed/Floating) */}
          <ChatbotWidget />
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ExpenseTrackerDashboard;