import React from "react";
import { User, CheckCircle, Link, Wallet, History, CreditCard } from "lucide-react";
import { User as ApiUser } from "../services/api";
import { trackUniqueAccountUpdateOpened, trackUniqueViewedTransactionHistory } from "../utils/analytics";

interface UserProfileProps {
  currentUser: ApiUser | null;
  isContactLinked: boolean;
  onOpenEmailPhoneModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenWithdrawModal: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  isContactLinked,
  onOpenEmailPhoneModal,
  onOpenHistoryModal,
  onOpenWithdrawModal,
}) => {
  const userProfile = {
    name: currentUser?.name || `user${currentUser?.id || "new"}`,
    memberSince: currentUser?.created_on
      ? new Date(currentUser.created_on).toLocaleDateString()
      : "",
    kycVerified: false,
    upiVerified: false,
    avatarBg: "bg-gradient-to-br from-blue-500 to-blue-600",
  };

  return (
    <>
      {/* Header - Profile */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}
            >
              {userProfile.name ? (
                userProfile.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
              ) : (
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                {userProfile.name || "Your Account"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
               
              </div>
            </div>
          </div>

          {/* Link Email/Phone Link */}
          <button
            onClick={() => {
              trackUniqueAccountUpdateOpened();
              onOpenEmailPhoneModal();
            }}
            className={`inline-flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm transition-colors px-2 py-1.5 rounded-lg ${
              isContactLinked
                ? "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            {isContactLinked ? (
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">
              {isContactLinked ? "Update Account Info" : "Link Email/Phone"}
            </span>
            <span className="sm:hidden">
              {isContactLinked ? "Update" : "Link"}
            </span>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-base sm:text-lg font-semibold">
              Total Balance
            </h2>
          </div>
          <button
            onClick={() => {
              trackUniqueViewedTransactionHistory();
              onOpenHistoryModal();
            }}
            className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2 transition-all"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
            ₹
            {typeof currentUser?.balance === "string"
              ? parseFloat(currentUser.balance).toFixed(2)
              : (currentUser?.balance || 0).toFixed(2)}
          </div>
          <div className="text-white/80 text-xs sm:text-sm">
            Available to withdraw
          </div>
        </div>

        <button
          onClick={onOpenWithdrawModal}
          className="w-full bg-white text-blue-600 hover:bg-gray-50 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-lg hover:shadow-xl min-h-[48px]"
        >
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Withdraw Now
        </button>
        <div className="text-center text-white/70 text-xs mt-2 sm:mt-3">
          Withdraw to Bank Account Using UPI ID
        </div>
      </div>
    </>
  );
};

export default UserProfile;
