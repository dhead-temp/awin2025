import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FaqsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I start earning money?',
      answer: 'Simply answer 3 questions correctly to win ₹453 + 3 scratch cards. Each player can only play once, so make sure to answer carefully. After completing the quiz, you can earn more by referring friends.'
    },
    {
      question: 'Can I play the quiz multiple times?',
      answer: 'No, each player can only participate in the quiz once. This is to ensure fairness for all participants. However, you can continue earning through our referral program.'
    },
    {
      question: 'How much can I earn through referrals?',
      answer: 'You earn ₹300 for each friend who joins and completes the quiz using your referral link. Additionally, you get ₹10 for every click on your referral link and ₹1 for every share. There\'s no limit to how many friends you can refer!'
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
      answer: 'Don\'t worry! You still win the guaranteed ₹453 + 3 scratch cards regardless of whether your answers are correct or incorrect. The quiz is designed to be fun and rewarding for everyone.'
    },
    {
      question: 'How do scratch cards work?',
      answer: 'After completing the quiz, you receive 3 scratch cards. Each card contains a prize between ₹50-₹100. Simply scratch the cards to reveal your bonus winnings, which are added to your total earnings.'
    },
    {
      question: 'Is this platform safe and legitimate?',
      answer: 'Yes, Answer & Win is a legitimate platform. We have already paid out over ₹50 lakh to our winners this month. All transactions are secure and we follow strict verification processes.'
    },
    {
      question: 'Can I create multiple accounts?',
      answer: 'No, creating multiple accounts is strictly prohibited and will result in account termination. Each person is allowed only one account to ensure fair play for all participants.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We currently support UPI payments only. You need to provide a valid UPI ID during withdrawal. The money is transferred directly to your UPI account after verification.'
    },
    {
      question: 'How can I track my earnings?',
      answer: 'You can track all your earnings in the "My Account" section. This includes your quiz winnings, scratch card bonuses, referral earnings, and total balance available for withdrawal.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Answer & Win
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900 pr-4">{faq.question}</h3>
                {openFaq === index ? (
                  <ChevronUp className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-4 md:p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Still have questions?</h3>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            Can't find the answer you're looking for? Our support team is here to help you.
          </p>
          <button className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-xl transition-all text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqsPage;