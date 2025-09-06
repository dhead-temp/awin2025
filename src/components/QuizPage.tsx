import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, Trophy, Clock, Target } from 'lucide-react';
import { Page } from '../App';

interface QuizPageProps {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
  hasPlayedQuiz: boolean;
}

const QuizPage: React.FC<QuizPageProps> = ({ onNavigate, onMarkAsPlayed, hasPlayedQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

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
    const newAnswers = [...answers, selectedIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      // All questions answered, navigate to win page
      onMarkAsPlayed();
      onNavigate('win');
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time up, auto-select random answer
          handleAnswer(Math.floor(Math.random() * 4));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  // If already played, show message instead of quiz
  if (hasPlayedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Quiz Already Completed!</h1>
            <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
              You've already played the quiz and won your prizes. Each player can only play once.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('win')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 md:px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all text-sm md:text-base"
              >
                View My Winnings
              </button>
              <button
                onClick={() => onNavigate('account')}
                className="border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm md:text-base"
              >
                Earn More by Referring
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4 mr-2" />
            Contest in Progress
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 px-4">
            Answer & Win ₹453 + Scratch Cards
          </h1>
          <p className="text-gray-600 text-sm md:text-base px-4">Answer all questions correctly to maximize your winnings</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-3">
            <Clock className="h-6 w-6 text-red-500" />
            <span className="text-lg md:text-xl font-bold text-red-500">{timeLeft}s</span>
            <span className="text-gray-600 text-sm md:text-base">remaining</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Target className="h-4 w-4 mr-2" />
              Question {currentQuestion + 1}
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="bg-gray-50 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-blue-600 hover:text-white p-3 md:p-4 rounded-2xl text-left transition-all transform hover:scale-105 hover:shadow-xl group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium">{option}</span>
                  <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prize Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-3 md:p-4">
          <div className="text-center">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Guaranteed Prizes</h3>
            <div className="flex justify-center items-center space-x-4 md:space-x-6 text-sm md:text-base">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="font-semibold text-emerald-600">₹453 Cash</span>
              </div>
              <div className="text-gray-400">+</div>
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-600">3 Scratch Cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;