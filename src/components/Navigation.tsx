import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, HelpCircle, User, Trophy, BookOpen, Award, Users, Trash2 } from 'lucide-react';

export type Page = 'home' | 'quiz' | 'win' | 'account' | 'how-it-works' | 'rules' | 'winners' | 'faqs';

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quiz', label: 'Play Quiz', icon: HelpCircle },
    { path: '/account', label: 'My Account', icon: User },
    { path: '/how-it-works', label: 'How It Works', icon: BookOpen },
    { path: '/rules', label: 'Rules', icon: Award },
    { path: '/winners', label: 'Winners List', icon: Users },
    { path: '/faqs', label: 'FAQs', icon: Trophy },
  ];

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  const clearAllData = () => {
    // Clear localStorage
    try {
      localStorage.clear();
    } catch (e) {
      try {
        localStorage.removeItem('hasPlayedQuiz');
        localStorage.removeItem('userStats');
        localStorage.removeItem('quizAnswers');
        localStorage.removeItem('currentQuestion');
        localStorage.removeItem('scratchCardData');
      } catch (_) {}
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (_) {}

    // Clear cookies (best-effort)
    try {
      const cookies = document.cookie ? document.cookie.split(';') : [];
      for (const rawCookie of cookies) {
        const cookie = rawCookie.trim();
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

        // Expire cookie for common paths/domains
        const expires = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        const path = 'Path=/';
        // Current domain
        document.cookie = `${name}=; ${expires}; ${path}`;
        // Also try removing with domain variations
        const hostParts = window.location.hostname.split('.');
        for (let i = 0; i < hostParts.length - 1; i++) {
          const domain = '.' + hostParts.slice(i).join('.');
          document.cookie = `${name}=; ${expires}; ${path}; Domain=${domain}`;
        }
      }
    } catch (_) {}

    // Reload the page to reset the app state
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Answer & Get Real Money
            </span>
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleMenuClick}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Clear Data Button for Testing */}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data? This will reset your progress and earnings.')) {
                      clearAllData();
                    }
                    handleMenuClick();
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 border-t border-gray-200 mt-3 pt-3"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="font-medium text-sm">Clear Data (Testing)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

    </>
  );
}