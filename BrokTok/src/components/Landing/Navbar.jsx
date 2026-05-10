import { useState, useEffect } from 'react';
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-gray-200/30 shadow-sm'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/financino.svg" alt="Financino Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-gray-900">Financinno</span>
        </div>
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            About
          </button>
        </div>

        {/* CTA Button */}
        <button className="hidden md:block px-8 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-sm">
          Start Free
        </button>
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <svg
            className="w-6 h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
