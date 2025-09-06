import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import WinPage from './components/WinPage';
import AccountPage from './components/AccountPage';
import Navigation from './components/Navigation';
import PromoStrip from './components/PromoStrip';
import Footer from './components/Footer';
import HowItWorksPage from './components/HowItWorksPage';
import RulesPage from './components/RulesPage';
import WinnersPage from './components/WinnersPage';
import FaqsPage from './components/FaqsPage';

export type Page = 'home' | 'quiz' | 'win' | 'account' | 'how-it-works' | 'rules' | 'winners' | 'faqs';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [hasPlayedQuiz, setHasPlayedQuiz] = useState(() => {
    // Check if user has already played (stored in localStorage)
    return localStorage.getItem('hasPlayedQuiz') === 'true';
  });
  const [userStats, setUserStats] = useState({
    totalEarnings: 453,
    scratchCards: 3,
    referrals: 12,
    linkClicks: 84,
    shares: 156
  });

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const updateEarnings = (amount: number) => {
    setUserStats(prev => ({ ...prev, totalEarnings: prev.totalEarnings + amount }));
  };

  const markQuizAsPlayed = () => {
    // Mark as played and store in localStorage to persist across sessions
    setHasPlayedQuiz(true);
    localStorage.setItem('hasPlayedQuiz', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navigation currentPage={currentPage} onNavigate={navigateTo} />
      <PromoStrip />
      
      <main>
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} hasPlayedQuiz={hasPlayedQuiz} />}
        {currentPage === 'quiz' && <QuizPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} hasPlayedQuiz={hasPlayedQuiz} />}
        {currentPage === 'win' && <WinPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} />}
        {currentPage === 'account' && <AccountPage userStats={userStats} />}
        {currentPage === 'how-it-works' && <HowItWorksPage />}
        {currentPage === 'rules' && <RulesPage />}
        {currentPage === 'winners' && <WinnersPage />}
        {currentPage === 'faqs' && <FaqsPage />}
        <Footer />
      </main>

    </div>
  );
}

export default App;