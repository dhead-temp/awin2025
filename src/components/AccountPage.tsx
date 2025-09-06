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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 text-xs sm:text-sm px-4">Track your earnings and grow your income</p>
        </div>

        {/* Earnings Overview */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl text-white p-4 mb-4 shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-2xl sm:text-3xl font-bold mb-1">₹{userStats.totalEarnings}</div>
            <p className="text-emerald-100 text-xs sm:text-sm">Total Earnings</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm sm:text-base font-bold">{userStats.referrals}</div>
              <p className="text-blue-100 text-xs">Referrals</p>
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold">{userStats.linkClicks}</div>
              <p className="text-blue-100 text-xs">Link Clicks</p>
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold">{userStats.shares}</div>
              <p className="text-blue-100 text-xs">Shares</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-emerald-600" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Withdraw Earnings</h2>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              canWithdraw ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {canWithdraw ? 'Available' : 'Requirements Pending'}
            </div>
          </div>

          {!canWithdraw && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1 text-xs sm:text-sm">Withdrawal Requirements</h3>
                  <ul className="text-orange-700 text-xs space-y-1">
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
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
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
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 px-4 sm:px-0">Ways to Earn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg mb-2">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">{method.title}</h3>
                  <p className="text-emerald-600 font-bold text-xs sm:text-sm mb-1">{method.earning}</p>
                  <p className="text-gray-500 text-xs">{method.bonus || method.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Invite Friends & Earn</h2>
          <p className="text-gray-600 mb-3 text-xs sm:text-sm leading-relaxed">Share your referral link and earn money for every action:</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm sm:text-base font-bold text-emerald-600">₹300</div>
              <div className="text-xs text-gray-600">Per Join</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm sm:text-base font-bold text-blue-600">₹10</div>
              <div className="text-xs text-gray-600">Per Click</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm sm:text-base font-bold text-purple-600">₹1</div>
              <div className="text-xs text-gray-600">Per Share</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <p className="text-xs text-gray-600 mb-1">Your Referral Link</p>
                <p className="text-gray-900 font-mono text-xs break-all">{referralLink}</p>
              </div>
              <button
                onClick={copyReferralLink}
                className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-all"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center text-xs sm:text-sm"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share on WhatsApp
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </button>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          {!hasGoogleSignin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 text-sm">Sign in with Google</h3>
                  <p className="text-blue-700 text-xs">Save your progress and secure your account</p>
                </div>
                <button 
                  onClick={() => setHasGoogleSignin(true)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all text-xs"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {!hasTerabox && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-900 text-sm">Download Terabox</h3>
                  <p className="text-orange-700 text-xs">Required for withdrawal eligibility</p>
                </div>
                <button 
                  onClick={() => setHasTerabox(true)}
                  className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-all flex items-center text-xs"
                >
                  <Download className="h-3 w-3 mr-1.5" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Withdraw Earnings</h3>
              <p className="text-gray-600 mb-4 text-xs sm:text-sm">Enter your UPI ID to receive ₹{userStats.totalEarnings}</p>
              
              <input
                type="text"
                placeholder="Enter UPI ID (e.g., user@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-xs">
                  <strong>Important:</strong> Your money will be transferred to your UPI account within 45 days after verification. No suspicious activity should be detected during this period.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdrawal(false)}
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle withdrawal submission
                    setShowWithdrawal(false);
                  }}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg hover:shadow-xl transition-all text-xs sm:text-sm"
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