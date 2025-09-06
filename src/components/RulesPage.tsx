import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RulesPage: React.FC = () => {
  const rules = [
    {
      category: 'Quiz Rules',
      icon: CheckCircle,
      color: 'emerald',
      items: [
        'Each player can participate only once in the quiz',
        'You must answer all 3 questions to complete the quiz',
        'Time limit of 30 seconds per question',
        'All answers are final once submitted',
        'Quiz completion guarantees ₹453 + 3 scratch cards'
      ]
    },
    {
      category: 'Referral Rules',
      icon: Shield,
      color: 'blue',
      items: [
        'Earn ₹300 for each successful referral who completes the quiz',
        'Earn ₹10 for each click on your referral link',
        'Earn ₹1 for each share of your referral link',
        'Referral bonuses are added to your account immediately',
        'No limit on the number of referrals you can make'
      ]
    },
    {
      category: 'Withdrawal Rules',
      icon: AlertTriangle,
      color: 'orange',
      items: [
        'Minimum withdrawal amount is ₹800',
        'Terabox app download is mandatory before withdrawal',
        'Valid UPI ID required for money transfer',
        'Withdrawals processed within 45 days after verification',
        'No suspicious activity should be detected during verification period'
      ]
    },
    {
      category: 'Prohibited Activities',
      icon: XCircle,
      color: 'red',
      items: [
        'Creating multiple accounts is strictly forbidden',
        'Using bots or automated tools to generate clicks/shares',
        'Providing false information during registration or withdrawal',
        'Attempting to manipulate the quiz or referral system',
        'Any fraudulent activity will result in account termination'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Contest Rules</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Please read and understand all rules before participating in Answer & Win
          </p>
        </div>

        {/* Rules Categories */}
        <div className="space-y-6">
          {rules.map((category, index) => {
            const Icon = category.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-emerald-600 border-emerald-200 bg-emerald-50',
              blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
              orange: 'from-orange-500 to-orange-600 border-orange-200 bg-orange-50',
              red: 'from-red-500 to-red-600 border-red-200 bg-red-50'
            };

            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[category.color as keyof typeof colorClasses].split(' ')[1]} p-4`}>
                  <div className="flex items-center text-white">
                    <Icon className="h-6 w-6 mr-3" />
                    <h2 className="text-lg font-bold">{category.category}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {category.items.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start">
                        <span className={`w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0 ${
                          category.color === 'emerald' ? 'bg-emerald-500' :
                          category.color === 'blue' ? 'bg-blue-500' :
                          category.color === 'orange' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></span>
                        <span className="text-gray-700 text-sm leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agreement Notice */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Agreement</h3>
          <p className="text-gray-700 text-center text-sm leading-relaxed">
            By participating in Answer & Win, you agree to abide by all the rules mentioned above. 
            Violation of any rule may result in disqualification and forfeiture of earnings. 
            We reserve the right to modify these rules at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;