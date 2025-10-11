import React, { useMemo, useState, useEffect } from 'react';
import { 
  Wallet, 
  Users, 
  Share2, 
  TrendingUp, 
  Copy,
  Trophy,
  CreditCard,
  AlertCircle,
  Lock,
  CheckCircle,
  Activity,
  History,
  User,
  X,
  Link
} from 'lucide-react';
import { apiService, DOMAIN, User as ApiUser, Transaction } from '../services/api';

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
  const [showTeraboxModal, setShowTeraboxModal] = useState(false);
  const [isVerifyingTerabox, setIsVerifyingTerabox] = useState(false);
  const [teraboxVerifyStatus, setTeraboxVerifyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [unclaimedShares, setUnclaimedShares] = useState(0);
  const [showEmailPhoneModal, setShowEmailPhoneModal] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [upi, setUpi] = useState<string | null>(null);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Real user data from API
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [txFilter] = useState<'all' | 'credit' | 'debit' | 'completed' | 'pending' | 'failed'>('all');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.id) {
            const response = await apiService.getUser(userData.id);
            if (response.status === 'success' && response.data) {
              setCurrentUser(response.data.user);
              setTransactions(response.data.transactions);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // User profile data
  const userProfile = {
    name: currentUser?.name || `user${currentUser?.id || 'new'}`,
    memberSince: currentUser?.created_on ? new Date(currentUser.created_on).toLocaleDateString() : '',
    kycVerified: false,
    upiVerified: false,
    avatarBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
  };

  const referralLink = currentUser?.id ? `${DOMAIN}?by=${currentUser.id}` : `${DOMAIN}?by=new`;
  const canWithdraw = (currentUser?.balance || 0) >= 100 && hasTerabox && currentUser?.upi;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };


  const generateWhatsAppLink = () => {
    const userId = currentUser?.id || 'new';
    const referralUrl = `${DOMAIN}?by=${userId}`;
    const message = encodeURIComponent(
      `🎉 Amazing opportunity! Join me and earn money easily!\n\n${referralUrl}\n\nDon't miss out on this chance! 💰`
    );
    return `https://wa.me/?text=${message}`;
  };

  const handleShareClick = () => {
    // Open WhatsApp with the referral link
    const whatsappUrl = generateWhatsAppLink();
    window.open(whatsappUrl, '_blank');
    
    // Show banner and increment shares after sharing
    setShowShareBanner(true);
    setUnclaimedShares(prev => prev + 1);
  };

  const claimShareReward = async () => {
    if (!currentUser?.id || unclaimedShares <= 0) return;
    
    setIsClaimingReward(true);
    try {
      // Calculate new values - ensure they are numbers
      const currentShares = parseInt(String(currentUser.shares || 0), 10);
      const newShares = currentShares + unclaimedShares;
      
      // Make API call to update user shares with all unclaimed shares
      // Backend trigger will automatically create transaction:
      // - ₹2 per share (from after_user_shares_update trigger)
      const response = await apiService.updateUser(currentUser.id, {
        shares: newShares
      });
      
      if (response.status === 'success') {
        // Fetch updated user data to get the new balance calculated by backend
        const updatedUserResponse = await apiService.getUser(currentUser.id);
        
        if (updatedUserResponse.status === 'success' && updatedUserResponse.data) {
          // Update local state with fresh data from backend
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);
          
          // Hide banner and reset unclaimed shares after claiming
          setShowShareBanner(false);
          setUnclaimedShares(0);
        }
      } else {
        console.error('Failed to claim reward:', response.message);
        // You could show a toast notification here
      }
      
    } catch (error) {
      console.error('Failed to claim reward:', error);
      // You could show a toast notification here
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleUpdateContact = async () => {
    if (!currentUser?.id || (email === null && phone === null && name === null && upi === null)) return;
    
    setIsUpdatingContact(true);
    try {
      const updateData: any = {};
      if (email !== null) updateData.email = email;
      if (phone !== null) updateData.phone = phone;
      if (name !== null) updateData.name = name;
      if (upi !== null) updateData.upi = upi;
      
      const response = await apiService.updateUser(currentUser.id, updateData);
      
      if (response.status === 'success') {
        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser.id);
        
        if (updatedUserResponse.status === 'success' && updatedUserResponse.data) {
          setCurrentUser(updatedUserResponse.data.user);
          setShowEmailPhoneModal(false);
          setEmail(null);
          setPhone(null);
          setName(null);
          setUpi(null);
        }
      } else {
        console.error('Failed to update contact:', response.message);
        // You could show a toast notification here
      }
      
    } catch (error) {
      console.error('Failed to update contact:', error);
      // You could show a toast notification here
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!currentUser?.id || !canWithdraw) return;
    
    setIsProcessingWithdrawal(true);
    try {
      const response = await apiService.createWithdrawalRequest(currentUser.id, currentUser.balance);
      
      if (response.status === 'success') {
        // Fetch updated user data to get the new transaction
        const updatedUserResponse = await apiService.getUser(currentUser.id);
        
        if (updatedUserResponse.status === 'success' && updatedUserResponse.data) {
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);
          setWithdrawalSuccess(true);
          setShowTeraboxModal(false);
        }
      } else {
        console.error('Failed to process withdrawal:', response.message);
        // You could show a toast notification here
      }
      
    } catch (error) {
      console.error('Failed to process withdrawal:', error);
      // You could show a toast notification here
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const filteredTx = useMemo(() => {
    switch (txFilter) {
      case 'credit': return transactions.filter(t => t.type === 'credit');
      case 'debit': return transactions.filter(t => t.type === 'debit');
      default: return transactions;
    }
  }, [txFilter, transactions]);

  
  // Check if email/phone is linked
  const isContactLinked = currentUser?.email || currentUser?.phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-20">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">

        {/* Header - Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}>
                {userProfile.name ? (
                  userProfile.name.split(' ').map(w => w[0]).slice(0,2).join('')
                ) : (
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{userProfile.name || 'Your Account'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Secure
                  </span>
                </div>
              </div>
            </div>
            
            {/* Link Email/Phone Link */}
            <button 
              onClick={() => setShowEmailPhoneModal(true)}
              className={`inline-flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm transition-colors px-2 py-1.5 rounded-lg ${
                isContactLinked 
                  ? 'text-gray-500 hover:text-gray-600 hover:bg-gray-50' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {isContactLinked ? (
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{isContactLinked ? 'Update Account Info' : 'Link Email/Phone'}</span>
              <span className="sm:hidden">{isContactLinked ? 'Update' : 'Link'}</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-base sm:text-lg font-semibold">Total Balance</h2>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2 transition-all"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">₹{currentUser?.balance || 0}</div>
            <div className="text-white/80 text-xs sm:text-sm">Available to withdraw</div>
          </div>

          <button
            onClick={() => setShowTeraboxModal(true)}
            className="w-full bg-white text-blue-600 hover:bg-gray-50 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-lg hover:shadow-xl min-h-[48px]"
          >
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Withdraw Now
          </button>
          <div className="text-center text-white/70 text-xs mt-2 sm:mt-3">
            See Payment Proofs
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{currentUser?.shares || 0}</div>
            <div className="text-xs text-gray-500">Shares</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{currentUser?.clicks || 0}</div>
            <div className="text-xs text-gray-500">Clicks</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{userStats.referrals || 0}</div>
            <div className="text-xs text-gray-500">Users</div>
          </div>
        </div>



        {/* Referral Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">💰 Earning Opportunities</h2>
              <p className="text-xs text-gray-500">Multiple ways to earn - from ₹2 to ₹900!</p>
            </div>
          </div>

          {/* Earning Funnel */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {/* Level 1 - Highest - Withdrawal Bonus */}
            <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-white shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold">First Withdrawal Bonus</div>
                    <div className="text-xs text-gray-300">When they make First withdrawal</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-yellow-400">₹900</div>
                  <div className="text-xs text-gray-300">Once Per User</div>
                </div>
              </div>
            </div>

            {/* Level 2 - High - Invite Friends */}
            <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-white shadow-md border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold">Invite Friends</div>
                    <div className="text-xs text-gray-300">When they Visit Account Page</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-blue-400">₹300</div>
                  <div className="text-xs text-gray-300">per friend</div>
                </div>
              </div>
            </div>

            {/* Level 3 - Medium - Unique Clicks */}
            <div className="bg-gray-700 rounded-xl p-3 sm:p-4 text-white shadow-sm border border-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold">Unique Clicks</div>
                    <div className="text-xs text-gray-300">When they click your link</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-gray-300">₹10</div>
                  <div className="text-xs text-gray-300">per click</div>
                </div>
              </div>
            </div>

            {/* Level 4 - Lowest - Share on WhatsApp */}
            <div className="bg-gray-600 rounded-xl p-3 sm:p-4 text-white shadow-sm border border-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-200" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold">Share on WhatsApp</div>
                    <div className="text-xs text-gray-300">When you share your link</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-gray-200">₹2</div>
                  <div className="text-xs text-gray-300">per share</div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Reward Banner */}
          {showShareBanner && (
            <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mb-3 sm:mb-4 shadow-sm overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-400 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gray-500 rounded-full blur-xl"></div>
              </div>
              
              <div className="relative">
                {/* Mobile-first layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                  {/* Trophy Icon */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 flex-shrink-0">
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-lg" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">🎉 Share Rewards Ready!</h3>
                        <span className="px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-md">
                          NEW
                        </span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      You have <span className="font-bold text-gray-800">{unclaimedShares} unclaimed share{unclaimedShares > 1 ? 's' : ''}</span> waiting for you!
                    </p>
                    
                    {/* Value and Claim Button */}
                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
                      {/* Value Card */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-gray-200 flex-shrink-0 xs:flex-1">
                        <span className="text-xs text-gray-600 block mb-1">Total Value</span>
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">
                          ₹{unclaimedShares * 2}
                        </div>
                      </div>
                      
                      {/* Claim Button */}
                      <button
                        onClick={claimShareReward}
                        disabled={isClaimingReward}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95 min-h-[48px] xs:flex-1 ${
                          isClaimingReward
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isClaimingReward ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span>💰</span>
                            <span>Claim ₹{unclaimedShares * 2}</span>
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {/* Status Message */}
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Instant credit to your balance - no waiting!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col xs:flex-row gap-3 mb-4 sm:mb-6">
            {/* WhatsApp Share Button */}
            <div className="flex-1 relative">
              {/* Shining border animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-xl opacity-75 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl animate-pulse" style={{animationDuration: '2s'}}></div>
              
              <button
                onClick={handleShareClick}
                className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center min-h-[52px] border-2 border-blue-300 z-10 transform hover:scale-105"
              >
                <Share2 className="h-5 w-5 mr-2 drop-shadow-sm" />
                <span className="text-sm font-bold drop-shadow-sm">Share on WhatsApp</span>
              </button>
            </div>
            
            {/* Copy Link Button */}
            <button
              onClick={copyReferralLink}
              className={`xs:w-auto w-full py-4 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center min-h-[52px] ${
                linkCopied 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {linkCopied ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Recent Transactions</h2>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
            >
              View All
            </button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {isLoading ? (
              <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">Loading transactions...</div>
            ) : filteredTx.length === 0 ? (
              <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">No transactions yet</div>
            ) : (
              filteredTx.slice(0, 5).map(tx => {
                const isCredit = tx.type === 'credit';
                return (
                  <div key={tx.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${isCredit ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {isCredit ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> : <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{tx.note || 'Transaction'}</div>
                        <div className={`text-xs sm:text-sm font-bold whitespace-nowrap ${isCredit ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isCredit ? '+' : '-'}₹{typeof tx.amount === 'string' ? parseFloat(tx.amount).toFixed(2) : tx.amount}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="text-xs text-gray-500">{new Date(tx.created_on).toLocaleDateString()}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tx.note === 'Withdrawal Request' 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {tx.note === 'Withdrawal Request' ? 'In Process' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Withdraw Modal */}
        {showTeraboxModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Withdraw Earnings</h3>
                  <button
                    onClick={() => { setShowTeraboxModal(false); setTeraboxVerifyStatus('idle'); }}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">₹{currentUser?.balance || 0}</div>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                {!hasTerabox && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                        <div className="text-xs sm:text-sm text-blue-800">
                          To withdraw, verify Terabox installation. This helps us confirm you are a real user.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <a
                        href="https://www.1024terabox.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md transition-all min-h-[48px] flex items-center justify-center"
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
                        className={`w-full py-3 px-4 rounded-xl font-semibold border-2 transition-all min-h-[48px] ${
                          isVerifyingTerabox
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {isVerifyingTerabox ? 'Verifying...' : 'Verify Installation'}
                      </button>
                    </div>

                    {teraboxVerifyStatus === 'success' && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-medium">Terabox verified successfully!</span>
                      </div>
                    )}
                    {teraboxVerifyStatus === 'failed' && (
                      <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        <span className="text-xs sm:text-sm font-medium">Verification failed. Please install Terabox and try again.</span>
                      </div>
                    )}
                  </>
                )}

                {hasTerabox && !currentUser?.upi && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">UPI ID Required</div>
                        <div className="text-xs sm:text-sm text-amber-800">
                          Please add your UPI ID in account settings to enable withdrawals.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasTerabox && currentUser?.upi && !canWithdraw && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">Insufficient Balance</div>
                        <div className="text-xs sm:text-sm text-amber-800">
                          Minimum ₹100 required. You need ₹{100 - (currentUser?.balance || 0)} more.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasTerabox && canWithdraw && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5" />
                        <div className="text-xs sm:text-sm text-emerald-800">
                          You are eligible to withdraw your earnings. Payouts are processed within 24 hours.
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleWithdrawal}
                      disabled={isProcessingWithdrawal}
                      className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-bold shadow-md transition-all min-h-[48px] ${
                        isProcessingWithdrawal
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {isProcessingWithdrawal ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Success Message */}
        {withdrawalSuccess && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">✅ Withdrawal Request Submitted Successfully!</h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-2">Your withdrawal request has been processed and is now under review.</p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">💰 <span className="text-green-600">₹{currentUser?.balance || 0}</span> will be credited to your account by the <span className="font-semibold text-blue-600">5th day of the upcoming month</span>.</p>
                <p className="text-xs text-gray-500 mt-2">You'll receive a confirmation notification once the payment is processed.</p>
              </div>
              <button
                onClick={() => setWithdrawalSuccess(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Transaction History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">All Transactions</h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">No transactions yet</div>
                  ) : (
                    transactions.map(tx => {
                      const isCredit = tx.type === 'credit';
                      return (
                        <div key={tx.id} className="py-2 sm:py-3 flex items-center">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 ${isCredit ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {isCredit ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> : <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{tx.note || 'Transaction'}</div>
                              <div className={`text-xs sm:text-sm font-bold ${isCredit ? 'text-emerald-700' : 'text-red-700'}`}>{isCredit ? '+' : '-'}₹{typeof tx.amount === 'string' ? parseFloat(tx.amount).toFixed(2) : tx.amount}</div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-[10px] sm:text-[11px] text-gray-500">{new Date(tx.created_on).toLocaleString()} • TXN-{String(tx.id)}</div>
                              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                                tx.note === 'Withdrawal Request' 
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {tx.note === 'Withdrawal Request' ? 'In Process' : 'Completed'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email/Phone Update Modal */}
        {showEmailPhoneModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Update Account Info</h3>
                  <button
                    onClick={() => { 
                      setShowEmailPhoneModal(false); 
                      setEmail(''); 
                      setPhone(''); 
                      setName('');
                      setUpi('');
                    }}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <p className="text-white/90 text-xs sm:text-sm">Update your name, email, phone and UPI ID</p>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name !== null ? name : (currentUser?.name || '')}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email !== null ? email : (currentUser?.email || '')}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone !== null ? phone : (currentUser?.phone || '')}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upi !== null ? upi : (currentUser?.upi || '')}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="Enter your UPI ID (e.g., user@paytm)"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 pt-2">
                  <button
                    onClick={() => { 
                      setShowEmailPhoneModal(false); 
                      setEmail(null); 
                      setPhone(null); 
                      setName(null);
                      setUpi(null);
                    }}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateContact}
                    disabled={isUpdatingContact || (email === null && phone === null && name === null && upi === null)}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
                      isUpdatingContact || (email === null && phone === null && name === null && upi === null)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isUpdatingContact ? 'Updating...' : 'Update Contact'}
                  </button>
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