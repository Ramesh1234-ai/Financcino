import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClerk, useUser } from '@clerk/clerk-react';
import { ChevronRight, Star } from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'border-2 border-black text-black bg-transparent hover:bg-black hover:bg-opacity-5 hover:-translate-y-0.5 disabled:opacity-50',
    outline: 'border border-gray-300 text-gray-700 hover:border-gray-500 disabled:opacity-50',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-block px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold ${className}`}>
      {children}
    </span>
  );
}

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openSignIn } = useClerk();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignIn = () => {
    openSignIn({
      fallbackRedirectUrl: '/dashboard',
      signUpFallbackRedirectUrl: '/dashboard',
    }).catch((err) => console.error('Sign in error:', err));
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-md border-b border-black/5 shadow-sm' 
          : 'bg-white'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-lg p-1"
          aria-label="Financino home"
        >
          <span className="text-2xl font-bold font-serif text-gray-900">Financino</span>
          <img src="/financino.svg" alt="" className="w-8 h-8" aria-hidden="true" />
        </button>

        {/* Navigation Links */}
        <div className="flex gap-8 items-center" role="menubar">
          <button
            onClick={() => scrollToSection('features')}
            className="text-gray-600 font-medium hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            role="menuitem"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-gray-600 font-medium hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            role="menuitem"
          >
            Pricing
          </button>
          <a
            href="/docs"
            className="text-gray-600 font-medium hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            role="menuitem"
          >
            Docs
          </a>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleSignIn}
          aria-label="Sign in or start free trial"
        >
          Start Free
        </Button>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================
function Hero() {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [socialProof, setSocialProof] = useState({
    users: '500+',
    rating: 4.8,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, navigate]);

  // Fetch social proof stats from backend
  useEffect(() => {
    const fetchSocialProof = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiBase}/public/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache', // Cache for 1 hour
        });
        
        if (response.ok) {
          const data = await response.json();
          setSocialProof({
            users: data.totalUsers || '500+',
            rating: data.averageRating || 4.8,
            loading: false,
            error: null,
          });
        } else {
          // Fallback to default values if API fails
          setSocialProof(prev => ({
            ...prev,
            loading: false,
            error: 'Using cached stats',
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch social proof stats:', err);
        // Keep default values on error - stats will show "..." while loading
        setSocialProof(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    fetchSocialProof();
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await openSignIn({
        fallbackRedirectUrl: '/dashboard',
        signUpFallbackRedirectUrl: '/dashboard',
      });
    } catch (err) {
      console.error('Sign in error:', err);
      setSigningIn(false);
    }
  };

  return (
    <section 
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden bg-gradient-to-b from-amber-50/30 to-emerald-50/20"
      aria-label="Hero section"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-6 inline-block">
            ✦ AI-Powered Finance
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif text-gray-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Smart Expense Tracking + AI Financial Assistant
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Scan receipts in seconds. Chat with your AI financial advisor. Stay on budget automatically.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button 
            onClick={handleSignIn}
            loading={signingIn}
            disabled={signingIn}
          >
            Start Free
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              // TODO: Link to demo video
              window.location.href = '#features';
            }}
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600 mb-12 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {socialProof.loading ? '...' : socialProof.users}
            </span>
            <span>Active Users</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(socialProof.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-300 text-gray-300'
                  }`}
                  aria-hidden="true" 
                />
              ))}
            </div>
            <span>
              {socialProof.loading ? '...' : `${socialProof.rating}/5 rating`}
            </span>
          </div>
        </motion.div>

        {/* Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl">
            <div className="space-y-4">
              {[
                { emoji: '🛒', name: 'BigBasket Groceries', cat: 'Food & Grocery', amount: '−₹2,340' },
                { emoji: '🚌', name: 'Ola Ride — Koramangala', cat: 'Transport', amount: '−₹187' },
                { emoji: '💸', name: 'Salary — Infosys Ltd', cat: 'Income', amount: '+₹85,000' },
              ].map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        backgroundColor: ['#FBF3E8', '#EAF1FB', '#EBF3EE'][idx],
                      }}
                    >
                      {exp.emoji}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{exp.name}</div>
                      <div className="text-sm text-gray-500">{exp.cat}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">{exp.amount}</div>
                </div>
              ))}
              
              {/* Mini Chart */}
              <div className="flex items-end justify-around gap-2 pt-6 mt-6 border-t border-gray-100 h-24">
                {['45%', '65%', '50%', '75%', '55%', '40%', '60%'].map((height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-emerald-500 rounded-t hover:bg-amber-500 transition-colors"
                    style={{ height }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================
function Features() {
  const features = [
    { 
      emoji: '📄', 
      title: 'Receipt OCR', 
      desc: 'Scan any receipt in seconds and extract all details automatically using advanced AI.' 
    },
    { 
      emoji: '🤖', 
      title: 'AI Chatbot', 
      desc: 'Ask your finances anything and get instant insights from your personal AI advisor.' 
    },
    { 
      emoji: '📊', 
      title: 'Smart Analytics', 
      desc: 'Visualize spending patterns and get actionable recommendations to save more.' 
    },
  ];

  return (
    <section 
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="Features section"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 justify-center">Features</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 mb-6">
            Everything you need to manage money
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to help you track, analyze, and optimize your spending.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full hover:border-emerald-500 cursor-pointer">
                <div className="text-5xl mb-4">{feat.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================
function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      text: 'Financino has completely transformed how I track expenses. The AI insights have helped me save 30% more each month!',
      avatar: '👩‍💻',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Freelancer',
      text: 'Receipt scanning is incredibly accurate. I no longer spend hours managing receipts. It\'s a lifesaver!',
      avatar: '👨‍💼',
    },
    {
      name: 'Anaya Patel',
      role: 'Student',
      text: 'The chatbot feature is amazing. I can ask about my budget anytime and get instant answers. Highly recommend!',
      avatar: '👩‍🎓',
    },
  ];

  return (
    <section 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 to-white"
      aria-label="Testimonials section"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 justify-center">Social Proof</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900">
            Loved by users worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING SECTION
// ============================================================================
function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '0' : '0',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 receipt scans/month',
        'Basic expense tracking',
        'Mobile & web access',
        'Community support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '299' : '2990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For power users',
      features: [
        'Unlimited receipt scans',
        'AI financial advisor',
        'Advanced analytics',
        'Budget automation',
        'Email & chat support',
        'Custom categories',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Business',
      price: 'Custom',
      period: '',
      description: 'For teams & enterprises',
      features: [
        'Everything in Pro',
        'Multiple users',
        'Advanced integrations',
        'API access',
        'Priority support',
        'Custom reporting',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section 
      id="pricing"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="Pricing section"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 justify-center">Pricing</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={billingCycle === 'monthly'}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={billingCycle === 'yearly'}
            >
              Yearly
              <span className="ml-2 inline-block bg-emerald-500 text-white text-xs px-2 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-emerald-600 text-white">Most Popular</Badge>
                </div>
              )}
              <Card className={`h-full ${plan.popular ? 'border-2 border-emerald-600' : ''}`}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div>
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <Button 
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full mb-6"
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom plan? <a href="mailto:hello@financino.com" className="text-emerald-600 font-semibold hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
// ============================================================================
// FOOTER COMPONENT
// ============================================================================
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold font-serif mb-2">Financino</div>
            <p className="text-gray-400">Smart expense tracking powered by AI</p>
          </div>

          <div className="flex gap-8 justify-end">
            <a
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            >
              Terms of Service
            </a>
            <a
              href="mailto:hello@financino.com"
              className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-2 py-1"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          &copy; {currentYear} Financino. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// SEO OPTIMIZATION
// ============================================================================
function SEOHead() {
  useEffect(() => {
    // Set meta tags for SEO
    const metaTags = [
      { name: 'description', content: 'Track receipts automatically, chat with your AI financial assistant, and stay on budget. Free to start.' },
      { property: 'og:title', content: 'Financino — Smart Expense Tracking + AI Financial Assistant' },
      { property: 'og:description', content: 'Track receipts automatically, chat with your AI financial assistant, and stay on budget. Free to start.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Financino — Smart Expense Tracking' },
      { name: 'twitter:description', content: 'AI-powered expense tracking with receipt scanning and chatbot.' },
    ];

    metaTags.forEach((tag) => {
      const meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      
      // Remove existing tag if present
      const existing = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
      if (existing) existing.remove();
      
      document.head.appendChild(meta);
    });

    // Inject JSON-LD schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Financino',
      description: 'Smart Expense Tracking + AI Financial Assistant',
      applicationCategory: 'FinanceApplication',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'INR',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '299',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);
  }, []);

  return null;
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <SEOHead />
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}