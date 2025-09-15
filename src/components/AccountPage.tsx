import React, { useMemo, useState } from 'react';
import { 
  Wallet, 
  Users, 
  Download, 
  Share2, 
  TrendingUp, 
  ExternalLink,
  Copy,
  Trophy,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Lock,
  CheckCircle,
  Activity,
  BarChart3,
  History,
  User,
  X
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
  
  const [hasTerabox, setHasTerabox] = useState(false);
  const [hasGoogleSignin, setHasGoogleSignin] = useState(false);
  const [showTeraboxModal, setShowTeraboxModal] = useState(false);
  const [isVerifyingTerabox, setIsVerifyingTerabox] = useState(false);
  const [teraboxVerifyStatus, setTeraboxVerifyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Demo user details (can be wired to real auth later)
  const userProfile = {
    name: 'user6565',
    memberSince: '',
    kycVerified: false,
    upiVerified: false,
    avatarBg: 'bg-gradient-to-br from-blue-500 to-emerald-500'
  };

  type TxStatus = 'Completed' | 'Pending' | 'Failed';
  interface TransactionItem {
    id: string;
    date: string; // ISO or readable
    description: string;
    type: 'Credit' | 'Debit';
    amount: number;
    status: TxStatus;
  }

  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit' | 'completed' | 'pending' | 'failed'>('all');
  const [transactions] = useState<TransactionItem[]>([
    { id: 'TXN-982341', date: '2025-09-12 10:24', description: 'Quiz Completion Prize', type: 'Credit', amount: 453, status: 'Completed' },
    { id: 'TXN-982112', date: '2025-09-12 09:18', description: 'Referral Bonus (2 joins)', type: 'Credit', amount: 600, status: 'Completed' },
    { id: 'TXN-981776', date: '2025-09-11 20:04', description: 'Withdrawal • UPI', type: 'Debit', amount: 800, status: 'Pending' },
    { id: 'TXN-981222', date: '2025-09-10 16:40', description: 'Link Clicks Earnings (40)', type: 'Credit', amount: 400, status: 'Completed' },
    { id: 'TXN-980901', date: '2025-09-09 13:22', description: 'Share Bonus', type: 'Credit', amount: 25, status: 'Completed' },
    { id: 'TXN-980455', date: '2025-09-08 18:11', description: 'Withdrawal • UPI', type: 'Debit', amount: 900, status: 'Failed' }
  ]);

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

  const totalCredits = useMemo(() => transactions.filter(t => t.type === 'Credit' && t.status !== 'Failed').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalDebits = useMemo(() => transactions.filter(t => t.type === 'Debit' && t.status !== 'Failed').reduce((s, t) => s + t.amount, 0), [transactions]);
  const pendingDebits = useMemo(() => transactions.filter(t => t.type === 'Debit' && t.status === 'Pending').reduce((s, t) => s + t.amount, 0), [transactions]);
  const completionRate = useMemo(() => {
    const clicks = userStats.linkClicks || 1;
    return Math.min(100, Math.round((userStats.referrals / clicks) * 100));
  }, [userStats]);

  const filteredTx = useMemo(() => {
    switch (txFilter) {
      case 'credit': return transactions.filter(t => t.type === 'Credit');
      case 'debit': return transactions.filter(t => t.type === 'Debit');
      case 'completed': return transactions.filter(t => t.status === 'Completed');
      case 'pending': return transactions.filter(t => t.status === 'Pending');
      case 'failed': return transactions.filter(t => t.status === 'Failed');
      default: return transactions;
    }
  }, [txFilter, transactions]);

  const withdrawProgress = Math.min(100, Math.round((userStats.totalEarnings / 800) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header - Profile + Trust */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-lg shadow-inner`}> 
              {userProfile.name ? (
                userProfile.name.split(' ').map(w => w[0]).slice(0,2).join('')
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">{userProfile.name || 'Your Account'}</h1>
                {userProfile.kycVerified && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {userProfile.memberSince && (
                  <div className="text-xs text-gray-500">Member since {userProfile.memberSince}</div>
                )}
                {!hasGoogleSignin && (
                  <button
                    onClick={() => setHasGoogleSignin(true)}
                    className="text-xs text-blue-700 underline underline-offset-2"
                  >
                    Link Google Account
                  </button>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                <Lock className="w-3.5 h-3.5" /> SSL Secured
              </span>
              {userProfile.upiVerified && (
                <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> UPI Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Account Balance + Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-0.5 mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-2xl px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Account Balance</h2>
            </div>
            <span className="text-[11px] text-gray-500">Updated just now</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {/* Left: Balance + Progress + Small history strip */}
              <div className="md:col-span-2">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">₹{userStats.totalEarnings}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Available balance</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                      <Lock className="w-3.5 h-3.5" /> Secure
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                    <span>Progress to minimum withdrawal (₹800)</span>
                    <span>{withdrawProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${withdrawProgress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-blue-500'}`} style={{ width: `${withdrawProgress}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="text-[12px] sm:text-[13px] border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full inline-flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>
                  <div className="text-[11px] text-gray-500">Payouts within 0–24 hours</div>
                </div>
              </div>
              {/* Right: Withdraw primary action */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-gray-100 rounded-xl p-3 md:p-4 flex flex-col gap-3">
                  <div className="text-xs text-gray-600">Ready to cash out?</div>
                  <button
                    onClick={() => setShowTeraboxModal(true)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:shadow-xl`}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Withdraw
                  </button>
                  <div className="text-[11px] text-gray-600">
                    Min ₹800 • Terabox verification required
                  </div>
                </div>
              </div>
            </div>
          </div>
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

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-600" />
              <div className="text-xs text-gray-500">Net Credits</div>
            </div>
            <div className="text-sm sm:text-base font-bold text-gray-900">₹{totalCredits}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-red-600" />
              <div className="text-xs text-gray-500">Total Withdrawn</div>
            </div>
            <div className="text-sm sm:text-base font-bold text-gray-900">₹{totalDebits}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div className="text-xs text-gray-500">Referral Conversion</div>
            </div>
            <div className="text-sm sm:text-base font-bold text-gray-900">{completionRate}%</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <div className="text-xs text-gray-500">Pending Withdrawal</div>
            </div>
            <div className="text-sm sm:text-base font-bold text-gray-900">₹{pendingDebits}</div>
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
            onClick={() => {
              if (!hasTerabox) {
                setShowTeraboxModal(true);
              } else if (canWithdraw) {
                console.log('Proceed to withdraw');
              }
            }}
            disabled={!hasTerabox && !canWithdraw ? false : !canWithdraw}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
              canWithdraw
                ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:shadow-xl transform hover:scale-105'
                : hasTerabox ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {hasTerabox ? (canWithdraw ? 'Withdraw Now' : `Need ₹${800 - userStats.totalEarnings} more`) : 'Verify Terabox to Withdraw'}
          </button>

          {/* Helper tips */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <div className="text-[11px] text-gray-500">Daily Limit</div>
              <div className="text-xs font-semibold text-gray-900">Up to ₹1,000/day</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <div className="text-[11px] text-gray-500">Next Payout Window</div>
              <div className="text-xs font-semibold text-gray-900">Today, 6pm–9pm</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <div className="text-[11px] text-gray-500">Processing Time</div>
              <div className="text-xs font-semibold text-gray-900">Instant to 24 hours</div>
            </div>
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

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Transaction History</h2>
            </div>
            <div className="flex items-center gap-1">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'credit', label: 'Credits' },
                  { key: 'debit', label: 'Debits' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'failed', label: 'Failed' }
                ] as const
              ).map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setTxFilter(btn.key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${txFilter === btn.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}
                  `}
                >
                  {btn.label}
                </button>
              ))}
              <button onClick={() => setShowHistoryModal(true)} className="ml-2 px-2.5 py-1 rounded-full text-[11px] border bg-white text-gray-700 border-gray-300">View All</button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTx.length === 0 && (
              <div className="text-center text-xs text-gray-500 py-6">No transactions to show.</div>
            )}
            {filteredTx.map(tx => {
              const isCredit = tx.type === 'Credit';
              const statusClasses = tx.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : tx.status === 'Pending'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';
              return (
                <div key={tx.id} className="py-3 flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isCredit ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {isCredit ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <CreditCard className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">{tx.description}</div>
                      <div className={`text-xs sm:text-sm font-bold ${isCredit ? 'text-emerald-700' : 'text-red-700'}`}>{isCredit ? '+' : '-'}₹{tx.amount}</div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[11px] text-gray-500">{tx.date} • {tx.id}</div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusClasses}`}>{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdraw Modal: Handles Terabox + Eligibility */}
        {showTeraboxModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Withdraw</h3>
                <button onClick={() => { setShowTeraboxModal(false); setTeraboxVerifyStatus('idle'); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {!hasTerabox && (
                  <>
                    <p className="text-sm text-gray-700">To withdraw, please install Terabox and verify installation. This helps us confirm you are a real user.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="https://www.1024terabox.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg font-semibold"
                      >
                        Download Terabox
                      </a>
                      <button
                        onClick={() => {
                          setIsVerifyingTerabox(true);
                          setTeraboxVerifyStatus('idle');
                          const before = Date.now();
                          const teraboxUrl = 'terabox://app';
                          const fallbackUrl = 'https://www.1024terabox.com/';
                          window.location.href = teraboxUrl;
                          const fallbackTimer = setTimeout(() => {
                            window.open(fallbackUrl, '_blank');
                          }, 1200);
                          const onFocus = () => {
                            const elapsed = Date.now() - before;
                            clearTimeout(fallbackTimer);
                            setIsVerifyingTerabox(false);
                            if (elapsed > 800) {
                              setTeraboxVerifyStatus('success');
                              setHasTerabox(true);
                            } else {
                              setTeraboxVerifyStatus('failed');
                            }
                            window.removeEventListener('focus', onFocus);
                          };
                          window.addEventListener('focus', onFocus);
                        }}
                        disabled={isVerifyingTerabox}
                        className={`w-full py-2.5 px-3 rounded-lg font-semibold border ${isVerifyingTerabox ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'}`}
                      >
                        {isVerifyingTerabox ? 'Verifying…' : 'Verify Installation'}
                      </button>
                    </div>
                    {teraboxVerifyStatus === 'success' && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm">✅ Terabox verified! You can withdraw now.</div>
                    )}
                    {teraboxVerifyStatus === 'failed' && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-sm">❌ Verification failed. Please install/open Terabox and try again.</div>
                    )}
                  </>
                )}

                {hasTerabox && !canWithdraw && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-amber-800 font-semibold mb-1">Insufficient Balance</div>
                    <div className="text-sm text-amber-700">Minimum ₹800 required to withdraw. You need ₹{800 - userStats.totalEarnings} more.</div>
                  </div>
                )}

                {hasTerabox && canWithdraw && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">You are eligible to withdraw your balance.</div>
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold">Confirm Withdraw</button>
                    <div className="text-[11px] text-gray-500 text-center">Payouts may take up to 24 hours.</div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowTeraboxModal(false)}
                    className="text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">All Transactions</h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                  {transactions.map(tx => {
                    const isCredit = tx.type === 'Credit';
                    const statusClasses = tx.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : tx.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';
                    return (
                      <div key={tx.id} className="py-3 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isCredit ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          {isCredit ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <CreditCard className="w-5 h-5 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900">{tx.description}</div>
                            <div className={`text-xs sm:text-sm font-bold ${isCredit ? 'text-emerald-700' : 'text-red-700'}`}>{isCredit ? '+' : '-'}₹{tx.amount}</div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-[11px] text-gray-500">{tx.date} • {tx.id}</div>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusClasses}`}>{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
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
        </div>

      </div>
    </div>
  );
};

export default AccountPage;