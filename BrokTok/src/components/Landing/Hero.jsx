import { useEffect } from "react";
const EXPENSES = [
  { icon: "🛒", bg: "#FBF3E8", name: "BigBasket Groceries", cat: "Food & Grocery · Today 9:14 AM · OCR scanned", amount: "−₹2,340", neg: true },
  { icon: "🚌", bg: "#EAF1FB", name: "Ola Ride — Koramangala", cat: "Transport · Yesterday 7:52 PM", amount: "−₹187", neg: true },
  { icon: "💸", bg: "#EBF3EE", name: "Salary — Infosys Ltd", cat: "Income · 1 May · Auto-categorised", amount: "+₹85,000", neg: false },
];

const CHART = [
  { label: "Nov", h: "38%", active: false },
  { label: "Dec", h: "55%", active: false },
  { label: "Jan", h: "42%", active: false },
  { label: "Feb", h: "61%", active: false },
  { label: "Mar", h: "48%", active: false },
  { label: "Apr", h: "35%", active: false },
  { label: "May", h: "51%", active: true },
];

const NAV_ITEMS = [
  { icon: "🏠", label: "Overview", active: true },
  { icon: "📄", label: "Receipts", active: false },
  { icon: "📊", label: "Analytics", active: false },
  { icon: "🤖", label: "AI Assistant", active: false },
  { icon: "🔔", label: "Alerts", active: false },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .finio-hero *, .finio-hero *::before, .finio-hero *::after { box-sizing: border-box; }

  .finio-hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 6rem 1.5rem 4rem;
    position: relative; overflow: hidden;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    background: #FAFAF7;
    color: #1A1A18;
    -webkit-font-smoothing: antialiased;
  }

  .finio-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 75% 55% at 15% 15%, rgba(180,221,200,.38) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 88% 82%, rgba(251,240,222,.55) 0%, transparent 60%),
      #FAFAF7;
  }
  .finio-hero-bg::after {
    content: ''; position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(26,26,24,.065) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }
  .finio-inner { position: relative; z-index: 1; max-width: 820px; width: 100%; margin: 0 auto; }
  .finio-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: #fff; border: 1px solid #E4E4DF;
    border-radius: 100px; padding: .38rem 1.1rem;
    font-size: .78rem; font-weight: 600; letter-spacing: .04em;
    color: #3D7A54; margin-bottom: 2.2rem;
    box-shadow: 0 1px 4px rgba(26,26,24,.06);
    animation: finioFadeUp .6s ease both;
  }
  .finio-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #3D7A54;
    animation: finioPulse 2s infinite;
  }
  @keyframes finioPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .finio-h1 {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.8rem, 7vw, 5rem);
    line-height: 1.05; letter-spacing: -.02em;
    color: #1A1A18; margin-bottom: 1.4rem;
    animation: finioFadeUp .7s .1s ease both;
  }
  .finio-h1 em { font-style: italic; color: #3D7A54; }

  .finio-sub {
    font-size: clamp(1rem, 2vw, 1.18rem);
    color: rgba(26,26,24,.6); font-weight: 400;
    max-width: 540px; margin: 0 auto 2.4rem;
    line-height: 1.6;
    animation: finioFadeUp .7s .2s ease both;
  }

  .finio-cta-row {
    display: flex; gap: 12px; justify-content: center;
    flex-wrap: wrap; margin-bottom: 2.8rem;
    animation: finioFadeUp .7s .3s ease both;
  }
  .finio-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #1A1A18; color: #fff;
    padding: .8rem 1.9rem; border-radius: 100px;
    font-size: .9rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 14px rgba(26,26,24,.18);
    transition: transform .15s, box-shadow .15s;
    border: none; cursor: pointer;
  }
  .finio-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(26,26,24,.22); }
  .finio-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: #1A1A18;
    padding: .8rem 1.9rem; border-radius: 100px;
    font-size: .9rem; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    border: 1.5px solid #E4E4DF;
    box-shadow: 0 1px 4px rgba(26,26,24,.06);
    transition: transform .15s, border-color .15s;
    cursor: pointer;
  }
  .finio-btn-secondary:hover { transform: translateY(-1px); border-color: rgba(26,26,24,.3); }
  .finio-proof {
    display: flex; align-items: center; justify-content: center;
    gap: 1.2rem; flex-wrap: wrap;
    font-size: .8rem; color: rgba(26,26,24,.6); font-weight: 500;
    margin-bottom: 4rem;
    animation: finioFadeUp .7s .4s ease both;
  }
  .finio-proof-sep { width: 4px; height: 4px; border-radius: 50%; background: rgba(26,26,24,.22); }
  @keyframes finioFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .finio-db-body { grid-template-columns: 1fr; }
    .finio-sidebar { display: none; }
    .finio-balance { font-size: 1.5rem; }
  }
`;

export default function Hero() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <section className="finio-hero">
      <div className="finio-hero-bg" />
      <div className="finio-inner">

        {/* Badge */}
        <div className="finio-badge">
          <span className="finio-badge-dot" />
          AI-Powered Finance · Trusted by 10+ users
        </div>

        {/* Headline */}
        <h1 className="finio-h1">
          Track every rupee<br />
          with <em>AI that thinks</em><br />
          like your accountant
        </h1>

        {/* Subheading */}
        <p className="finio-sub">
          Finio automatically scans receipts, categorises spending, and gives you a personal AI
          assistant that answers "where did my money go?" in seconds.
        </p>

        {/* CTAs */}
        <div className="finio-cta-row">
          <button className="finio-btn-primary">Start Free — No card needed →</button>
          <button className="finio-btn-secondary">▶ &nbsp;Watch 90s demo</button>
        </div>

        {/* Social proof */}
        <div className="finio-proof">
          <span><span style={{ color: "#C97D1E" }}>★★★</span> &nbsp;3.0 rating</span>
          <span className="finio-proof-sep" />
          <span>10+ active users</span>
        </div>
      </div>
    </section>
  );
}