import React, { useState, useEffect } from 'react';
import { Trophy, Share2, Crown, X, MessageCircle } from 'lucide-react';
import type { Page } from '../App';
import { DOMAIN, apiService } from '../services/api';
import { trackWinPageView, trackWinPageWithdrawClick, trackUniqueInviteClickOnWinPage, trackUniqueProceedFromWinPage } from '../utils/analytics';

interface WinPageProps {
  onNavigate: (page: Page) => void;
  currentUser: {
    id: number | null;
    token: string | null;
    invitedBy: string | null;
  };
  onCreateUser: () => Promise<{
    id: number | null;
    token: string | null;
    invitedBy: string | null;
  } | null>;
}

const WinPage: React.FC<WinPageProps> = ({ onNavigate, currentUser, onCreateUser }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(0);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const baseQuizWinnings = 453;

  const handleWithdrawClick = async () => {
    // Track withdraw button click
    trackWinPageWithdrawClick();
    
    setIsCreatingUser(true);
    
    // Create user if not exists
    const user = await onCreateUser();
    
    if (user && user.id) {
      setShowInviteModal(true);
    } else {
      console.error('Failed to create user for withdrawal');
      alert('Failed to create user account. Please try again.');
    }
    
    setIsCreatingUser(false);
  };

  const handleInviteFriend = () => {
    // Track unique invite click
    trackUniqueInviteClickOnWinPage();
    
    setTimeout(() => {
      const newCount = invitedFriends + 1;
      setInvitedFriends(newCount);
    }, 2000);
  };

  const handleProceedToAccount = async () => {
    // Track unique proceed from win page
    trackUniqueProceedFromWinPage();
    
    if (invitedFriends >= 3 && currentUser.id) {
      // Update quiz reward claimed status and shares count
      try {
        const response = await apiService.updateQuizRewardStatus(currentUser.id, 3);
        if (response.status === 'success') {
          console.log('Quiz reward status updated successfully');
          setShowInviteModal(false);
          onNavigate('account');
        } else {
          console.error('Failed to update quiz reward status:', response.message);
          alert('Failed to update reward status. Please try again.');
        }
      } catch (error) {
        console.error('Error updating quiz reward status:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const generateWhatsAppLink = () => {
    const userId = currentUser.id || 'new';
    const referralUrl = `${DOMAIN}?by=${userId}`;
    const message = encodeURIComponent(
      `Ye Dekhna - ${referralUrl}`
    );
    return `https://wa.me/?text=${message}`;
  };

  useEffect(() => {
    // Track win page view
    trackWinPageView();
    
    // Trigger celebration briefly when page loads
    const t1 = setTimeout(() => setShowCelebration(true), 200);
    const t2 = setTimeout(() => setShowCelebration(false), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Celebration Header */}
        <div className="text-center mb-6">
          {showCelebration && (
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-bounce">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="mt-2 text-yellow-600 text-sm font-semibold animate-pulse">You won! 🎊</div>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-gray-600 text-sm md:text-base px-4">
            You've successfully completed the quiz and won amazing prizes!
          </p>
        </div>

        {/* Quiz Prize */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-600 rounded-2xl text-gray-800 p-6 md:p-8 mb-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full shadow-inner">
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-blue-900">
              Quiz Completion Prize
            </h2>
            <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
              ₹{baseQuizWinnings}
            </div>
            <p className="text-blue-800 font-semibold text-sm md:text-base mb-5">
              ✅ Securely added to your account
            </p>

            {/* Withdraw Button */}
            <div className="flex justify-center">
              <button
                onClick={handleWithdrawClick}
                disabled={isCreatingUser}
                className={`w-full font-semibold py-3 px-6 rounded-full shadow-md transition-colors duration-300 ${
                  isCreatingUser
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isCreatingUser ? 'Creating Account...' : 'Withdraw Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInviteFriend}
            className="w-full border-2 border-blue-500 text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Refer Friends
          </a>
        </div>

        {/* WhatsApp Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Invite 3 Friends to Withdraw</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Your Prize Amount</div>
                    <div className="text-2xl font-bold text-blue-600 mb-3">₹{baseQuizWinnings}</div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Friends Invited</span>
                        <span>{invitedFriends}/3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((invitedFriends / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {invitedFriends < 3 ? (
                      <div className="text-sm text-gray-700">
                        Invite {3 - invitedFriends} more friend{3 - invitedFriends !== 1 ? 's' : ''} to withdraw your winnings!
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700 font-semibold">
                        🎉 All friends invited! You can now proceed to withdraw.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-800 mb-2">Share via WhatsApp</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Send your referral link to friends and earn when they join!
                    </p>
                  </div>

                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleInviteFriend}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Send Invitation via WhatsApp
                  </a>

                  <button
                    onClick={handleProceedToAccount}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                      invitedFriends >= 3
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={invitedFriends < 3}
                  >
                    {invitedFriends >= 3 ? '✅ Proceed to Withdraw' : 'Invite 3 Friends to Unlock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WinPage;
