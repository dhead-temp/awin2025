import React, { useState, useEffect } from 'react';
import { Trophy, Gift, Share2, ChevronRight, Sparkles, Crown, Target } from 'lucide-react';
import { Page } from '../App';
import ScratchCard from './ScratchCard';

interface WinPageProps {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
}

const WinPage: React.FC<WinPageProps> = ({ onNavigate, onMarkAsPlayed }) => {
  const [showScratchCards, setShowScratchCards] = useState(true);
  const [scratchedCards, setScratchedCards] = useState<boolean[]>([false, false, false]);
  const [scratchCardValues] = useState([75, 50, 100]); // Random values for demo
  const [totalScratchWinnings, setTotalScratchWinnings] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Quiz is already marked as played from QuizPage
  }, [onMarkAsPlayed]);

  const handleScratch = (cardIndex: number, value: number) => {
    const newScratchedCards = [...scratchedCards];
    newScratchedCards[cardIndex] = true;
    setScratchedCards(newScratchedCards);
    setTotalScratchWinnings(prev => prev + value);
  };

  const allCardsScratched = scratchedCards.every(card => card);
  const totalWinnings = 453 + totalScratchWinnings;

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
          <p className="text-gray-600 text-sm md:text-base px-4">You've successfully completed the quiz and won amazing prizes!</p>
        </div>

        {/* Quiz Prize */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl text-white p-4 md:p-6 mb-6 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Quiz Completion Prize</h2>
            <div className="text-3xl md:text-4xl font-bold mb-2">₹453</div>
            <p className="text-blue-100 text-sm">Added to your account</p>
          </div>
        </div>

        {/* Scratch Cards Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Bonus Scratch Cards</h2>
            <p className="text-gray-600 text-sm">Scratch all 3 cards to reveal your bonus winnings!</p>
          </div>

          {showScratchCards ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-2xl p-6 text-center animate-pulse">
                  <Gift className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading scratch card...</p>
                </div>
              ))}
            </div>
          )}

          {totalScratchWinnings > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white p-4 text-center mb-6">
              <Sparkles className="h-6 w-6 mx-auto mb-2" />
              <h3 className="font-bold mb-1">Scratch Card Bonus</h3>
              <div className="text-2xl font-bold">₹{totalScratchWinnings}</div>
            </div>
          )}
        </div>

        {/* Total Winnings */}
        {allCardsScratched && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-white p-4 md:p-6 mb-6 shadow-xl">
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-bold mb-2">Total Winnings</h2>
              <div className="text-4xl md:text-5xl font-bold mb-2">₹{totalWinnings}</div>
              <p className="text-yellow-100 text-sm">Quiz Prize + Scratch Card Bonus</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => onNavigate('account')}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center"
          >
            <Target className="h-5 w-5 mr-2" />
            View My Account
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>

          <button
            onClick={() => onNavigate('account')}
            className="w-full border-2 border-emerald-500 text-emerald-600 py-3 px-6 rounded-xl font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Refer Friends & Earn More
          </button>
        </div>

        {/* Earning More Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-900 mb-2 text-center">Want to Earn More?</h3>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-emerald-600">₹300</div>
              <div className="text-gray-600">Per Referral</div>
            </div>
            <div>
              <div className="font-bold text-blue-600">₹10</div>
              <div className="text-gray-600">Per Click</div>
            </div>
            <div>
              <div className="font-bold text-purple-600">₹1</div>
              <div className="text-gray-600">Per Share</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinPage;