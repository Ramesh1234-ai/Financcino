import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Docs = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleOpenDocs = () => {
    // Open Swagger UI in a new tab
    window.open('http://localhost:5000/api-docs', '_blank');
  };

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/api/auth/login',
      description: 'Sign in with email and password',
      color: 'bg-blue-100 border-blue-300',
      methodColor: 'text-blue-600',
    },
    {
      method: 'GET',
      endpoint: '/api/expenses',
      description: 'Fetch all user expenses',
      color: 'bg-green-100 border-green-300',
      methodColor: 'text-green-600',
    },
    {
      method: 'POST',
      endpoint: '/api/expenses',
      description: 'Create a new expense',
      color: 'bg-blue-100 border-blue-300',
      methodColor: 'text-blue-600',
    },
    {
      method: 'GET',
      endpoint: '/api/analytics',
      description: 'Get analytics and spending insights',
      color: 'bg-purple-100 border-purple-300',
      methodColor: 'text-purple-600',
    },
    {
      method: 'POST',
      endpoint: '/api/receipts/upload',
      description: 'Upload and process receipt image',
      color: 'bg-blue-100 border-blue-300',
      methodColor: 'text-blue-600',
    },
    {
      method: 'GET',
      endpoint: '/api/budgets',
      description: 'Fetch all user budgets',
      color: 'bg-green-100 border-green-300',
      methodColor: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-2xl font-bold text-slate-900">Financino</span>
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              Home
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          API Documentation
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Explore the Financino API for seamless integrations and automation
        </p>
      </motion.section>

      {/* Quick Start Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Quick Start</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Info Card */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Before You Start</h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>Authenticate using JWT tokens or Clerk OAuth</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>All requests require an Authorization header</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>Rate limit: 100 requests per minute</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>Base URL: <code className="bg-slate-100 px-2 py-1 rounded">http://localhost:5000/api</code></span>
              </li>
            </ul>
          </div>

          {/* Base URL Card */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">API Base URL</h3>
            <code className="block bg-white p-4 rounded-lg border border-slate-200 text-slate-600 break-all mb-4">
              http://localhost:5000/api
            </code>
            <p className="text-slate-600 text-sm">
              All endpoints are relative to this base URL. See examples in the Swagger UI.
            </p>
          </div>
        </div>
      </motion.section>

      {/* API Endpoints Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Available Endpoints</h2>
        <div className="space-y-4">
          {apiEndpoints.map((endpoint, idx) => (
            <motion.div
              key={idx}
              className={`p-6 rounded-lg border ${endpoint.color} hover:shadow-md transition-shadow`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`${endpoint.methodColor} font-bold px-3 py-1 bg-white rounded text-sm`}>
                      {endpoint.method}
                    </span>
                    <code className="bg-white px-3 py-1 rounded text-slate-700 font-mono text-sm">
                      {endpoint.endpoint}
                    </code>
                  </div>
                  <p className="text-slate-600">{endpoint.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Interactive Swagger Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Interactive Documentation</h2>
        <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-center">
          <p className="text-slate-600 mb-6 text-lg">
            Explore the complete API with request/response examples, and test endpoints directly
          </p>
          <button
            onClick={handleOpenDocs}
            className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl inline-block"
          >
            Open Interactive Swagger UI →
          </button>
        </div>
      </motion.section>

      {/* Authentication Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Authentication</h2>
        <div className="p-8 bg-white rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Bearer Token</h3>
          <p className="text-slate-600 mb-6">
            Include your JWT token in the Authorization header for all authenticated requests:
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>Authorization: Bearer {'{'}your_jwt_token{'}'}</code>
          </div>
        </div>
      </motion.section>

      {/* Response Format Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Response Format</h2>
        <div className="p-8 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600 mb-4">All responses follow a consistent format:</p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}`}</pre>
          </div>
        </div>
      </motion.section>

      {/* Support Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Help?</h2>
        <p className="text-slate-600 mb-6">
          Check out the FAQ section or reach out to our support team
        </p>
        <Link
          to="/help"
          className="inline-block px-8 py-4 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-colors"
        >
          Go to Help
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 text-center text-slate-600">
        <p>&copy; 2026 Financino API. Built with ❤️ for developers.</p>
      </footer>
    </div>
  );
};

export default Docs;
