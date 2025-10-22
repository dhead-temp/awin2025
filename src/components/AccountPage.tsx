import React, { useMemo, useState, useEffect } from "react";
import {
  Wallet,
  Users,
  Share2,
  TrendingUp,
  Copy,
  Trophy,
  CreditCard,
  AlertCircle,
  Lock,
  CheckCircle,
  Activity,
  History,
  User,
  X,
  Link,
  Play,
} from "lucide-react";
import {
  apiService,
  DOMAIN,
  User as ApiUser,
  Transaction,
} from "../services/api";
import StatsCard from "./StatsCard";
import { Page } from "../App";
import {
  trackAccountView,
  trackShare,
  trackWithdrawalRequest,
  trackUniqueAccountUpdateOpened,
  trackUniqueAccountShare,
  trackUniqueHamburgerExpanded,
  trackUniqueViewedTransactionHistory,
  trackUniqueAccountInviteLinkCopied,
  trackUniqueAccountWithdrawClick,
  trackUniqueAccountDownloadClick,
  trackUniqueAccountCodeEntered,
  trackUniqueAccountCodeVerifyClick,
  trackUniqueAccountCodeVerified,
  trackUniqueAccountWithdrawSuccess,
} from "../utils/analytics";
import { 
  hasNotificationPermission, 
  sendTestNotification,
  sendEarningsNotification,
  sendWithdrawalNotification,
  sendReferralNotification,
  sendQuizCompletionNotification
} from "../utils/pushNotifications";
import ChromeNotificationDebug from "./ChromeNotificationDebug";

interface AccountPageProps {
  userStats: {
    totalEarnings: number;
    referrals: number;
    linkClicks: number;
    shares: number;
  };
  onNavigate: (page: Page) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ userStats, onNavigate }) => {
  const [hasTerabox, setHasTerabox] = useState(false);
  const [showTeraboxModal, setShowTeraboxModal] = useState(false);
  const [teraboxVerifyStatus, setTeraboxVerifyStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [unclaimedShares, setUnclaimedShares] = useState(0);
  const [showEmailPhoneModal, setShowEmailPhoneModal] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [upi, setUpi] = useState<string | null>(null);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] =
    useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showChromeDebug, setShowChromeDebug] = useState(false);

  // Real user data from API
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);
  const [isCheckingQuizStatus, setIsCheckingQuizStatus] = useState(true);

  const [txFilter] = useState<
    "all" | "credit" | "debit" | "completed" | "pending" | "failed"
  >("all");

  // Fetch user data on component mount
  // Note: Global API request cache prevents duplicate calls across components
  useEffect(() => {
    const fetchUserData = async () => {
      console.log("AccountPage: fetchUserData called");

      try {
        // Get current user from localStorage
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.id) {
            const response = await apiService.getUser(parseInt(userData.id));
            if (response.status === "success" && response.data) {
              setCurrentUser(response.data.user);
              setTransactions(response.data.transactions);
              // Check if quiz reward has been claimed from database
              setIsQuizRewardClaimed(
                response.data.user.is_quiz_reward_claimed === "1" ||
                  response.data.user.is_quiz_reward_claimed === "true"
              );
              setIsCheckingQuizStatus(false);
            }
          } else {
            setIsCheckingQuizStatus(false);
          }
        } else {
          setIsCheckingQuizStatus(false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsCheckingQuizStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Track account page view
  useEffect(() => {
    trackAccountView();
  }, []);

  // Check localStorage for Terabox verification status
  useEffect(() => {
    const teraboxVerified = localStorage.getItem("teraboxVerified");
    if (teraboxVerified === "true") {
      setHasTerabox(true);
    }
  }, []);

  // User profile data
  const userProfile = {
    name: currentUser?.name || `user${currentUser?.id || "new"}`,
    memberSince: currentUser?.created_on
      ? new Date(currentUser.created_on).toLocaleDateString()
      : "",
    kycVerified: false,
    upiVerified: false,
    avatarBg: "bg-gradient-to-br from-blue-500 to-blue-600",
  };

  const referralLink = currentUser?.id
    ? `${DOMAIN}?by=${currentUser.id}`
    : `${DOMAIN}?by=new`;
  const currentBalance =
    typeof currentUser?.balance === "string"
      ? parseFloat(currentUser.balance)
      : currentUser?.balance || 0;
  const canWithdraw = currentBalance >= 100 && hasTerabox && currentUser?.upi;

  const copyReferralLink = async () => {
    // Track unique invite link copied
    trackUniqueAccountInviteLinkCopied();
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(`Ye dekhna ${referralLink}`);
    return `https://wa.me/?text=${message}`;
  };

  const claimShareReward = async () => {
    if (!currentUser?.id || unclaimedShares <= 0) return;

    setIsClaimingReward(true);
    try {
      // Calculate new values - ensure they are numbers
      const currentShares = parseInt(String(currentUser.shares || 0), 10);
      const newShares = currentShares + unclaimedShares;

      // Make API call to update user shares with all unclaimed shares
      // Backend trigger will automatically create transaction:
      // - ₹2 per share (from after_user_shares_update trigger)
      const response = await apiService.updateUser(currentUser.id, {
        shares: newShares,
      });

      if (response.status === "success") {
        // Fetch updated user data to get the new balance calculated by backend
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          // Update local state with fresh data from backend
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);

          // Hide banner and reset unclaimed shares after claiming
          setShowShareBanner(false);
          setUnclaimedShares(0);
        }
      } else {
        console.error("Failed to claim reward:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
      // You could show a toast notification here
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleUpdateContact = async () => {
    if (
      !currentUser?.id ||
      (email === null && phone === null && name === null && upi === null)
    )
      return;

    setIsUpdatingContact(true);
    try {
      const updateData: any = {};
      if (email !== null) updateData.email = email;
      if (phone !== null) updateData.phone = phone;
      if (name !== null) updateData.name = name;
      if (upi !== null) updateData.upi = upi;

      const response = await apiService.updateUser(currentUser.id, updateData);

      if (response.status === "success") {
        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
          setShowEmailPhoneModal(false);
          setEmail(null);
          setPhone(null);
          setName(null);
          setUpi(null);
        }
      } else {
        console.error("Failed to update contact:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
      // You could show a toast notification here
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleWithdrawal = () => {
    if (!currentUser?.id || !canWithdraw) return;
    // Track unique withdraw click
    trackUniqueAccountWithdrawClick();
    setShowWithdrawConfirmation(true);
  };

  const handleDownloadTerabox = () => {
    // Track unique download click
    trackUniqueAccountDownloadClick();
    setShowPinInput(true);
  };

  const handlePinVerification = async () => {
    // Track unique code entered
    trackUniqueAccountCodeEntered();
    
    if (pinValue !== "3245") {
      setTeraboxVerifyStatus("failed");
      return;
    }

    // Track unique code verify click
    trackUniqueAccountCodeVerifyClick();
    
    setIsVerifyingPin(true);
    try {
      // Update is_terabox_done to 1 in database
      const response = await apiService.updateUser(currentUser!.id, {
        is_terabox_done: true,
      });

      if (response.status === "success") {
        // Track unique code verified
        trackUniqueAccountCodeVerified();
        setTeraboxVerifyStatus("success");
        setHasTerabox(true);
        setShowPinInput(false);
        setPinValue("");

        // Save progress in localStorage
        localStorage.setItem("teraboxVerified", "true");

        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser!.id);
        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
        }
      } else {
        setTeraboxVerifyStatus("failed");
      }
    } catch (error) {
      console.error("Failed to verify Terabox:", error);
      setTeraboxVerifyStatus("failed");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const confirmWithdrawal = async () => {
    if (!currentUser?.id || !canWithdraw) return;

    setIsProcessingWithdrawal(true);
    setShowWithdrawConfirmation(false);

    try {
      const response = await apiService.createWithdrawalRequest(
        currentUser.id,
        currentBalance
      );

      if (response.status === "success") {
        // Track withdrawal request
        trackWithdrawalRequest(currentBalance);

        // Fetch updated user data to get the new transaction
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);
          // Track unique withdrawal success
          trackUniqueAccountWithdrawSuccess();
          setWithdrawalSuccess(true);
          setShowTeraboxModal(false);
        }
      } else {
        console.error("Failed to process withdrawal:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to process withdrawal:", error);
      // You could show a toast notification here
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const filteredTx = useMemo(() => {
    switch (txFilter) {
      case "credit":
        return transactions.filter((t) => t.type === "credit");
      case "debit":
        return transactions.filter((t) => t.type === "debit");
      default:
        return transactions;
    }
  }, [txFilter, transactions]);

  // Check if email/phone is linked
  const isContactLinked = currentUser?.email || currentUser?.phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-32">
      {/* Loading State - Show while checking quiz status */}
      {isCheckingQuizStatus ? (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      ) : !isQuizRewardClaimed ? (
        /* Locked State - Show if user hasn't claimed quiz reward */
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100 relative overflow-hidden">
            {/* Blurred background content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-90 blur-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        My Account
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Track your earnings and referrals
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      ₹{userStats.totalEarnings}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">
                      Total Earnings
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.referrals}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">
                      Referrals
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.linkClicks}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Clicks</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.shares}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Shares</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 sm:py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Lock className="h-10 w-10 text-white" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Account Locked
              </h3>

              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md leading-relaxed">
                Complete the quiz first to unlock your account and start earning
                money!
              </p>

              <button
                onClick={() => onNavigate("quiz")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Play className="h-5 w-5" />
                <span>Play Quiz Now</span>
              </button>

              <p className="text-gray-500 text-xs mt-4">
                Win ₹453 instantly after completing the quiz!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          {/* Header - Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}
                >
                  {userProfile.name ? (
                    userProfile.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                  ) : (
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {userProfile.name || "Your Account"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                   
                    {hasNotificationPermission() && currentUser?.id && (
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => sendTestNotification(currentUser.id.toString())}
                          className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-green-100 transition-colors cursor-pointer"
                          title="Click to send test notification"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Notifications On
                        </button>
                        <button
                          onClick={() => sendEarningsNotification(100)}
                          className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Test earnings notification"
                        >
                          💰 Earnings
                        </button>
                        <button
                          onClick={() => sendWithdrawalNotification(500)}
                          className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                          title="Test withdrawal notification"
                        >
                          💳 Withdrawal
                        </button>
                      </div>
                    )}
                    {/* {navigator.userAgent.includes('Chrome') && (
                      <button
                        onClick={() => setShowChromeDebug(true)}
                        className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                        title="Debug Chrome notifications"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Debug
                      </button>
                    )} */}
                  </div>
                </div>
              </div>

              {/* Link Email/Phone Link */}
              <button
                onClick={() => {
                  trackUniqueAccountUpdateOpened();
                  setShowEmailPhoneModal(true);
                }}
                className={`inline-flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm transition-colors px-2 py-1.5 rounded-lg ${
                  isContactLinked
                    ? "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                {isContactLinked ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">
                  {isContactLinked ? "Update Account Info" : "Link Email/Phone"}
                </span>
                <span className="sm:hidden">
                  {isContactLinked ? "Update" : "Link"}
                </span>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-base sm:text-lg font-semibold">
                  Total Balance
                </h2>
              </div>
              <button
                onClick={() => {
                  trackUniqueViewedTransactionHistory();
                  setShowHistoryModal(true);
                }}
                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2 transition-all"
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                ₹
                {typeof currentUser?.balance === "string"
                  ? parseFloat(currentUser.balance).toFixed(2)
                  : (currentUser?.balance || 0).toFixed(2)}
              </div>
              <div className="text-white/80 text-xs sm:text-sm">
                Available to withdraw
              </div>
            </div>

            <button
              onClick={() => setShowTeraboxModal(true)}
              className="w-full bg-white text-blue-600 hover:bg-gray-50 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-lg hover:shadow-xl min-h-[48px]"
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Withdraw Now
            </button>
            <div className="text-center text-white/70 text-xs mt-2 sm:mt-3">
              Withdraw to Bank Account Using UPI ID
            </div>
          </div>

          {/* Share Reward Banner */}
          {showShareBanner && (
            <div className="bg-white border-2 border-dashed border-orange-300 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Share Rewards
                    </h3>
                    <p className="text-sm text-gray-600">
                      {unclaimedShares} shares • ₹{unclaimedShares * 2}
                    </p>
                  </div>
                </div>
                <button
                  onClick={claimShareReward}
                  disabled={isClaimingReward}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isClaimingReward
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {isClaimingReward ? "Claiming..." : "Claim"}
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatsCard
              title="Shares"
              value={currentUser?.shares || 0}
              subtitle="Earn ₹2 on Every Share"
              subtitleValue={`Earned ₹${(currentUser?.shares || 0) * 2}`}
              actionButton={
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.open(generateWhatsAppLink(), "_blank");
                      trackShare("whatsapp");
                      trackUniqueAccountShare();
                      setShowShareBanner(true);
                      setUnclaimedShares((prev) => prev + 1);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-3 w-3" />
                    Share Now
                  </button>
                  <button
                    onClick={copyReferralLink}
                    className={`py-2 px-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      copySuccess
                        ? "bg-green-100 text-green-600 scale-110"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 hover:scale-105"
                    }`}
                    title={copySuccess ? "Copied!" : "Copy referral link"}
                  >
                    {copySuccess ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              }
              icon={Share2}
              color="blue"
            />
            <StatsCard
              title="Clicks"
              value={currentUser?.clicks || 0}
              subtitle="Earn ₹10 per click"
              subtitleValue={`Earned ₹${(currentUser?.clicks || 0) * 10}`}
              description="Every time someone clicks your link, you earn ₹10."
              icon={Activity}
              color="green"
            />
            <StatsCard
              title="Referrals"
              value={currentUser?.invited_to || 0}
              subtitle="Earn ₹300 per referral"
              subtitleValue={`Earned ₹${(currentUser?.invited_to || 0) * 300}`}
              description="Everytime someone you refer completes the quiz, you earn ₹300."
              icon={Users}
              color="purple"
            />
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              <button
                onClick={() => {
                  trackUniqueViewedTransactionHistory();
                  setShowHistoryModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {isLoading ? (
                <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                  Loading transactions...
                </div>
              ) : filteredTx.length === 0 ? (
                <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                  No transactions yet
                </div>
              ) : (
                filteredTx.slice(0, 5).map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                          isCredit ? "bg-emerald-100" : "bg-red-100"
                        }`}
                      >
                        {isCredit ? (
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {tx.note || "Transaction"}
                          </div>
                          <div
                            className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                              isCredit ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {isCredit ? "+" : "-"}₹
                            {typeof tx.amount === "string"
                              ? parseFloat(tx.amount).toFixed(2)
                              : tx.amount}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <div className="text-xs text-gray-500">
                            {new Date(tx.created_on).toLocaleDateString()}
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              tx.note === "Withdrawal Request"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {tx.note === "Withdrawal Request"
                              ? "In Process"
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Withdraw Modal */}
          {showTeraboxModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Withdraw Earnings
                    </h3>
                    <button
                      onClick={() => {
                        setShowTeraboxModal(false);
                        setTeraboxVerifyStatus("idle");
                        setShowPinInput(false);
                        setPinValue("");
                      }}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    ₹
                    {typeof currentUser?.balance === "string"
                      ? parseFloat(currentUser.balance).toFixed(2)
                      : (currentUser?.balance || 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  {!hasTerabox && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                          <div className="text-xs sm:text-sm text-blue-800">
                            To withdraw, download the verification file and
                            verify using 4 digit code found in the file. This
                            helps us confirm you are a real user.
                          </div>
                        </div>
                      </div>

                      {!showPinInput ? (
                        <div className="space-y-2 sm:space-y-3">
                          <a
                            href="https://be6.in/tera-dwnld-awin"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleDownloadTerabox}
                            className="w-full block text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md transition-all min-h-[48px] flex items-center justify-center"
                          >
                            Download Verification File
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                              <div className="text-xs sm:text-sm text-amber-800">
                                Please enter the 4-digit verification code found
                                in the file downloaded using Terabox App.
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Verification Code
                              </label>
                              <input
                                type="text"
                                value={pinValue}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4);
                                  setPinValue(value);
                                }}
                                placeholder="Enter 4-digit code"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base text-center text-lg font-mono tracking-widest"
                                maxLength={4}
                              />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={() => {
                                  setShowPinInput(false);
                                  setPinValue("");
                                  setTeraboxVerifyStatus("idle");
                                }}
                                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handlePinVerification}
                                disabled={
                                  isVerifyingPin || pinValue.length !== 4
                                }
                                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
                                  isVerifyingPin || pinValue.length !== 4
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                {isVerifyingPin ? "Verifying..." : "Verify"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {teraboxVerifyStatus === "success" && (
                        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Terabox verified successfully!
                          </span>
                        </div>
                      )}
                      {teraboxVerifyStatus === "failed" && (
                        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Verification failed. Please check the code in
                            verification file and try again.
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {hasTerabox && !currentUser?.upi && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">
                            UPI ID Required
                          </div>
                          <div className="text-xs sm:text-sm text-amber-800">
                            Please add your UPI ID in account settings to enable
                            withdrawals.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasTerabox && currentUser?.upi && !canWithdraw && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">
                            Insufficient Balance
                          </div>
                          <div className="text-xs sm:text-sm text-amber-800">
                            Minimum ₹100 required. You need ₹
                            {(
                              100 -
                              (typeof currentUser?.balance === "string"
                                ? parseFloat(currentUser.balance)
                                : currentUser?.balance || 0)
                            ).toFixed(2)}{" "}
                            more.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasTerabox && canWithdraw && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5" />
                          <div className="text-xs sm:text-sm text-emerald-800">
                            You are eligible to withdraw your earnings. Payouts
                            are processed within 24 hours.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleWithdrawal}
                        disabled={isProcessingWithdrawal}
                        className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-bold shadow-md transition-all min-h-[48px] ${
                          isProcessingWithdrawal
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg"
                        }`}
                      >
                        {isProcessingWithdrawal
                          ? "Processing..."
                          : "Confirm Withdrawal"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Confirmation Modal */}
          {showWithdrawConfirmation && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Confirm Withdrawal
                    </h3>
                    <button
                      onClick={() => setShowWithdrawConfirmation(false)}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    ₹
                    {typeof currentUser?.balance === "string"
                      ? parseFloat(currentUser.balance).toFixed(2)
                      : (currentUser?.balance || 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                      <div className="text-xs sm:text-sm text-blue-800">
                        <div className="font-semibold mb-1">
                          Please confirm your withdrawal details:
                        </div>
                        <ul className="space-y-1 text-xs">
                          <li>
                            • Amount: ₹
                            {typeof currentUser?.balance === "string"
                              ? parseFloat(currentUser.balance).toFixed(2)
                              : (currentUser?.balance || 0).toFixed(2)}
                          </li>
                          <li>
                            • UPI ID: {currentUser?.upi || "Not provided"}
                          </li>
                          <li>• Processing time: Within 24 hours</li>
                          <li>• Payment date: 5th day of upcoming month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                      <div className="text-xs sm:text-sm text-amber-800">
                        <div className="font-semibold mb-1">Important:</div>
                        <p>
                          Once confirmed, this withdrawal cannot be cancelled.
                          Please ensure all details are correct.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => setShowWithdrawConfirmation(false)}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmWithdrawal}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Confirm Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Success Message */}
          {withdrawalSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                    ✅ Withdrawal Request Submitted Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    Your withdrawal request has been processed and is now under
                    review.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    💰{" "}
                    <span className="text-green-600">
                      ₹
                      {typeof currentUser?.balance === "string"
                        ? parseFloat(currentUser.balance).toFixed(2)
                        : (currentUser?.balance || 0).toFixed(2)}
                    </span>{" "}
                    will be credited to your account by the{" "}
                    <span className="font-semibold text-blue-600">
                      5th day of the upcoming month
                    </span>
                    .
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive a confirmation notification once the payment
                    is processed.
                  </p>
                </div>
                <button
                  onClick={() => setWithdrawalSuccess(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Transaction History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-3 sm:p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                    All Transactions
                  </h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {isLoading ? (
                      <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                        Loading transactions...
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map((tx) => {
                        const isCredit = tx.type === "credit";
                        return (
                          <div
                            key={tx.id}
                            className="py-2 sm:py-3 flex items-center"
                          >
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 ${
                                isCredit ? "bg-emerald-50" : "bg-red-50"
                              }`}
                            >
                              {isCredit ? (
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                              ) : (
                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {tx.note || "Transaction"}
                                </div>
                                <div
                                  className={`text-xs sm:text-sm font-bold ${
                                    isCredit
                                      ? "text-emerald-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {isCredit ? "+" : "-"}₹
                                  {typeof tx.amount === "string"
                                    ? parseFloat(tx.amount).toFixed(2)
                                    : tx.amount}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-[10px] sm:text-[11px] text-gray-500">
                                  {new Date(tx.created_on).toLocaleString()} •
                                  TXN-{String(tx.id)}
                                </div>
                                <span
                                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                                    tx.note === "Withdrawal Request"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  {tx.note === "Withdrawal Request"
                                    ? "In Process"
                                    : "Completed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email/Phone Update Modal */}
          {showEmailPhoneModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Update Account Info
                    </h3>
                    <button
                      onClick={() => {
                        setShowEmailPhoneModal(false);
                        setEmail("");
                        setPhone("");
                        setName("");
                        setUpi("");
                      }}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm">
                    Update your name, email, phone and UPI ID
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name !== null ? name : currentUser?.name || ""}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={
                          email !== null ? email : currentUser?.email || ""
                        }
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={
                          phone !== null ? phone : currentUser?.phone || ""
                        }
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={upi !== null ? upi : currentUser?.upi || ""}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="Enter your UPI ID (e.g., user@paytm)"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowEmailPhoneModal(false);
                        setEmail(null);
                        setPhone(null);
                        setName(null);
                        setUpi(null);
                      }}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateContact}
                      disabled={
                        isUpdatingContact ||
                        (email === null &&
                          phone === null &&
                          name === null &&
                          upi === null)
                      }
                      className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
                        isUpdatingContact ||
                        (email === null &&
                          phone === null &&
                          name === null &&
                          upi === null)
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {isUpdatingContact ? "Updating..." : "Update Contact"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chrome Debug Modal */}
      {showChromeDebug && (
        <ChromeNotificationDebug onClose={() => setShowChromeDebug(false)} />
      )}
    </div>
  );
};

export default AccountPage;
