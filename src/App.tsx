import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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

// Component to handle navigation logic
function AppContent() {
  const navigate = useNavigate();
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
    const pathMap: Record<Page, string> = {
      'home': '/',
      'quiz': '/quiz',
      'win': '/win',
      'account': '/account',
      'how-it-works': '/how-it-works',
      'rules': '/rules',
      'winners': '/winners',
      'faqs': '/faqs'
    };
    navigate(pathMap[page]);
  };

  // Function to update earnings (can be used for future features)
  // const updateEarnings = (amount: number) => {
  //   setUserStats(prev => ({ ...prev, totalEarnings: prev.totalEarnings + amount }));
  // };

  const markQuizAsPlayed = () => {
    // Mark as played and store in localStorage to persist across sessions
    setHasPlayedQuiz(true);
    localStorage.setItem('hasPlayedQuiz', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navigation />
      <PromoStrip />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={navigateTo} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/quiz" element={<QuizPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/win" element={<WinPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} />} />
          <Route path="/account" element={<AccountPage userStats={userStats} />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;