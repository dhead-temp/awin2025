import React, { useState, useEffect } from 'react';
import { ChevronRight, Trophy, Clock, Target } from 'lucide-react';
import type { Page } from '../App';
import { trackQuizStart, trackQuizCompletion } from '../utils/analytics';

interface QuizPageProps {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
  hasPlayedQuiz: boolean;
}

const QuizPage: React.FC<QuizPageProps> = ({ onNavigate, onMarkAsPlayed, hasPlayedQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTicking, setIsTicking] = useState(false);
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);

  // Check if user has already claimed quiz reward from localStorage (App.tsx handles database sync)
  useEffect(() => {
    const localPlayed = localStorage.getItem('hasPlayedQuiz') === 'true';
    setIsQuizRewardClaimed(localPlayed);
    
    // Track quiz start if not already played
    if (!localPlayed) {
      trackQuizStart();
    }
  }, []);

  // Function to play tick sound
  const playTickSound = (isUrgent = false) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequency for urgent vs normal ticks
      const frequency = isUrgent ? 1200 : 800;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Higher volume for urgent ticks
      const volume = isUrgent ? 0.5 : 0.3;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio context is not supported
      console.log('Audio not supported');
    }
  };

  const questions = [
    {
      question: "What is the capital of India?",
      options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      correct: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1
    },
    {
      question: "What is 15 + 25?",
      options: ["35", "40", "45", "50"],
      correct: 1
    }
  ];

  const handleAnswer = (selectedIndex: number) => {
    // Prevent multiple selections on the same question
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(selectedIndex);
    const newAnswers = [...answers, selectedIndex];
    setAnswers(newAnswers);

    // Add a small delay to show the selection before moving to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
      } else {
        // All questions answered, check if all answers are wrong
        const allWrong = newAnswers.every((answer, index) => answer !== questions[index].correct);
        
        if (allWrong) {
          // Show retry message instead of navigating to win page
          setCurrentQuestion(-1); // Use -1 to indicate retry state
        } else {
          // Mark played then navigate to win page
          trackQuizCompletion();
          onMarkAsPlayed();
          onNavigate('win1');
        }
      }
    }, 500); // 500ms delay to show selection
  };

  // Reset selectedAnswer when question changes (except for initial load)
  React.useEffect(() => {
    if (currentQuestion > 0) {
      setSelectedAnswer(null);
    }
  }, [currentQuestion]);

  React.useEffect(() => {
    // Don't start timer if in retry state or if quiz reward already claimed
    if (currentQuestion === -1 || isQuizRewardClaimed) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time up, auto-select random answer if no answer selected yet
          if (selectedAnswer === null) {
            handleAnswer(Math.floor(Math.random() * 4));
          }
          return 30;
        }
        // Trigger tick effect and sound
        setIsTicking(true);
        const isUrgent = prev <= 10; // Urgent sound for last 10 seconds
        playTickSound(isUrgent);
        setTimeout(() => setIsTicking(false), 200);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isQuizRewardClaimed, selectedAnswer]);

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  // If all answers are wrong, show retry message
  if (currentQuestion === -1) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">All Answers Wrong!</h1>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
              You got all answers wrong. Retry playing the quiz to win prizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setTimeLeft(30);
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all text-xs sm:text-sm"
              >
                Retry Quiz
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-xs sm:text-sm"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If already played, show message instead of quiz
  if (isQuizRewardClaimed) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">Quiz Done!</h1>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
              You played and won prizes. One play per player.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => onNavigate('win1')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transition-all text-sm sm:text-base"
              >
                View Win Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-2 shadow-lg">
            <Trophy className="h-3 w-3 mr-1" />
            Answer & Win ₹453
          </div>
          {/* <p className="text-gray-600 text-sm md:text-base px-4">Answer all questions correctly to maximize your winnings</p> */}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-700 mb-1.5 font-medium">
            <span>Q{currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progressPercentage)}% Done</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

      

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-4 mb-3">
        <div className="flex items-center justify-between mb-4">
  <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 px-1 leading-tight">
    {questions[currentQuestion].question}
  </h2>

  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
    <Target className="h-3 w-3 mr-1" />
    Q{currentQuestion + 1}
  </div>
</div>


          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {questions[currentQuestion].options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswer === index;
              const isDisabled = selectedAnswer !== null;
              
              return (
                <button
                  key={`q${currentQuestion}-${index}`}
                  onClick={() => handleAnswer(index)}
                  disabled={isDisabled}
                  className={`p-2.5 sm:p-3 rounded-lg text-left transition-all duration-200 transform group border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 scale-[1.02] shadow-lg'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-blue-600 hover:text-white border-gray-200 hover:border-blue-600 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isDisabled
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-blue-100 text-blue-700 group-hover:bg-blue-500 group-hover:text-white'
                      }`}>
                        {optionLabel}
                      </div>
                      <span className="text-xs font-medium">{option}</span>
                    </div>
                    <ChevronRight className={`h-3 w-3 transition-opacity ${
                      isSelected
                        ? 'opacity-100 text-white'
                        : isDisabled
                        ? 'opacity-0'
                        : 'opacity-0 group-hover:opacity-100 text-white'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
  {/* Timer */}
  <div className="flex justify-center mb-6">
          <div className={`bg-red-50 rounded-lg shadow-lg p-2.5 flex items-center space-x-1.5 border border-red-200 transition-all duration-200 ${isTicking ? 'scale-110 shadow-xl' : 'scale-100'}`}>
            <Clock className={`h-3 w-3 sm:h-4 sm:w-4 text-red-500 transition-all duration-200 ${isTicking ? 'animate-pulse' : ''}`} />
            <span className={`text-xs sm:text-sm font-bold text-red-500 transition-all duration-200 ${isTicking ? 'animate-bounce' : ''}`}>{timeLeft}s</span>
            <span className="text-gray-600 text-xs">left</span>
          </div>
        </div>
        {/* Prize Info - Only show after quiz completion */}
        {hasPlayedQuiz && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">Your Prizes</h3>
                <div className="flex justify-center items-center space-x-2 sm:space-x-3 text-xs">
                  <div className="flex items-center bg-white px-2 py-1.5 rounded-lg border border-blue-200">
                    <Trophy className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="font-semibold text-blue-600">₹453 Cash</span>
                  </div>
                </div>
              </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default QuizPage;