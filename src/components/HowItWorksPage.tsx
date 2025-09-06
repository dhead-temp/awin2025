import React from 'react';
import { Trophy, Users, Gift, Download, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: Trophy,
      title: 'Answer Questions',
      description: 'Answer 3 simple questions correctly to win ₹453 + scratch cards',
      details: 'Each player can only play once. Make sure to answer carefully!'
    },
    {
      icon: Gift,
      title: 'Scratch Cards',
      description: 'Win additional money with scratch cards (₹50-₹100 each)',
      details: 'Get 3 scratch cards with every quiz completion'
    },
    {
      icon: Users,
      title: 'Refer Friends',
      description: 'Earn ₹300 per referral + ₹10 per click + ₹1 per share',
      details: 'Share your referral link and multiply your earnings'
    },
    {
      icon: Download,
      title: 'Download Terabox',
      description: 'Required to unlock withdrawal feature',
      details: 'This step is mandatory for all withdrawals'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Follow these simple steps to start earning money with Answer & Win
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                     
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">{index + 1}. {step.title}</h3>
                    </div>
                    <p className="text-gray-700 text-base mb-2">{step.description}</p>
                    <p className="text-gray-500 text-sm">{step.details}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-300 hidden md:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-6 w-6 text-yellow-600 mr-2" />
            Important Notes
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Each player can only play the quiz once - make it count!</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Minimum withdrawal amount is ₹800</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Withdrawals are processed within 45 days after verification</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Terabox app download is mandatory for withdrawals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;