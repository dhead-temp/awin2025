import { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import QuizPage from "./components/QuizPage";
import WinPage1 from "./components/WinPage1";
import AccountPage from "./components/AccountPage";
import Navigation from "./components/Navigation";
import PromoStrip from "./components/PromoStrip";
import Footer from "./components/Footer";
import PaymentProofsFooter from "./components/PaymentProofsFooter";
import HowItWorksPage from "./components/HowItWorksPage";
import NotificationTestPage from "./components/NotificationTestPage";
import { apiService } from "./services/api";
import { initGA, trackPageView, trackReferralClick } from "./utils/analytics";
import { handlePushNotificationPermission, initializeFCM } from "./utils/pushNotifications";

export type Page =
  | "home"
  | "quiz"
  | "win"
  | "win1"
  | "account"
  | "how-it-works"
  | "notification-test";

// Component to handle navigation logic
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const processedInviteCodes = useRef<Set<string>>(new Set());
  const [hasPlayedQuiz, setHasPlayedQuiz] = useState(() => {
    // Check if user has already played (stored in localStorage)
    return localStorage.getItem("hasPlayedQuiz") === "true";
  });
  const [userStats, setUserStats] = useState(() => {
    // Initialize with zero earnings if user hasn't played quiz yet
    const hasPlayed = localStorage.getItem("hasPlayedQuiz") === "true";
    return {
      totalEarnings: hasPlayed ? 453 : 0,
      referrals: 12,
      linkClicks: 84,
      shares: 156,
    };
  });
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    invitedBy: string | null;
  } | null>(() => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize Google Analytics and Firebase Cloud Messaging
  useEffect(() => {
    // Only initialize in production or when GA_MEASUREMENT_ID is set
    if (import.meta.env.PROD || import.meta.env.VITE_GA_MEASUREMENT_ID) {
      const measurementId =
        import.meta.env.VITE_GA_MEASUREMENT_ID || "G-LPN95FN4N0";
      initGA(measurementId);
    }
    
    // Initialize Firebase Cloud Messaging
    initializeFCM().catch((error) => {
      console.error('Failed to initialize FCM:', error);
    });
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Check quiz reward status from database
  useEffect(() => {
    const checkQuizRewardStatus = async () => {
      console.log("App: checkQuizRewardStatus called");
      
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.id) {
          try {
            const response = await apiService.getUser(parseInt(userData.id));
            if (response.status === "success" && response.data) {
              const claimed =
                response.data.user.is_quiz_reward_claimed === "1" ||
                response.data.user.is_quiz_reward_claimed === "true";
              // Sync localStorage with database status
              if (claimed) {
                setHasPlayedQuiz(true);
                localStorage.setItem("hasPlayedQuiz", "true");
              } else {
                // If database says not claimed but localStorage says played, 
                // just sync localStorage to match database (don't update database)
                const localPlayed =
                  localStorage.getItem("hasPlayedQuiz") === "true";
                if (localPlayed) {
                  // Database is correct - user hasn't completed invitation process yet
                  // Keep localStorage as is, don't update database
                  console.log("Database shows quiz not claimed, keeping localStorage state");
                }
              }
            }
          } catch (error) {
            console.error("Failed to check quiz reward status:", error);
          }
        }
      }
    };

    checkQuizRewardStatus();
  }, []); // Run only once on mount

  // Handle invite code detection and click count increment
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const inviteCode = urlParams.get("by");

    if (inviteCode && inviteCode !== currentUser?.invitedBy && !processedInviteCodes.current.has(inviteCode)) {
      // Mark this invite code as processed to prevent duplicate requests
      processedInviteCodes.current.add(inviteCode);
      
      // Track referral click
      trackReferralClick(inviteCode);

      // Increment click count for the invite code with better error handling
      apiService.incrementClickCount(inviteCode)
        .then((response) => {
          if (response.status === "success") {
            console.log(`✅ Click count incremented successfully for invite code: ${inviteCode}`);
          } else {
            console.error(`❌ Failed to increment click count for ${inviteCode}:`, response.message);
            // Remove from processed set if failed so it can be retried
            processedInviteCodes.current.delete(inviteCode);
          }
        })
        .catch((error) => {
          console.error(`❌ Network error while incrementing click count for ${inviteCode}:`, error);
          // Remove from processed set if failed so it can be retried
          processedInviteCodes.current.delete(inviteCode);
        });

      // Store the invite code for later use
      setCurrentUser((prev) => ({
        id: prev?.id || "",
        name: prev?.name || "",
        email: prev?.email || "",
        phone: prev?.phone || "",
        invitedBy: inviteCode,
      }));
    }
  }, [location.search]);

  const navigateTo = (page: Page) => {
    const pathMap: Record<Page, string> = {
      home: "/home",
      quiz: "/quiz",
      win: "/win1", // Map win to win1 route
      win1: "/win1",
      account: "/account",
      "how-it-works": "/how-it-works",
      "notification-test": "/notification-test",
    };
    navigate(pathMap[page]);
  };

  // Function to update earnings (can be used for future features)
  // const updateEarnings = (amount: number) => {
  //   setUserStats(prev => ({ ...prev, totalEarnings: prev.totalEarnings + amount }));
  // };

  const markQuizAsPlayed = useCallback(async () => {
    console.log("App: markQuizAsPlayed called", {
      currentUser: currentUser?.id,
    });
    // Mark as played and store in localStorage to persist across sessions
    setHasPlayedQuiz(true);
    localStorage.setItem("hasPlayedQuiz", "true");

    // Update user stats with quiz earnings
    setUserStats((prev) => ({
      ...prev,
      totalEarnings: prev.totalEarnings + 453,
    }));

    // Note: Database update will happen when user completes invitation process (3+ shares)
  }, [currentUser?.id]);

  // Create user when withdraw button is clicked
  const createUser = async () => {
    if (currentUser?.id) {
      // User already exists
      return currentUser;
    }

    try {
      // Pass the referral code to the API
      const response = await apiService.createUser(currentUser?.invitedBy || undefined);
      if (response.status === "success" && response.data) {
        const newUser = {
          id: response.data.user_id.toString(),
          name: "",
          email: "",
          phone: "",
          invitedBy: currentUser?.invitedBy || null,
        };

        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        console.log("User created successfully:", newUser);
        
        // Request push notification permission for newly created user
        try {
          await handlePushNotificationPermission(parseInt(newUser.id));
        } catch (error) {
          console.error("Failed to request push notification permission for new user:", error);
        }
        
        return newUser;
      } else {
        console.error("Failed to create user:", response.message);
        return null;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  };

  // Update current user in localStorage when it changes
  useEffect(() => {
    if (currentUser?.id || currentUser?.name || currentUser?.email || currentUser?.phone || currentUser?.invitedBy) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navigation />
      <PromoStrip />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <QuizPage
                onNavigate={navigateTo}
                onMarkAsPlayed={markQuizAsPlayed}
                hasPlayedQuiz={hasPlayedQuiz}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomePage onNavigate={navigateTo} hasPlayedQuiz={hasPlayedQuiz} />
            }
          />
          <Route
            path="/quiz"
            element={
              <QuizPage
                onNavigate={navigateTo}
                onMarkAsPlayed={markQuizAsPlayed}
                hasPlayedQuiz={hasPlayedQuiz}
              />
            }
          />
          <Route
            path="/win1"
            element={
              <WinPage1
                onNavigate={navigateTo}
                currentUser={currentUser}
                onCreateUser={createUser}
              />
            }
          />
          <Route
            path="/account"
            element={
              <AccountPage userStats={userStats} onNavigate={navigateTo} />
            }
          />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/notification-test" element={<NotificationTestPage />} />
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
