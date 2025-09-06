import React, { useState } from 'react';
import { 
  Wallet, 
  Users, 
  Download, 
  Share2, 
  TrendingUp, 
  ExternalLink,
  Copy,
  ChevronRight,
  Trophy,
  Target,
  Gift,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface AccountPageProps {
  userStats: {
    totalEarnings: number;
    referrals: number;
    linkClicks: number;
    shares: number;
  };
}

const AccountPage: React.FC<AccountPageProps> = ({ userStats }) => {
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [hasTerabox, setHasTerabox] = useState(false);
  const [hasGoogleSignin, setHasGoogleSignin] = useState(false);

  const referralLink = 'https://answerwin.com/ref/user123';
  const canWithdraw = userStats.totalEarnings >= 800 && hasTerabox;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    // Could show a toast here
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`🎉 Join AnswerWin and start earning money by answering simple questions! I've already earned ₹${userStats.totalEarnings}! Use my link: ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const earningMethods = [
    { icon: Users, title: 'Invite Friends', earning: '₹300 per join', bonus: '₹10 per click, ₹1 per share' },
    { icon: Download, title: 'Download Terabox', earning: 'Required for withdrawal', status: hasTerabox ? 'Completed' : 'Pending' },
    { icon: Trophy, title: 'Answer Questions', earning: '₹453 + Scratch Cards', bonus: 'Play daily for more' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 text-sm md:text-base px-4">Track your earnings and grow your income</p>
        </div>

        {/* Earnings Overview */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl text-white p-4 md:p-6 mb-6 shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-3xl md:text-4xl font-bold mb-2">₹{userStats.totalEarnings}</div>
            <p className="text-emerald-100 text-sm md:text-base">Total Earnings</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg md:text-xl font-bold">{userStats.referrals}</div>
              <p className="text-blue-100 text-xs md:text-sm">Referrals</p>
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold">{userStats.linkClicks}</div>
              <p className="text-blue-100 text-xs md:text-sm">Link Clicks</p>
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold">{userStats.shares}</div>
              <p className="text-blue-100 text-xs md:text-sm">Shares</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-emerald-600" />
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Withdraw Earnings</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              canWithdraw ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {canWithdraw ? 'Available' : 'Requirements Pending'}
            </div>
          </div>

          {!canWithdraw && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1 text-sm md:text-base">Withdrawal Requirements</h3>
                  <ul className="text-orange-700 text-sm space-y-1">
                    {userStats.totalEarnings < 800 && (
                      <li>• Minimum balance: ₹800 (Current: ₹{userStats.totalEarnings})</li>
                    )}
                    {!hasTerabox && <li>• Download Terabox app</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowWithdrawal(true)}
            disabled={!canWithdraw}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center ${
              canWithdraw
                ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {canWithdraw ? 'Withdraw Now' : `Need ₹${800 - userStats.totalEarnings} more`}
          </button>
        </div>

        {/* Earning Methods */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 px-4 md:px-0">Ways to Earn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-3 md:p-4 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl mb-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{method.title}</h3>
                  <p className="text-emerald-600 font-bold text-sm md:text-base mb-1">{method.earning}</p>
                  <p className="text-gray-500 text-sm">{method.bonus || method.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Invite Friends & Earn</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">Share your referral link and earn money for every action:</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-white rounded-xl p-4">
              <div className="text-lg md:text-xl font-bold text-emerald-600">₹300</div>
              <div className="text-sm text-gray-600">Per Join</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-lg md:text-xl font-bold text-blue-600">₹10</div>
              <div className="text-sm text-gray-600">Per Click</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-lg md:text-xl font-bold text-purple-600">₹1</div>
              <div className="text-sm text-gray-600">Per Share</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className="text-sm text-gray-600 mb-1">Your Referral Link</p>
                <p className="text-gray-900 font-mono text-xs md:text-sm break-all">{referralLink}</p>
              </div>
              <button
                onClick={copyReferralLink}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-all"
              >
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 md:py-4 px-6 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center text-sm md:text-base"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share on WhatsApp
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          {!hasGoogleSignin && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Sign in with Google</h3>
                  <p className="text-blue-700 text-sm">Save your progress and secure your account</p>
                </div>
                <button 
                  onClick={() => setHasGoogleSignin(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {!hasTerabox && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-900">Download Terabox</h3>
                  <p className="text-orange-700 text-sm">Required for withdrawal eligibility</p>
                </div>
                <button 
                  onClick={() => setHasTerabox(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Withdraw Earnings</h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">Enter your UPI ID to receive ₹{userStats.totalEarnings}</p>
              
              <input
                type="text"
                placeholder="Enter UPI ID (e.g., user@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Your money will be transferred to your UPI account within 45 days after verification. No suspicious activity should be detected during this period.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdrawal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle withdrawal submission
                    setShowWithdrawal(false);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all text-sm md:text-base"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;