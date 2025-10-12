import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RulesPage: React.FC = () => {
  const rules = [
    {
      category: 'Quiz Rules',
      icon: CheckCircle,
      color: 'emerald',
      items: [
        'One play per player',
        'Answer all 3 questions',
        '30 seconds per question',
        'Answers are final',
        'Guaranteed ₹453'
      ]
    },
    {
      category: 'Referral Rules',
      icon: Shield,
      color: 'blue',
      items: [
        '₹300 per successful referral',
        '₹10 per link click',
        '₹1 per share',
        'Bonuses added immediately',
        'No referral limit'
      ]
    },
    {
      category: 'Withdrawal Rules',
      icon: AlertTriangle,
      color: 'orange',
      items: [
        'Minimum ₹800 withdrawal',
        'Terabox app required',
        'Valid UPI ID needed',
        '45 days processing time',
        'No suspicious activity'
      ]
    },
    {
      category: 'Prohibited Activities',
      icon: XCircle,
      color: 'red',
      items: [
        'No multiple accounts',
        'No bots or automation',
        'No false information',
        'No system manipulation',
        'Account termination for fraud'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Contest Rules</h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Read all rules before playing Answer & Win
          </p>
        </div>

        {/* Rules Categories */}
        <div className="space-y-4">
          {rules.map((category, index) => {
            const Icon = category.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-emerald-600 border-emerald-200 bg-emerald-50',
              blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
              orange: 'from-orange-500 to-orange-600 border-orange-200 bg-orange-50',
              red: 'from-red-500 to-red-600 border-red-200 bg-red-50'
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[category.color as keyof typeof colorClasses].split(' ')[1]} p-3`}>
                  <div className="flex items-center text-white">
                    <Icon className="h-4 w-4 mr-2" />
                    <h2 className="text-sm font-bold">{category.category}</h2>
                  </div>
                </div>
                <div className="p-3">
                  <ul className="space-y-2">
                    {category.items.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-3 flex-shrink-0 ${
                          category.color === 'emerald' ? 'bg-emerald-500' :
                          category.color === 'blue' ? 'bg-blue-500' :
                          category.color === 'orange' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></span>
                        <span className="text-gray-700 text-xs leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agreement Notice */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2 text-center">Agreement</h3>
          <p className="text-gray-700 text-center text-xs leading-relaxed">
            By playing Answer & Win, you agree to all rules above. 
            Breaking rules = disqualification. We can change rules anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;