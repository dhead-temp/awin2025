import React, { useMemo, useState, useEffect, useCallback } from "react";
import { User, Trophy, Clock, CheckCircle } from "lucide-react";
import {
  apiService,
  DOMAIN,
  User as ApiUser,
  Transaction,
} from "../services/api";
import { Page } from "../App";
import {
  trackAccountView,
  trackUniqueAccountUpdateOpened,
  trackUniqueViewedTransactionHistory,
  trackUniqueAccountWithdrawSuccess,
} from "../utils/analytics";

// Import extracted components
import UserProfile from "./UserProfile";
import StatsSection from "./StatsSection";
import TasksSection from "./TasksSection";
import TransactionHistory from "./TransactionHistory";
import TaskModal from "./TaskModal";

interface AccountPageProps {
  userStats: {
    totalEarnings: number;
    referrals: number;
    linkClicks: number;
    shares: number;
  };
  onNavigate: (page: Page) => void;
}

const AccountPageRefactored: React.FC<AccountPageProps> = ({ userStats, onNavigate }) => {
  // State management
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);
  const [isCheckingQuizStatus, setIsCheckingQuizStatus] = useState(true);
  
  // Modal states
  const [showEmailPhoneModal, setShowEmailPhoneModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeraboxModal, setShowTeraboxModal] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  
  // Task modal states
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  // Other states
  const [copySuccess, setCopySuccess] = useState(false);
  const [unclaimedShares, setUnclaimedShares] = useState(0);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  // Task definitions
  interface Task {
    id: string;
    title: string;
    description: string;
    reward: number;
    steps: string[];
    icon: React.ComponentType<{ className?: string }>;
    cooldown?: number;
  }

  const taskCategories: Record<string, Task[]> = {
    "Daily Tasks": [
      {
        id: "share_to_group",
        title: "Share to WhatsApp Group",
        description: "Share your referral link to a WhatsApp group",
        reward: 50,
        steps: [
          "Open WhatsApp and go to any group",
          "Share your referral link with a message",
          "Upload screenshot as proof"
        ],
        icon: Trophy,
        cooldown: 24
      },
      {
        id: "share_to_story",
        title: "Share to WhatsApp Story",
        description: "Share your referral link to your WhatsApp story",
        reward: 30,
        steps: [
          "Open WhatsApp and go to Status",
          "Create a new story with your referral link",
          "Upload screenshot as proof"
        ],
        icon: Trophy,
        cooldown: 24
      },
      {
        id: "share_to_ig",
        title: "Share to Instagram Story",
        description: "Share your referral link to your Instagram story",
        reward: 40,
        steps: [
          "Open Instagram and go to Stories",
          "Create a new story with your referral link",
          "Upload screenshot as proof"
        ],
        icon: Trophy,
        cooldown: 24
      },
      {
        id: "share_to_fb",
        title: "Share to Facebook",
        description: "Share your referral link to Facebook",
        reward: 35,
        steps: [
          "Open Facebook and create a post",
          "Share your referral link with a message",
          "Upload screenshot as proof"
        ],
        icon: Trophy,
        cooldown: 24
      }
    ],
    "One Time Tasks": [
      {
        id: "install_pwa",
        title: "Install PWA App",
        description: "Install AWIN as a Progressive Web App on your device",
        reward: 100,
        steps: [
          "Install the app on your device",
          "Confirm installation"
        ],
        icon: Trophy
      }
    ]
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const response = await apiService.getUser(parseInt(parsedUserData.id));
          if (response.status === "success" && response.data) {
            setCurrentUser(response.data.user);
            setTransactions(response.data.transactions);
            setIsQuizRewardClaimed(
              response.data.user.is_quiz_reward_claimed === "1" ||
              response.data.user.is_quiz_reward_claimed === 1
            );
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
        setIsCheckingQuizStatus(false);
      }
    };

    loadUserData();
    trackAccountView();
  }, []);

  // Task management functions
  const isTaskCompleted = useCallback((taskId: string) => {
    if (!currentUser) return false;
    
    const taskCompletionMap: Record<string, boolean> = {
      share_to_group: currentUser.shared_to_group === 1,
      share_to_story: currentUser.shared_to_story === 1,
      share_to_ig: currentUser.shared_to_ig === 1,
      share_to_fb: currentUser.shared_to_fb === 1,
      install_pwa: String(currentUser.installed_pwa) === "1",
    };
    
    return taskCompletionMap[taskId] || false;
  }, [currentUser]);

  const isTaskOnCooldown = useCallback((taskId: string) => {
    if (!currentUser) return false;
    
    const task = taskCategories["Daily Tasks"].find(t => t.id === taskId);
    if (!task?.cooldown) return false;
    
    // Check if task was completed recently (within cooldown period)
    const lastCompleted = currentUser.last_task_completion?.[taskId];
    if (!lastCompleted) return false;
    
    const hoursSinceCompletion = (Date.now() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion < task.cooldown;
  }, [currentUser]);

  const getCooldownTimeLeft = useCallback((taskId: string) => {
    if (!currentUser) return 0;
    
    const task = taskCategories["Daily Tasks"].find(t => t.id === taskId);
    if (!task?.cooldown) return 0;
    
    const lastCompleted = currentUser.last_task_completion?.[taskId];
    if (!lastCompleted) return 0;
    
    const hoursSinceCompletion = (Date.now() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60);
    return Math.max(0, task.cooldown - hoursSinceCompletion);
  }, [currentUser]);

  const openTaskModal = useCallback((taskId: string) => {
    setSelectedTask(taskId);
    setShowTaskModal(true);
    setTimeout(() => setIsModalAnimating(true), 10);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setShowTaskModal(false);
      setSelectedTask(null);
    }, 300);
  }, []);

  const handleTaskComplete = useCallback((user: ApiUser, newTransactions: Transaction[]) => {
    setCurrentUser(user);
    setTransactions(newTransactions);
  }, []);

  // Copy referral link
  const copyReferralLink = useCallback(async () => {
    const referralLink = currentUser?.id
      ? `${DOMAIN}?by=${currentUser.id}`
      : `${DOMAIN}?by=new`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  }, [currentUser]);

  // Filter transactions
  const filteredTx = useMemo(() => {
    return transactions;
  }, [transactions]);

  // Check if email/phone is linked
  const isContactLinked = currentUser?.email || currentUser?.phone;

  if (isCheckingQuizStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-0">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isQuizRewardClaimed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-0">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100 relative overflow-hidden">
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Complete Quiz to Unlock Account
              </h2>
              <p className="text-gray-600 mb-6">
                Take the quiz to earn ₹453 and unlock your account features.
              </p>
              <button
                onClick={() => onNavigate("quiz")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Take Quiz Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* User Profile Section */}
        <UserProfile
          currentUser={currentUser}
          isContactLinked={isContactLinked}
          onOpenEmailPhoneModal={() => setShowEmailPhoneModal(true)}
          onOpenHistoryModal={() => setShowHistoryModal(true)}
          onOpenWithdrawModal={() => setShowTeraboxModal(true)}
        />

        {/* Stats Section */}
        <StatsSection
          currentUser={currentUser}
          copySuccess={copySuccess}
          onCopyReferralLink={copyReferralLink}
          onShowShareBanner={() => setShowShareBanner(true)}
          onSetUnclaimedShares={setUnclaimedShares}
        />

        {/* Tasks Section */}
        <TasksSection
          currentUser={currentUser}
          taskCategories={taskCategories}
          isTaskCompleted={isTaskCompleted}
          isTaskOnCooldown={isTaskOnCooldown}
          getCooldownTimeLeft={getCooldownTimeLeft}
          onOpenTaskModal={openTaskModal}
        />

        {/* Transaction History */}
        <TransactionHistory
          transactions={transactions}
          isLoading={isLoading}
          filteredTx={filteredTx}
          showHistoryModal={showHistoryModal}
          onOpenHistoryModal={() => setShowHistoryModal(true)}
          onCloseHistoryModal={() => setShowHistoryModal(false)}
        />

        {/* Task Modal */}
        <TaskModal
          isOpen={showTaskModal}
          isAnimating={isModalAnimating}
          selectedTask={selectedTask}
          currentUser={currentUser}
          tasks={Object.values(taskCategories).flat()}
          onClose={closeTaskModal}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </div>
  );
};

export default AccountPageRefactored;
