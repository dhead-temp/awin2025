import React from 'react';
import { Trophy, Users, Download, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: Trophy,
      title: 'Answer Questions',
      description: 'Answer 3 questions. Win ₹453.',
      details: 'One play per player. Answer carefully!'
    },
    {
      icon: Users,
      title: 'Refer Friends',
      description: 'Earn ₹300 per referral. ₹10 per click. ₹1 per share.',
      details: 'Share link. Multiply earnings.'
    },
    {
      icon: Download,
      title: 'Download Terabox',
      description: 'Required for withdrawals.',
      details: 'Mandatory step for all withdrawals.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">How It Works</h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Simple steps to earn with Answer & Win
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-3 md:p-4">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm md:text-base font-bold text-gray-900">{index + 1}. {step.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{step.description}</p>
                    <p className="text-gray-500 text-xs">{step.details}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-3 md:p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 text-yellow-600 mr-1.5" />
            Important Notes
          </h3>
          <ul className="space-y-1.5 text-gray-700 text-xs">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>One play per player - make it count!</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Minimum withdrawal: ₹800</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Withdrawals: 45 days after verification</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Terabox app required for withdrawals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;