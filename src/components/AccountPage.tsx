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

        {/* Header - Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
              {userProfile.name ? (
                userProfile.name.split(' ').map(w => w[0]).slice(0,2).join('')
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{userProfile.name || 'Your Account'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
                <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" /> Secure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Total Balance</h2>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2 transition-all"
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>

          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">₹{userStats.totalEarnings}</div>
            <div className="text-white/80 text-sm">Available to withdraw</div>
          </div>

          

          <button
            onClick={() => setShowTeraboxModal(true)}
            className="w-full bg-white text-emerald-600 hover:bg-gray-50 py-3.5 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Withdraw Now
          </button>
          <div className="text-center text-white/70 text-xs mt-3">
See Payment Proofs
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.referrals}</div>
            <div className="text-xs text-gray-500">Referrals</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.linkClicks}</div>
            <div className="text-xs text-gray-500">Clicks</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <Share2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.shares}</div>
            <div className="text-xs text-gray-500">Shares</div>
          </div>
        </div>



        {/* Referral Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Invite Friends & Earn</h2>
              <p className="text-xs text-gray-500">Earn ₹300 per friend + ₹10 per click</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Your Referral Link</span>
              <button
                onClick={copyReferralLink}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-gray-900 font-mono text-xs break-all">{referralLink}</p>
            </div>
          </div>

          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share on WhatsApp
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700" />
              <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {filteredTx.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">No transactions yet</div>
            )}
            {filteredTx.slice(0, 5).map(tx => {
              const isCredit = tx.type === 'Credit';
              const statusClasses = tx.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700'
                : tx.status === 'Pending'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700';
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCredit ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {isCredit ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <CreditCard className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-gray-900 truncate">{tx.description}</div>
                      <div className={`text-sm font-bold whitespace-nowrap ${isCredit ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-xs text-gray-500">{tx.date.split(' ')[0]}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusClasses} font-medium`}>{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdraw Modal */}
        {showTeraboxModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Withdraw Earnings</h3>
                  <button
                    onClick={() => { setShowTeraboxModal(false); setTeraboxVerifyStatus('idle'); }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-3xl font-bold text-white">₹{userStats.totalEarnings}</div>
              </div>

              <div className="p-5 space-y-4">
                {!hasTerabox && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          To withdraw, verify Terabox installation. This helps us confirm you are a real user.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        href="https://www.1024terabox.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md transition-all"
                      >
                        Download Terabox App
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
                        className={`w-full py-3 px-4 rounded-xl font-semibold border-2 transition-all ${
                          isVerifyingTerabox
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {isVerifyingTerabox ? 'Verifying...' : 'Verify Installation'}
                      </button>
                    </div>

                    {teraboxVerifyStatus === 'success' && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">Terabox verified successfully!</span>
                      </div>
                    )}
                    {teraboxVerifyStatus === 'failed' && (
                      <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium">Verification failed. Please install Terabox and try again.</span>
                      </div>
                    )}
                  </>
                )}

                {hasTerabox && !canWithdraw && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="text-amber-900 font-semibold mb-1">Insufficient Balance</div>
                        <div className="text-sm text-amber-800">
                          Minimum ₹800 required. You need ₹{800 - userStats.totalEarnings} more.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasTerabox && canWithdraw && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div className="text-sm text-emerald-800">
                          You are eligible to withdraw your earnings. Payouts are processed within 24 hours.
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                      Confirm Withdrawal
                    </button>
                  </div>
                )}
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

      </div>
    </div>
  );
};

export default AccountPage;