import { useState } from 'react';
import { Menu, X, Home, HelpCircle, User, Trophy, BookOpen, Award, Users } from 'lucide-react';

export type Page = 'home' | 'quiz' | 'win' | 'account' | 'how-it-works' | 'rules' | 'winners' | 'faqs';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'quiz' as Page, label: 'Play Quiz', icon: HelpCircle },
    { id: 'account' as Page, label: 'My Account', icon: User },
    { id: 'how-it-works' as Page, label: 'How It Works', icon: BookOpen },
    { id: 'rules' as Page, label: 'Rules', icon: Award },
    { id: 'winners' as Page, label: 'Winners List', icon: Users },
    { id: 'faqs' as Page, label: 'FAQs', icon: Trophy },
  ];

  const handleMenuClick = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
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
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-600 border border-emerald-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

    </>
  );
}