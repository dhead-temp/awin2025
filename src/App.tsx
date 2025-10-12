import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import WinPage1 from './components/WinPage1';
import QuizProcessing from './components/QuizProcessing';
import AccountPage from './components/AccountPage';
import Navigation from './components/Navigation';
import PromoStrip from './components/PromoStrip';
import Footer from './components/Footer';
import PaymentProofsFooter from './components/PaymentProofsFooter';
import HowItWorksPage from './components/HowItWorksPage';
import RulesPage from './components/RulesPage';
import WinnersPage from './components/WinnersPage';
import FaqsPage from './components/FaqsPage';
import { apiService } from './services/api';

export type Page = 'home' | 'quiz' | 'processing' | 'win' | 'win1' | 'account' | 'how-it-works' | 'rules' | 'winners' | 'faqs';

// Component to handle navigation logic
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPlayedQuiz, setHasPlayedQuiz] = useState(() => {
    // Check if user has already played (stored in localStorage)
    return localStorage.getItem('hasPlayedQuiz') === 'true';
  });
  const [userStats, setUserStats] = useState(() => {
    // Initialize with zero earnings if user hasn't played quiz yet
    const hasPlayed = localStorage.getItem('hasPlayedQuiz') === 'true';
    return {
      totalEarnings: hasPlayed ? 453 : 0,
      referrals: 12,
      linkClicks: 84,
      shares: 156
    };
  });
  const [currentUser, setCurrentUser] = useState<{
    id: number | null;
    token: string | null;
    invitedBy: string | null;
  }>(() => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : { id: null, token: null, invitedBy: null };
  });

  // Handle invite code detection and click count increment
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const inviteCode = urlParams.get('by');
    
    if (inviteCode && inviteCode !== currentUser.invitedBy) {
      // Increment click count for the invite code
      apiService.incrementClickCount(inviteCode).then(response => {
        if (response.status === 'success') {
          console.log(`Click count incremented for invite code: ${inviteCode}`);
        } else {
          console.error('Failed to increment click count:', response.message);
        }
      });
      
      // Store the invite code for later use
      setCurrentUser(prev => ({
        ...prev,
        invitedBy: inviteCode
      }));
    }
  }, [location.search, currentUser.invitedBy]);

  const navigateTo = (page: Page) => {
    const pathMap: Record<Page, string> = {
      'home': '/',
      'quiz': '/quiz',
      'processing': '/processing',
      'win1': '/win1',
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
    // Update user stats with quiz earnings
    setUserStats(prev => ({
      ...prev,
      totalEarnings: prev.totalEarnings + 453
    }));
  };

  // Create user when withdraw button is clicked
  const createUser = async () => {
    if (currentUser.id) {
      // User already exists
      return currentUser;
    }

    try {
      const response = await apiService.createUser();
      if (response.status === 'success' && response.data) {
        const newUser = {
          id: response.data.user_id,
          token: response.data.token,
          invitedBy: currentUser.invitedBy
        };
        
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        console.log('User created successfully:', newUser);
        return newUser;
      } else {
        console.error('Failed to create user:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  // Update current user in localStorage when it changes
  useEffect(() => {
    if (currentUser.id || currentUser.token || currentUser.invitedBy) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navigation />
      <PromoStrip />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={navigateTo} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/quiz" element={<QuizPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/processing" element={<QuizProcessing onNavigate={navigateTo} />} />
          <Route path="/win1" element={<WinPage1 onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} currentUser={currentUser} onCreateUser={createUser} />} />
          <Route path="/account" element={<AccountPage userStats={userStats} />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
        </Routes>
        <Footer />
      </main>
      <PaymentProofsFooter />
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