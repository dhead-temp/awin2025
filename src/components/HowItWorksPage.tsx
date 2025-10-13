import React, { useState } from 'react';
import { Trophy, Users, Download, CheckCircle, ArrowRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      description: 'Earn ₹300 per referral. ₹10 per click. ₹2 per share.',
      details: 'Share link. Multiply earnings.'
    },
    {
      icon: Download,
      title: 'Download Terabox',
      description: 'Required for withdrawals.',
      details: 'Mandatory step for all withdrawals.'
    }
  ];

  const faqs = [
    {
      question: 'How do I start earning money?',
      answer: 'Simply answer 3 questions correctly to win ₹453. Each player can only play once, so make sure to answer carefully. After completing the quiz, you can earn more by referring friends.'
    },
    {
      question: 'Can I play the quiz multiple times?',
      answer: 'No, each player can only participate in the quiz once. This is to ensure fairness for all participants. However, you can continue earning through our referral program.'
    },
    {
      question: 'How much can I earn through referrals?',
      answer: 'You earn ₹300 for each friend who joins and completes the quiz using your referral link. Additionally, you get ₹10 for every click on your referral link and ₹2 for every share. There\'s no limit to how many friends you can refer!'
    },
    {
      question: 'What is the minimum withdrawal amount?',
      answer: 'The minimum withdrawal amount is ₹800. You also need to download the Terabox app to unlock the withdrawal feature. This is a mandatory requirement for all users.'
    },
    {
      question: 'How long does it take to receive my money?',
      answer: 'Withdrawals are processed within 45 days after verification. The money is transferred directly to your UPI account. During this period, no suspicious activity should be detected on your account.'
    },
    {
      question: 'Why do I need to download Terabox?',
      answer: 'Downloading the Terabox app is a mandatory requirement to unlock the withdrawal feature. This helps us verify genuine users and prevent fraudulent activities.'
    },
    {
      question: 'What happens if I provide wrong answers?',
      answer: 'Don\'t worry! You still win the guaranteed ₹453 regardless of whether your answers are correct or incorrect. The quiz is designed to be fun and rewarding for everyone.'
    },
    {
      question: 'Is this platform safe and legitimate?',
      answer: 'Yes, Answer & Win is a legitimate platform. We have already paid out over ₹50 lakh to our winners this month. All transactions are secure and we follow strict verification processes.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">How It Works</h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            We earn from ads, sponsorships, and other mediums, then distribute earnings across users to create a win-win for all. No deposits required!
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

        {/* FAQs Section */}
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl mb-4">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about Answer & Win
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-3">
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;