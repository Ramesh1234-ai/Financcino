import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  const teamMembers = [
    { name: 'Alex Singh', role: 'Co-founder & Full Stack Developer' },
    { name: 'Priya Patel', role: 'Co-founder & Product Designer' },
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
            <Link to="/docs" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              API Docs
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
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
          About <span className="text-emerald-600">Financino</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Reimagining personal finance through intelligent expense tracking and AI-powered insights
        </p>
      </motion.section>

      {/* Why We Built It Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="mb-16" variants={fadeInUp}>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Why We Built Financino</h2>
          <div className="prose prose-lg max-w-3xl text-slate-600 space-y-4">
            <p>
              Most people struggle with personal finance—not because they lack discipline, but because expense tracking 
              is tedious. Receipts pile up, categories get confusing, and insights remain buried in spreadsheets.
            </p>
            <p>
              We built Financino to change that. By combining intelligent receipt OCR, AI-powered analysis, and intuitive 
              analytics, we make financial awareness effortless. Our mission: help you understand your spending, optimize 
              your budget, and make smarter financial decisions—all without the friction.
            </p>
            <p>
              Whether you're a freelancer tracking business expenses or someone trying to build better financial habits, 
              Financino is designed to be your financial co-pilot.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2 className="text-4xl font-bold text-slate-900 mb-12" variants={fadeInUp}>
          The Team
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={staggerContainer}
        >
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              className="p-8 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mb-4"></div>
              <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>
              <p className="text-slate-600 mt-2">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Current Status Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2 className="text-4xl font-bold text-slate-900 mb-12" variants={fadeInUp}>
          Current Status
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          {/* Beta Version */}
          <motion.div
            className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200"
            variants={fadeInUp}
          >
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Beta Version</h3>
            <p className="text-slate-600">
              We're actively developing new features. Your feedback helps us build better.
            </p>
          </motion.div>

          {/* Free to Use */}
          <motion.div
            className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200"
            variants={fadeInUp}
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Free to Use</h3>
            <p className="text-slate-600">
              No credit card required. Track unlimited expenses and use all core features.
            </p>
          </motion.div>

          {/* Privacy-First */}
          <motion.div
            className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
            variants={fadeInUp}
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Privacy-First</h3>
            <p className="text-slate-600">
              Your financial data is yours. We never sell or share your information.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Get Started?</h2>
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 text-center text-slate-600">
        <p>&copy; 2026 Financino. All rights reserved. Privacy-first financial tracking.</p>
      </footer>
    </div>
  );
};

export default About;
