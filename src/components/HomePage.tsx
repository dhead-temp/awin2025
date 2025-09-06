import React from 'react';
import { Trophy, Users, Award, ChevronRight, Star, Zap, BookOpen, TrendingUp, Gift, Crown, Target } from 'lucide-react';
import { Page } from '../App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  hasPlayedQuiz: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, hasPlayedQuiz }) => {
  const recentWinners = [
    { name: 'Priya S.', amount: 1250, location: 'Mumbai' },
    { name: 'Rahul K.', amount: 890, location: 'Delhi' },
    { name: 'Sneha M.', amount: 1500, location: 'Bangalore' },
    { name: 'Amit P.', amount: 750, location: 'Pune' },
    { name: 'Kavya R.', amount: 920, location: 'Chennai' }
  ];

  const features = [
    { icon: Trophy, title: 'Answer & Win', desc: 'Answer 3 simple questions and win instantly' },
    { icon: Users, title: 'Refer Friends', desc: 'Earn ₹300 per referral + bonuses' },
    { icon: Gift, title: 'Scratch Cards', desc: 'Win up to ₹100 with every game' },
    { icon: TrendingUp, title: 'Grow Earnings', desc: 'Multiple ways to increase your income' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <button
              onClick={() => onNavigate('how-it-works')}
              className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 hover:bg-white/30 transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              How It Works
            </button>
            <div className="text-yellow-300 text-lg font-semibold mb-4">
              Over ₹50 Lakh Won This Month!
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Answer Simple Questions &
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Win Real Money
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-4 md:mb-6 max-w-2xl mx-auto px-4 leading-relaxed">
              Join thousands of winners who are earning money daily. Answer 3 questions, refer friends, and watch your earnings grow!
            </p>
            <button
              onClick={() => onNavigate('quiz')}
              disabled={hasPlayedQuiz}
              className={`inline-flex items-center px-8 py-4 rounded-2xl text-lg font-semibold transition-all ${
                hasPlayedQuiz
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              <Trophy className="h-6 w-6 mr-2" />
              {hasPlayedQuiz ? 'Already Played' : 'Start Playing Now'}
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 text-sm md:text-base px-4">Simple steps to start earning money today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl mb-3 group-hover:shadow-xl transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Winners */}
      <div className="py-8 md:py-12 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Recent Winners</h2>
            <p className="text-gray-600 text-sm md:text-base px-4">See who's winning today</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {recentWinners.map((winner, index) => (
              <div key={index} className="bg-white rounded-2xl p-3 md:p-4 text-center shadow-lg hover:shadow-xl transition-all">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{winner.name}</h3>
                <p className="text-lg md:text-xl font-bold text-emerald-600 mb-1">₹{winner.amount}</p>
                <p className="text-sm text-gray-500">{winner.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 md:py-12 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">Ready to Start Winning?</h2>
          <p className="text-base md:text-lg text-white/90 mb-4 md:mb-6 leading-relaxed">
            Join over 100,000 players and start earning money today. It's free to play!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('quiz')}
              disabled={hasPlayedQuiz}
              className={`inline-flex items-center px-8 py-4 rounded-2xl text-lg font-semibold transition-all ${
                hasPlayedQuiz
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-gray-50'
              }`}
            >
              <Zap className="h-6 w-6 mr-2" />
              {hasPlayedQuiz ? 'Already Played' : 'Play Now'}
            </button>
            <button
              onClick={() => onNavigate('account')}
              className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              <Target className="h-6 w-6 mr-2" />
              View Earnings
            </button>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-8 md:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How do I start earning?', a: 'Simply answer 3 questions to win your first reward, then invite friends to multiply your earnings.' },
              { q: 'What is the minimum withdrawal?', a: 'You need at least ₹800 to withdraw. Download Terabox app to unlock withdrawals.' },
              { q: 'How much can I earn per referral?', a: 'Earn ₹300 per successful referral, ₹10 per link click, and ₹1 per share.' },
              { q: 'When will I receive my money?', a: 'Withdrawals are processed within 45 days to your UPI account after verification.' }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3 md:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{faq.q}</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;