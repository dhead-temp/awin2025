import React, { useState, useEffect } from "react";
import { Trophy, Gift, X, MessageCircle } from "lucide-react";
import type { Page } from "../App";
import { DOMAIN, apiService } from "../services/api";
import { trackWinPageView, trackUserRegistration } from "../utils/analytics";
import { handlePushNotificationPermission } from "../utils/pushNotifications";

interface WinPage1Props {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    invitedBy: string | null;
  } | null;
  onCreateUser: () => Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
    invitedBy: string | null;
  } | null>;
}

const WinPage1: React.FC<WinPage1Props> = ({
  onNavigate,
  onMarkAsPlayed,
  currentUser,
  onCreateUser,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(0);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [hasMarkedAsPlayed, setHasMarkedAsPlayed] = useState(false);
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);
  const [showInviteButton, setShowInviteButton] = useState(true);

  const baseQuizWinnings = 453;

  // Mark quiz as played when component mounts (user reached win page)
  useEffect(() => {
    if (!hasMarkedAsPlayed) {
      onMarkAsPlayed();
      setHasMarkedAsPlayed(true);
    }

    // Track win page view
    trackWinPageView();
  }, [onMarkAsPlayed, hasMarkedAsPlayed]);

  // Check quiz reward status from database
  useEffect(() => {
    const checkQuizRewardStatus = async () => {
      if (currentUser?.id) {
        try {
          const response = await apiService.getUser(parseInt(currentUser.id));
          if (response.status === "success" && response.data) {
            const claimed =
              response.data.user.is_quiz_reward_claimed === "1" ||
              response.data.user.is_quiz_reward_claimed === "true";
            setIsQuizRewardClaimed(claimed);
            
            // If reward is claimed, set invited friends to 3 to match the UI state
            if (claimed) {
              setInvitedFriends(3);
              setShowInviteButton(false);
            }
          }
        } catch (error) {
          console.error("Failed to check quiz reward status:", error);
        }
      }
    };

    checkQuizRewardStatus();
  }, [currentUser?.id]);

  const handleWithdrawClick = async () => {
    setIsCreatingUser(true);

    // If quiz reward is already claimed and user exists, go directly to account page
    if (isQuizRewardClaimed && currentUser?.id) {
      console.log("Quiz reward already claimed, redirecting to account page");
      
      // Request push notification permission for existing user
      try {
        await handlePushNotificationPermission(parseInt(currentUser.id));
      } catch (error) {
        console.error("Failed to request push notification permission:", error);
      }
      
      onNavigate("account");
      setIsCreatingUser(false);
      return;
    }

    // Create user if not exists
    const user = await onCreateUser();

    if (user && user.id) {
      trackUserRegistration();
      
      // Request push notification permission for new user
      try {
        await handlePushNotificationPermission(parseInt(user.id));
      } catch (error) {
        console.error("Failed to request push notification permission:", error);
      }
      
      setShowInviteModal(true);
    } else {
      console.error("Failed to create user for withdrawal");
      alert("Failed to create user account. Please try again.");
    }

    setIsCreatingUser(false);
  };

  const handleInviteFriend = () => {
    setTimeout(() => {
      const newCount = invitedFriends + 1;
      setInvitedFriends(newCount);
      
      // Trigger fade-out animation when reaching 3 invites
      if (newCount >= 3) {
        setTimeout(() => {
          setShowInviteButton(false);
        }, 500); // Wait for fade-out animation to complete
      }
    }, 2000);
  };

  const handleProceedToAccount = async () => {
    if (invitedFriends >= 3 && currentUser?.id) {
      // Update quiz reward claimed status and shares count
      try {
        const response = await apiService.updateQuizRewardStatus(
          parseInt(currentUser.id),
          3
        );
        if (response.status === "success") {
          console.log("Quiz reward status updated successfully");
          
          // Request push notification permission before proceeding to account
          try {
            await handlePushNotificationPermission(parseInt(currentUser.id));
          } catch (error) {
            console.error("Failed to request push notification permission:", error);
          }
          
          setShowInviteModal(false);
          onNavigate("account");
        } else {
          console.error(
            "Failed to update quiz reward status:",
            response.message
          );
          alert("Failed to update reward status. Please try again.");
        }
      } catch (error) {
        console.error("Error updating quiz reward status:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const generateWhatsAppLink = () => {
    const userId = currentUser?.id || "new";
    const referralUrl = `${DOMAIN}?by=${userId}`;
    const message = encodeURIComponent(`Ye Dekhna - ${referralUrl}`);
    return `https://wa.me/?text=${message}`;
  };

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        @keyframes fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-out {
          animation: fade-out 0.5s ease-in-out forwards;
        }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 relative z-10">
          {/* Prize Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50"></div>

            <div className="text-center relative z-10">
              <div className="relative inline-block mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Quiz Reward
              </h2>

              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mb-4 drop-shadow-sm">
                ₹{baseQuizWinnings}
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3 mb-6 shadow-sm">
                <p className="text-emerald-800 font-semibold flex items-center justify-center text-sm">
                  <Gift className="h-4 w-4 mr-2 text-emerald-600" />
                  Added to your account
                </p>
              </div>

              <button
                onClick={handleWithdrawClick}
                disabled={isCreatingUser}
                className={`w-full max-w-sm font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isCreatingUser
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isCreatingUser ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                ) : (
                  <span className="text-sm">
                    {isQuizRewardClaimed && currentUser?.id
                      ? "Go to Account"
                      : "Withdraw To Bank"}
                  </span>
                )}
              </button>

              {/* Bank Icons Below Button */}
              {!isQuizRewardClaimed && (
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <img 
                      src="/img/hdfc.png" 
                      alt="HDFC Bank" 
                      className="w-5 h-5 rounded-sm"
                    />
                    <img 
                      src="/img/sbi.png" 
                      alt="SBI Bank" 
                      className="w-5 h-5 rounded-sm"
                    />
                    <img 
                      src="/img/icici.png" 
                      alt="ICICI Bank" 
                      className="w-5 h-5 rounded-sm"
                    />
                    <img 
                      src="/img/axis.png" 
                      alt="Axis Bank" 
                      className="w-5 h-5 rounded-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    + 100 Other Banks
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Referral CTA - Soft */}
          <div className="bg-blue-100 rounded-xl p-5 mb-6 shadow-lg border border-blue-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mb-3">
                <Gift className="h-5 w-5 text-white" />
              </div>
              
              <h3 className="text-blue-800 font-bold text-lg mb-2">
                💰 Want More Money?
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Refer friends and earn ₹300 each
              </p>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-blue-800 text-xs">
                  🎯 Unlimited referrals • 💸 Instant payouts • 🏆 No limits
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Verified</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Instant</span>
              </div>
            </div>
          </div>
          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 text-sm mb-2">
                  How it Works?
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Complete quizzes, invite friends, and earn money. It's simple - play, share, and withdraw your winnings directly to your bank account via UPI.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 text-sm mb-2">
                  How can we give out Money?
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  We partner with advertisers and sponsors who pay us for user engagement. This allows us to reward our users with real money for their participation.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 text-sm mb-2">
                  How much you can earn?
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Earn ₹453 from quiz completion + ₹300 for each friend you refer. No limits on referrals - invite as many friends as you want and keep earning!
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 text-sm mb-2">
                  Will I really get money?
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Yes! We guarantee real money transfers. Complete the requirements, and your earnings will be transferred directly to your bank account via UPI within 24 hours.
                </p>
              </div>
            </div>
          </div>


          {/* WhatsApp Invitation Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end">
              <div className="bg-white rounded-t-3xl w-full h-[90vh] transform transition-transform duration-300 ease-out animate-slide-up overflow-y-auto scrollbar-hide">
                <div className="px-4 py-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Invite 3 Friends to Withdraw
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Prize Amount Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-2 mb-6 shadow-sm">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        Your Prize Amount
                      </div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        ₹{baseQuizWinnings}
                      </div>

                      {/* Invitation Progress Section */}
                      <div className=" rounded-lg p-2 border border-blue-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-gray-700">Withdrawal Progress</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-5 mb-3 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-sm"
                            style={{
                              width: `${Math.min(60 + (invitedFriends / 3) * 40, 100)}%`,
                            }}
                          >
                            <span className="text-white text-xs font-bold">{Math.round(60 + (invitedFriends / 3) * 40)}%</span>
                          </div>
                        </div>
                        <div className="text-sm text-blue-600 font-semibold flex items-center justify-center">
                          <Trophy className="h-4 w-4 mr-1" />
                          {invitedFriends >= 3 ? "It's Done! You Can Proceed!" : `Only ${3 - invitedFriends} Invites Pending`}
                        </div>
                      </div>
                    </div>
                  </div>

                 
                
                  <div className="space-y-3">
                    {showInviteButton && (
                      <a
                        href={generateWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleInviteFriend}
                        className={`w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-500 ease-in-out flex items-center justify-center text-sm ${
                          invitedFriends >= 3 ? 'animate-fade-out' : 'animate-slide-up'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Invite Now (Via WhatsApp)
                      </a>
                    )}

                    <button
                      onClick={() => {
                        if (invitedFriends < 3) {
                          alert("Please invite friends to withdraw your money!");
                        } else {
                          handleProceedToAccount();
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all text-sm ${
                        invitedFriends >= 3
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {invitedFriends >= 3
                        ? "Proceed to Withdraw"
                        : "Proceed to Withdraw"}
                    </button>

                    {/* Bank Icons Below Button */}
                    <div className="mt-3 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <img 
                          src="/img/hdfc.png" 
                          alt="HDFC Bank" 
                          className="w-5 h-5 rounded-sm"
                        />
                        <img 
                          src="/img/sbi.png" 
                          alt="SBI Bank" 
                          className="w-5 h-5 rounded-sm"
                        />
                        <img 
                          src="/img/icici.png" 
                          alt="ICICI Bank" 
                          className="w-5 h-5 rounded-sm"
                        />
                        <img 
                          src="/img/axis.png" 
                          alt="Axis Bank" 
                          className="w-5 h-5 rounded-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        + 100 Other Banks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WinPage1;
