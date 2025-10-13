import React from 'react';
import { Trophy, Users, ChevronRight, Zap, BookOpen, TrendingUp, Target } from 'lucide-react';
import StatsCard from './StatsCard';
import { Page } from '../App';
import LiveWinnersList from './LiveWinnersList';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  hasPlayedQuiz: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, hasPlayedQuiz }) => {

  const features = [
    { icon: Trophy, title: 'Answer & Win', desc: 'Answer 3 simple questions and win instantly' },
    { icon: Users, title: 'Refer Friends', desc: 'Earn ₹300 per referral + bonuses' },
    { icon: TrendingUp, title: 'Grow Earnings', desc: 'Multiple ways to increase your income' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <button
              onClick={() => onNavigate('how-it-works')}
              className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 hover:bg-white/30 transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              How It Works
            </button>
            <div className="text-yellow-300 text-sm sm:text-base font-semibold mb-3">
              Over ₹50 Lakh Won This Month!
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              Answer Simple Questions &
              <span className="block bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                Win Real Money
              </span>
            </h1>
            <p className="text-sm sm:text-base text-white/90 mb-4 max-w-2xl mx-auto px-4 leading-relaxed">
              Join thousands of winners who are earning money daily. Answer 3 questions, refer friends, and watch your earnings grow!
            </p>
            <button
              onClick={() => onNavigate('quiz')}
              disabled={hasPlayedQuiz}
              className={`inline-flex items-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                hasPlayedQuiz
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {hasPlayedQuiz ? 'Already Played' : 'Start Playing Now'}
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-6 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-600 text-xs sm:text-sm px-4">Simple steps to start earning money today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group px-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl mb-2 group-hover:shadow-xl transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Winners List */}
      <div className="py-6 md:py-8 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveWinnersList />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-6 md:py-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3">Ready to Start Winning?</h2>
          <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed">
            Join over 100,000 players and start earning money today. It's free to play!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('quiz')}
              disabled={hasPlayedQuiz}
              className={`inline-flex items-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                hasPlayedQuiz
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-gray-50'
              }`}
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {hasPlayedQuiz ? 'Already Played' : 'Play Now'}
            </button>
            <button
              onClick={() => onNavigate('account')}
              className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              View Earnings
            </button>
          </div>
        </div>
      </div>

      {/* Earning Stats Section */}
      <div className="py-6 md:py-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Your Earning Potential</h2>
            <p className="text-gray-600 text-sm">Multiple ways to maximize your income</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Quiz Win"
              value="₹453"
              subtitle="One-time reward"
              subtitleValue="Instant"
              description="Answer 3 questions correctly and win ₹453 instantly."
              icon={Trophy}
              color="orange"
            />
            <StatsCard
              title="Per Referral"
              value="₹300"
              subtitle="Earn per friend"
              subtitleValue="Unlimited"
              description="Invite friends to play. Earn ₹300 when they complete quiz."
              icon={Users}
              color="green"
            />
            <StatsCard
              title="Per Click"
              value="₹10"
              subtitle="Link clicks"
              subtitleValue="Daily"
              description="Share your link anywhere. Earn ₹10 per click."
              icon={TrendingUp}
              color="blue"
            />
          </div>
          
          <div className="text-center">
            <button
              onClick={() => onNavigate('account')}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            >
              <Target className="h-4 w-4 mr-2" />
              Track Your Earnings
            </button>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-6 md:py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How do I start earning?', a: 'Simply answer 3 questions to win your first reward, then invite friends to multiply your earnings.' },
              { q: 'What is the minimum withdrawal?', a: 'You need at least ₹800 to withdraw. Download Terabox app to unlock withdrawals.' },
              { q: 'How much can I earn per referral?', a: 'Earn ₹300 per successful referral, ₹10 per link click, and ₹1 per share.' },
              { q: 'When will I receive my money?', a: 'Withdrawals are processed within 45 days to your UPI account after verification.' }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">{faq.q}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;