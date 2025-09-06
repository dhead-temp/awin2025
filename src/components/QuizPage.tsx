import React, { useState } from 'react';
import { ChevronRight, Trophy, Clock, Target } from 'lucide-react';
import LiveWinnersList from './LiveWinnersList';
import { Page } from '../App';

interface QuizPageProps {
  onNavigate: (page: Page) => void;
  onMarkAsPlayed: () => void;
  hasPlayedQuiz: boolean;
}

const QuizPage: React.FC<QuizPageProps> = ({ onNavigate, onMarkAsPlayed, hasPlayedQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);

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
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3">Quiz Already Completed!</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
              You've already played the quiz and won your prizes. Each player can only play once.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('win')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-xl transition-all text-xs sm:text-sm"
              >
                View My Winnings
              </button>
              <button
                onClick={() => onNavigate('account')}
                className="border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-xs sm:text-sm"
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 shadow-lg">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            Answer & Win ₹453 + Scratch Cards
          </div>
          {/* <p className="text-gray-600 text-sm md:text-base px-4">Answer all questions correctly to maximize your winnings</p> */}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-2 font-medium">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

      

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
  {/* Left Side - Question */}
  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 px-2 leading-tight">
    {questions[currentQuestion].question}
  </h2>

  {/* Right Side - Question Number */}
  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
    <Target className="h-4 w-4 mr-2" />
    Question {currentQuestion + 1}
  </div>
</div>


          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="bg-gray-50 hover:bg-blue-600 hover:text-white p-3 sm:p-4 rounded-xl text-left transition-all transform hover:scale-105 hover:shadow-xl group border border-gray-200 hover:border-blue-600"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">{option}</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
  {/* Timer */}
  <div className="flex justify-center mb-6">
          <div className="bg-red-50 rounded-xl shadow-lg p-3 flex items-center space-x-2 border border-red-200">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <span className="text-sm sm:text-base font-bold text-red-500">{timeLeft}s</span>
            <span className="text-gray-600 text-xs sm:text-sm">remaining</span>
          </div>
        </div>
        {/* Prize Info */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-center">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">Guaranteed Prizes</h3>
            <div className="flex justify-center items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-blue-200">
                <Trophy className="h-4 w-4 text-blue-600 mr-1.5" />
                <span className="font-semibold text-blue-600">₹453 Cash</span>
              </div>
              <div className="text-blue-400 font-bold">+</div>
              <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-blue-200">
                <Target className="h-4 w-4 text-blue-600 mr-1.5" />
                <span className="font-semibold text-blue-600">3 Scratch Cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Winners List */}
        <div className="mt-6">
          <LiveWinnersList />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;