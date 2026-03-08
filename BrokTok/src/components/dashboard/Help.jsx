import React, { useState } from 'react';
import { FaSearch, FaQuestion, FaEnvelope, FaPhone, FaChevronDown } from 'react-icons/fa';
import Sidebar from '../common/Sidebar';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: 'How do I add a new expense?',
      answer: 'You can add a new expense by going to the Dashboard and clicking the "Add Expense" button. Fill in the expense details and save.'
    },
    {
      id: 2,
      question: 'How do I upload receipts?',
      answer: 'Navigate to the Uploads section and drag-and-drop your receipt images or PDFs. Our system will automatically extract expense information.'
    },
    {
      id: 3,
      question: 'How do I view my spending analytics?',
      answer: 'Go to the Analytics page to see detailed charts and reports of your spending patterns. You can filter by time period (week, month, year).'
    },
    {
      id: 4,
      question: 'Can I export my expense data?',
      answer: 'Yes, you can export your expense data from the Analytics page or Dashboard. Click the export button to download as CSV or PDF.'
    },
    {
      id: 5,
      question: 'How do I set budget limits?',
      answer: 'Visit the Settings page and configure your budget limits per category. You will receive notifications when approaching your limit.'
    },
    {
      id: 6,
      question: 'Is my data secure?',
      answer: 'Yes, all your data is encrypted and stored securely. We comply with industry-standard security practices and GDPR regulations.'
    },
    {
      id: 7,
      question: 'How do I change my account settings?',
      answer: 'Go to Settings to update your profile information, email, password, and notification preferences.'
    },
    {
      id: 8,
      question: 'How does the chatbot help me?',
      answer: 'The AI-powered chatbot can answer your questions about expense tracking, provide spending insights, and suggest ways to save money.'
    },
  ];

  const contactMethods = [
    {
      icon: FaEnvelope,
      title: 'Email Support',
      detail: 'support@expensetrack.com',
      description: 'Response time: 24 hours',
    },
    {
      icon: FaPhone,
      title: 'Phone Support',
      detail: '+1 (555) 123-4567',
      description: 'Available Mon-Fri, 9AM-6PM EST',
    },
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        currentUser={user?.email || 'User'}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-64'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">❓ Help & Support</h1>
            <p className="text-gray-600">Find answers to common questions and get in touch with our support team</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQs Section */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaQuestion className="text-emerald-500" />
                  Frequently Asked Questions
                </h2>

                <div className="space-y-3">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-900">{item.question}</span>
                          <FaChevronDown
                            className={`text-emerald-500 transition-transform ${
                              expandedFaq === item.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedFaq === item.id && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <p className="text-gray-700">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No matching questions found. Try a different search.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Need More Help?</h3>
                <p className="text-gray-700 mb-4">
                  Can't find what you're looking for? Contact our support team directly.
                </p>
              </div>

              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-emerald-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{method.title}</h4>
                        <p className="text-emerald-600 font-medium text-sm mb-1">{method.detail}</p>
                        <p className="text-gray-500 text-xs">{method.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Additional Resources */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Additional Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      📖 User Guide & Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      🐛 Report a Bug
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      💡 Request a Feature
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      📋 Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
