import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import WinPage1 from './components/WinPage1';
import AccountPage from './components/AccountPage';
import Navigation from './components/Navigation';
import PromoStrip from './components/PromoStrip';
import Footer from './components/Footer';
import PaymentProofsFooter from './components/PaymentProofsFooter';
import HowItWorksPage from './components/HowItWorksPage';
import { apiService } from './services/api';
import { initGA, trackPageView, trackReferralClick } from './utils/analytics';

export type Page = 'home' | 'quiz' | 'win' | 'win1' | 'account' | 'how-it-works';

// Component to handle navigation logic
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPlayedQuiz, setHasPlayedQuiz] = useState(() => {
    // Check if user has already played (stored in localStorage)
    return localStorage.getItem('hasPlayedQuiz') === 'true';
  });
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);
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

  // Initialize Google Analytics
  useEffect(() => {
    // Only initialize in production or when GA_MEASUREMENT_ID is set
    if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_GA_MEASUREMENT_ID) {
      const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
      initGA(measurementId);
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Check quiz reward status from database
  useEffect(() => {
    const checkQuizRewardStatus = async () => {
      console.log('App: checkQuizRewardStatus called');
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.id) {
          try {
            const response = await apiService.getUser(userData.id);
            if (response.status === 'success' && response.data) {
              const claimed = response.data.user.is_quiz_reward_claimed === '1' || response.data.user.is_quiz_reward_claimed === 'true';
              setIsQuizRewardClaimed(claimed);
              // Sync localStorage with database status
              if (claimed) {
                setHasPlayedQuiz(true);
                localStorage.setItem('hasPlayedQuiz', 'true');
              } else {
                // If database says not claimed but localStorage says played, sync to database
                const localPlayed = localStorage.getItem('hasPlayedQuiz') === 'true';
                if (localPlayed) {
                  await apiService.updateQuizRewardStatus(userData.id, 0);
                  setIsQuizRewardClaimed(true);
                }
              }
            }
          } catch (error) {
            console.error('Failed to check quiz reward status:', error);
          }
        }
      }
    };

    checkQuizRewardStatus();
  }, []); // Run only once on mount

  // Handle invite code detection and click count increment
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const inviteCode = urlParams.get('by');
    
    if (inviteCode && inviteCode !== currentUser.invitedBy) {
      // Track referral click
      trackReferralClick(inviteCode);
      
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
      'home': '/home',
      'quiz': '/quiz',
      'win1': '/win1',
      'account': '/account',
      'how-it-works': '/how-it-works'
    };
    navigate(pathMap[page]);
  };

  // Function to update earnings (can be used for future features)
  // const updateEarnings = (amount: number) => {
  //   setUserStats(prev => ({ ...prev, totalEarnings: prev.totalEarnings + amount }));
  // };

  const markQuizAsPlayed = useCallback(async () => {
    console.log('App: markQuizAsPlayed called', { currentUser: currentUser.id });
    // Mark as played and store in localStorage to persist across sessions
    setHasPlayedQuiz(true);
    localStorage.setItem('hasPlayedQuiz', 'true');
    setIsQuizRewardClaimed(true);
    
    // Update user stats with quiz earnings
    setUserStats(prev => ({
      ...prev,
      totalEarnings: prev.totalEarnings + 453
    }));

    // Update database if user exists
    if (currentUser.id) {
      try {
        await apiService.updateQuizRewardStatus(currentUser.id, 0); // shares will be updated separately
        console.log('Quiz reward status updated in database');
      } catch (error) {
        console.error('Failed to update quiz reward status:', error);
      }
    }
  }, [currentUser.id]);

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
          <Route path="/" element={<QuizPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/home" element={<HomePage onNavigate={navigateTo} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/quiz" element={<QuizPage onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} hasPlayedQuiz={hasPlayedQuiz} />} />
          <Route path="/win1" element={<WinPage1 onNavigate={navigateTo} onMarkAsPlayed={markQuizAsPlayed} currentUser={currentUser} onCreateUser={createUser} />} />
          <Route path="/account" element={<AccountPage userStats={userStats} onNavigate={navigateTo} />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
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