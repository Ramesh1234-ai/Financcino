import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClerk, useUser } from '@clerk/clerk-react';
// ============================================================================
// COLOR CONSTANTS
// ============================================================================
const COLORS = {
  primary: '#4A7C59',      // Sage green
  secondary: '#D4882A',    // Warm amber
  cream: '#FAFAF7',        // Warm cream
  white: '#FFFFFF',
  dark: '#1A1A18',         // Nearly black
  gray: '#6B6B66',         // Muted gray
  lightGray: '#E8E8E4',    // Light border gray
  border: '#D9D9D0',       // Subtle border
};

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
    transition: 'all 0.3s ease',
    backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.7)' : COLORS.white,
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    borderBottom: isScrolled ? `1px solid rgba(0, 0, 0, 0.08)` : 'none',
    boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
  };

  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  const logoTextStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.dark,
    fontFamily: "'Instrument Serif', serif",
  };

  const dotStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: COLORS.primary,
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const linksStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  };

  const linkButtonStyle = {
    background: 'none',
    border: 'none',
    color: COLORS.gray,
    fontSize: '1rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s',
  };

  const ctaButtonStyle = {
    padding: '0.75rem 2rem',
    backgroundColor: COLORS.dark,
    color: COLORS.white,
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.2s',
  };

  const handleStartFree = () => {
    openSignIn().then(() => {
      // Redirect to dashboard after sign in
      window.location.href = '/dashboard';
    }).catch((err) => {
      console.error('Sign in error:', err);
    });
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <span style={logoTextStyle}>Financino</span>
          <img src="/financino.svg" alt="Financino Logo" className="w-8 h-8" />
        </div>
        <div style={linksStyle}>
          <button
            style={linkButtonStyle}
            onMouseEnter={(e) => (e.target.style.color = COLORS.dark)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.gray)}
            onClick={() => scrollToSection('features')}
          >
            Features
          </button>
          <button
            style={linkButtonStyle}
            onMouseEnter={(e) => (e.target.style.color = COLORS.dark)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.gray)}
            onClick={() =>Link("/Docs")}
          >
            Docs
          </button>
        </div>

        <button
          style={ctaButtonStyle}
          onClick={handleStartFree}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2F2F2B';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = COLORS.dark;
            e.target.style.transform = 'scale(1)';
          }}
        >
          Start Free
        </button>
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

  // Auto-redirect if user is already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, navigate]);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 1.5rem 4rem',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: COLORS.cream,
  };

  const bgStyle = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    background: `
      radial-gradient(ellipse 75% 55% at 15% 15%, rgba(74, 124, 89, 0.15) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 88% 82%, rgba(212, 136, 42, 0.12) 0%, transparent 60%),
      ${COLORS.cream}
    `,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: '999px',
    color: COLORS.primary,
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '2rem',
    fontFamily: "'DM Sans', sans-serif",
  };

  const h1Style = {
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    fontFamily: "'Instrument Serif', serif",
    fontWeight: 700,
    color: COLORS.dark,
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  };

  const subheadingStyle = {
    fontSize: '1.25rem',
    color: COLORS.gray,
    marginBottom: '2.5rem',
    lineHeight: 1.6,
    fontFamily: "'DM Sans', sans-serif",
  };

  const ctasContainerStyle = {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  };

  const primaryButtonStyle = {
    padding: '1rem 2.5rem',
    backgroundColor: COLORS.dark,
    color: COLORS.white,
    border: 'none',
    borderRadius: '999px',
    fontSize: '1.1rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  };

  const secondaryButtonStyle = {
    padding: '1rem 2.5rem',
    backgroundColor: 'transparent',
    color: COLORS.dark,
    border: `2px solid ${COLORS.dark}`,
    borderRadius: '999px',
    fontSize: '1.1rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  };

  const socialProofStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: COLORS.gray,
    fontSize: '0.95rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  };

  const dotSeparatorStyle = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: COLORS.gray,
  };

  const dashboardCardStyle = {
    backgroundColor: COLORS.white,
    borderRadius: '1.5rem',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    maxWidth: '600px',
    margin: '0 auto',
    border: `1px solid ${COLORS.border}`,
  };

  const expenseRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.lightGray}`,
    marginBottom: '1.5rem',
    fontFamily: "'DM Sans', sans-serif",
  };

  const expenseIconStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginRight: '1rem',
  };

  const expenseDetailStyle = {
    flex: 1,
  };

  const expenseNameStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: COLORS.dark,
    marginBottom: '0.25rem',
  };

  const expenseCatStyle = {
    fontSize: '0.85rem',
    color: COLORS.gray,
  };

  const expenseAmountStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: COLORS.dark,
  };

  const chartContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '0.5rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${COLORS.lightGray}`,
    height: '120px',
  };

  const barStyle = {
    width: '12%',
    backgroundColor: COLORS.primary,
    borderRadius: '6px 6px 0 0',
    transition: 'background-color 0.3s',
  };

  const expenses = [
    { icon: '🛒', name: 'BigBasket Groceries', cat: 'Food & Grocery', amount: '−₹2,340' },
    { icon: '🚌', name: 'Ola Ride — Koramangala', cat: 'Transport', amount: '−₹187' },
    { icon: '💸', name: 'Salary — Infosys Ltd', cat: 'Income', amount: '+₹85,000' },
  ];
  const barHeights = ['45%', '65%', '50%', '75%', '55%', '40%', '60%'];
  return (
    <div style={containerStyle}>
      <div style={bgStyle}></div>

      <div style={contentStyle}>
        <motion.div
          style={badgeStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ✦ AI-Powered Finance
        </motion.div>

        <motion.h1
          style={h1Style}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Smart Expense Tracking + AI Financial Assistant
        </motion.h1>

        <motion.p
          style={subheadingStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Scan receipts in seconds. Chat with your AI financial advisor. Stay on budget automatically.
        </motion.p>

        <motion.div
          style={ctasContainerStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            style={primaryButtonStyle}
            onClick={() => {
              openSignIn().then(() => {
                window.location.href = '/dashboard';
              });
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2F2F2B';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = COLORS.dark;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Start Free →
          </button>
          <button
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${COLORS.dark}10`;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          style={socialProofStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span>10 users</span>
          <div style={dotSeparatorStyle}></div>
          <span>3.0★ rating</span>
        </motion.div>

        <motion.div
          style={dashboardCardStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {expenses.map((exp, idx) => (
            <div key={idx} style={expenseRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    ...expenseIconStyle,
                    backgroundColor: ['#FBF3E8', '#EAF1FB', '#EBF3EE'][idx],
                  }}
                >
                  {exp.icon}
                </div>
                <div style={expenseDetailStyle}>
                  <div style={expenseNameStyle}>{exp.name}</div>
                  <div style={expenseCatStyle}>{exp.cat}</div>
                </div>
              </div>
              <div style={expenseAmountStyle}>{exp.amount}</div>
            </div>
          ))}

          <div style={chartContainerStyle}>
            {barHeights.map((height, idx) => (
              <div
                key={idx}
                style={{ ...barStyle, height }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.secondary)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.primary)}
              ></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// FEATURES GRID COMPONENT
// ============================================================================
function Features() {
  const containerStyle = {
    padding: '5rem 1.5rem',
    backgroundColor: COLORS.cream,
    fontFamily: "'DM Sans', sans-serif",
  };

  const maxWidthStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: '1rem',
  };

  const h2Style = {
    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
    fontFamily: "'Instrument Serif', serif",
    fontWeight: 700,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: '4rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  };

  const cardStyle = {
    backgroundColor: COLORS.white,
    borderRadius: '1.5rem',
    padding: '2.5rem',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const emojiStyle = {
    fontSize: '3.5rem',
    marginBottom: '1.5rem',
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.dark,
    marginBottom: '0.75rem',
  };

  const descStyle = {
    fontSize: '1rem',
    color: COLORS.gray,
    lineHeight: 1.6,
  };

  const features = [
    { emoji: '📄', title: 'Receipt OCR', desc: 'Scan any receipt in seconds' },
    { emoji: '🤖', title: 'AI Chatbot', desc: 'Ask your finances anything' },
    { emoji: '📊', title: 'Analytics', desc: 'See where every rupee goes' },
  ];

  return (
    <section id="features" style={containerStyle}>
      <div style={maxWidthStyle}>
        <div style={labelStyle}>Features</div>
        <h2 style={h2Style}>Everything you need to manage money</h2>

        <div style={gridStyle}>
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              style={cardStyle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              <div style={emojiStyle}>{feat.emoji}</div>
              <h3 style={titleStyle}>{feat.title}</h3>
              <p style={descStyle}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ============================================================================
// FOOTER COMPONENT
// ============================================================================
function Footer() {
  const containerStyle = {
    backgroundColor: COLORS.dark,
    color: COLORS.white,
    padding: '3rem 1.5rem',
    fontFamily: "'DM Sans', sans-serif",
  };

  const maxWidthStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '2rem',
  };

  const leftStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: "'Instrument Serif', serif",
  };

  const taglineStyle = {
    color: '#AAA',
    fontSize: '0.95rem',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'flex-end',
  };

  const linkStyle = {
    color: '#AAA',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.3s',
  };

  const copyrightStyle = {
    borderTop: '1px solid #444',
    paddingTop: '2rem',
    textAlign: 'center',
    color: '#AAA',
    fontSize: '0.85rem',
  };

  const addressStyle = {
    fontStyle: 'normal',
  };

  return (
    <footer style={containerStyle}>
      <div style={maxWidthStyle}>
        <div style={contentStyle}>
          <div style={leftStyle}>
            <div style={logoStyle}>Financino</div>
            <p style={taglineStyle}>Smart expense tracking powered by AI</p>
          </div>

          <div style={linksContainerStyle}>
            <a
              href="/"
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = COLORS.white)}
              onMouseLeave={(e) => (e.target.style.color = '#AAA')}
            >
              Privacy Policy
            </a>
            <a
              href="/"
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = COLORS.white)}
              onMouseLeave={(e) => (e.target.style.color = '#AAA')}
            >
              Terms of Service
            </a>
            <address style={addressStyle}>
              <a
                href="mailto:hello@finio.app"
                style={linkStyle}
                onMouseEnter={(e) => (e.target.style.color = COLORS.white)}
                onMouseLeave={(e) => (e.target.style.color = '#AAA')}
              >
                donordojo@gmail.com
              </a>
            </address>
          </div>
        </div>

        <div style={copyrightStyle}>
          &copy; {new Date().getFullYear()} Financino. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Set SEO meta tags
    document.title = 'Finio — Smart Expense Tracking + AI Financial Assistant';

    const metaTags = [
      { name: 'description', content: 'Track receipts automatically, chat with your AI financial assistant, and stay on budget. Free to start.' },
      { property: 'og:title', content: 'Finio — Smart Expense Tracking + AI Financial Assistant' },
      { property: 'og:description', content: 'Track receipts automatically, chat with your AI financial assistant, and stay on budget. Free to start.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Finio — Smart Expense Tracking + AI Financial Assistant' },
      { name: 'twitter:description', content: 'Track receipts automatically, chat with your AI financial assistant, and stay on budget. Free to start.' },
      { rel: 'canonical', href: 'https://finan-cino.vercel.app' },
    ];

    metaTags.forEach((tag) => {
      const meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.setAttribute('property', tag.property);
      if (tag.rel) {
        meta.rel = tag.rel;
        meta.href = tag.href;
      } else {
        meta.content = tag.content;
      }
      document.head.appendChild(meta);
    });

    // Inject JSON-LD schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Finio',
      description: 'Smart Expense Tracking + AI Financial Assistant',
      applicationCategory: 'FinanceApplication',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '9',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ backgroundColor: COLORS.cream }}>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}