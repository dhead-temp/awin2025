import React, { useState, useEffect } from 'react';
import { Trophy, Gift, Share2, ChevronRight, Crown, Target, X, Users, MessageCircle, Plus } from 'lucide-react';
import { Page } from '../App';
import ScratchCard from './ScratchCard';

interface WinPageProps {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
}

const WinPage: React.FC<WinPageProps> = ({ onNavigate, onMarkAsPlayed }) => {
  const [showScratchCards, setShowScratchCards] = useState(true);
  const [scratchedCards, setScratchedCards] = useState<boolean[]>([false, false]);
  const [scratchCardValues, setScratchCardValues] = useState<number[]>([]);
  const [totalScratchWinnings, setTotalScratchWinnings] = useState(0);
  const [claimedBonus, setClaimedBonus] = useState(0); // ✅ fixed part
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(0);
  const [bonusAddedToAccount, setBonusAddedToAccount] = useState(false);

  // Save scratch card data to localStorage
  const saveScratchCardData = (values: number[], scratched: boolean[], winnings: number, claimed: number, bonusAdded: boolean, invited: number) => {
    const scratchData = {
      values,
      scratched,
      winnings,
      claimed,
      bonusAdded,
      invited,
      timestamp: Date.now()
    };
    localStorage.setItem('scratchCardData', JSON.stringify(scratchData));
  };

  // Load scratch card data from localStorage
  const loadScratchCardData = () => {
    try {
      const saved = localStorage.getItem('scratchCardData');
      if (saved) {
        const data = JSON.parse(saved);
        // Check if data is from today (reset daily)
        const today = new Date().toDateString();
        const savedDate = new Date(data.timestamp).toDateString();
        
        if (today === savedDate) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading scratch card data:', error);
    }
    return null;
  };

  useEffect(() => {
    // Try to load saved data first
    const savedData = loadScratchCardData();
    
    if (savedData) {
      // Restore saved state
      setScratchCardValues(savedData.values);
      setScratchedCards(savedData.scratched);
      setTotalScratchWinnings(savedData.winnings);
      setClaimedBonus(savedData.claimed);
      setBonusAddedToAccount(savedData.bonusAdded);
      setInvitedFriends(savedData.invited);
    } else {
      // Generate new random values for scratch cards
      const newValues = [
        Math.floor(Math.random() * 51) + 150, // Random number between 150 and 200
        Math.floor(Math.random() * 51) + 150  // Random number between 150 and 200
      ];
      setScratchCardValues(newValues);

      // Reset other states
      setScratchedCards([false, false]);
      setTotalScratchWinnings(0);
      setClaimedBonus(0);
      setBonusAddedToAccount(false);
      setInvitedFriends(0);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

    const handleScratch = (cardIndex: number, value: number) => {
    setScratchedCards(prevScratched => {
      // Check if already scratched to prevent double counting
      if (prevScratched[cardIndex]) {
        return prevScratched;
      }

      // Add winnings only once
      setTotalScratchWinnings(prevWinnings => {
        const newWinnings = prevWinnings + value;
        
        // Save updated state to localStorage
        const newScratched = [...prevScratched];
        newScratched[cardIndex] = true;
        saveScratchCardData(scratchCardValues, newScratched, newWinnings, claimedBonus, bonusAddedToAccount, invitedFriends);
        
        return newWinnings;
      });

      const newScratched = [...prevScratched];
      newScratched[cardIndex] = true;
      return newScratched;
    });
  };

  const allCardsScratched = scratchedCards.every(card => card);
  const baseQuizWinnings = 453;

  // ✅ Correct balance & pending
  const accountBalance = baseQuizWinnings + claimedBonus;
  const pendingScratchWinnings = totalScratchWinnings - claimedBonus;
  

  const handleFirstWithdrawClick = () => {
    const accountSection = document.getElementById('account-balance');
    if (accountSection) {
      accountSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSecondWithdrawClick = () => {
    if (bonusAddedToAccount || pendingScratchWinnings === 0) {
      onNavigate('account');
    } else {
      setShowWithdrawModal(true);
    }
  };

  const handleAddBonusClick = () => {
    setShowInviteModal(true);
  };

  const handleInviteFriend = () => {
    setTimeout(() => {
      const newCount = invitedFriends + 1;
      setInvitedFriends(newCount);
      // Save updated invited friends count
      saveScratchCardData(scratchCardValues, scratchedCards, totalScratchWinnings, claimedBonus, bonusAddedToAccount, newCount);
    }, 2000);
  };

  const handleAddBonusNow = () => {
    setClaimedBonus(totalScratchWinnings); // ✅ move to claimed
    setBonusAddedToAccount(true);
    setShowInviteModal(false);
    setShowWithdrawModal(false);
    // Save updated bonus state
    saveScratchCardData(scratchCardValues, scratchedCards, totalScratchWinnings, totalScratchWinnings, true, invitedFriends);
  };

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(
      "🎉 Hey! I just won ₹453 by answering simple questions on this amazing app! You can earn money too by playing quizzes and completing tasks. Join now using my link and start earning: https://example.com/ref/123"
    );
    return `https://wa.me/?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Celebration Header */}
        <div className="text-center mb-6">
          {showCelebration && (
            <div className="animate-bounce mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
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
        <div className="bg-gradient-to-br from-white via-green-50 to-green-100 border border-green-600 rounded-2xl text-gray-800 p-6 md:p-8 mb-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full shadow-inner">
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-green-900">
              Quiz Completion Prize
            </h2>
            <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
              ₹453
            </div>
            <p className="text-green-800 font-semibold text-sm md:text-base mb-5">
              ✅ Securely added to your account
            </p>

            {/* Withdraw Button */}
            <div className="flex justify-center">
              <button
                onClick={handleFirstWithdrawClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300"
              >
                Withdraw Now
              </button>
            </div>
          </div>
        </div>

        {/* Scratch Cards Section */}
        <div className="mb-6 border border-gray-200 rounded-xl p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg md:text-l font-bold text-gray-900 mb-2">
              Bonus Scratch Cards Worth upto ₹499
            </h2>
            <p className="text-gray-600 text-sm">Scratch both cards to reveal your bonus winnings!</p>
          </div>

          {showScratchCards ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {scratchCardValues.map((value, index) => (
                <ScratchCard
                  key={index}
                  value={value}
                  onScratch={(val) => handleScratch(index, val)}
                  isScratched={scratchedCards[index]}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-2xl p-6 text-center animate-pulse">
                  <Gift className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading scratch card...</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Bonus to Account Button */}
          {pendingScratchWinnings > 0 && !bonusAddedToAccount && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-4 mb-4">
                <div className="text-orange-800 font-semibold mb-2">
                  🎉 You've won ₹{pendingScratchWinnings} in bonus!
                </div>
                <div className="text-sm text-orange-700 mb-4">
                  To add this bonus to your account, invite 3 friends via WhatsApp
                </div>
                <button
                  onClick={handleAddBonusClick}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Bonus to Earnings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Balance Section */}
        <div id="account-balance" className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full shadow-inner">
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Account Balance</h2>
            <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-4">₹{accountBalance}</div>

            {/* Balance Breakdown - Only show after scratching cards */}
            {scratchedCards.some(card => card) && (
              <div className="bg-white/60 rounded-xl p-4 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Balance Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quiz Completion Prize:</span>
                    <span className="font-semibold text-green-600">₹{baseQuizWinnings}</span>
                  </div>
                  {claimedBonus > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Scratch Card Bonus:</span>
                      <span className="font-semibold text-green-600">₹{claimedBonus}</span>
                    </div>
                  )}
                  {pendingScratchWinnings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Scratch Card Bonus (Pending):</span>
                      <span className="font-semibold text-orange-600">₹{pendingScratchWinnings}</span>
                    </div>
                  )}
                  {pendingScratchWinnings > 0 && (
                    <>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-800">Available for Withdrawal:</span>
                        <span className="text-blue-600">₹{baseQuizWinnings + claimedBonus}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center mb-4">
              <button
                onClick={handleSecondWithdrawClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300"
              >
                Withdraw to Bank Account
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
            className="w-full border-2 border-emerald-500 text-emerald-600 py-3 px-6 rounded-xl font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Refer Friends
          </a>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Insufficient Balance</h3>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {pendingScratchWinnings < 1 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-4 animate-pulse">
                      <div className="text-red-700 font-semibold mb-3 flex items-center justify-center gap-2">
                        ⚠️ Try scratching cards and claiming bonuses to increase your balance!
                      </div>
                    </div>
                  )}
                </div>

                {pendingScratchWinnings > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Gift className="h-5 w-5 text-orange-600 mr-2" />
                      <h4 className="font-semibold text-orange-800">Scratch Card Bonus Available</h4>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-2">₹{pendingScratchWinnings}</div>
                    <div className="text-sm text-orange-700 mb-3">
                      You have unclaimed scratch card winnings! To claim this bonus amount, you need to:
                    </div>
                    <button
                      onClick={() => {
                        setShowInviteModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Claim Bonus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Claim Your Bonus</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Bonus Amount</div>
                    <div className="text-2xl font-bold text-green-600 mb-3">₹{pendingScratchWinnings}</div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Friends Invited</span>
                        <span>{invitedFriends}/3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((invitedFriends / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {invitedFriends < 3 ? (
                      <div className="text-sm text-gray-700">
                        Invite {3 - invitedFriends} more friend{3 - invitedFriends !== 1 ? 's' : ''} to claim your bonus!
                      </div>
                    ) : (
                      <div className="text-sm text-green-700 font-semibold">
                        🎉 All friends invited! Bonus will be added to your account.
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
                    onClick={handleAddBonusNow}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                      invitedFriends >= 3
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={invitedFriends < 3}
                  >
                    {invitedFriends >= 3 ? '✅ Add Bonus Now' : 'Invite 3 Friends to Unlock'}
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
