import React from "react";
import { Share2, Activity, Users, CheckCircle, Copy } from "lucide-react";
import { User as ApiUser } from "../services/api";
import StatsCard from "./StatsCard";
import { trackShare, trackUniqueAccountShare } from "../utils/analytics";

interface StatsSectionProps {
  currentUser: ApiUser | null;
  copySuccess: boolean;
  onCopyReferralLink: () => void;
  onShowShareBanner: () => void;
  onSetUnclaimedShares: (fn: (prev: number) => number) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  currentUser,
  copySuccess,
  onCopyReferralLink,
  onShowShareBanner,
  onSetUnclaimedShares,
}) => {
  const generateWhatsAppLink = () => {
    const referralLink = currentUser?.id 
      ? `${window.location.origin}?by=${currentUser.id}`
      : `${window.location.origin}?by=new`;
    const message = `🎉 Join AWIN and start earning money! 💰\n\nComplete a simple quiz to earn ₹453 + get ₹300 for each friend you refer!\n\nNo limits on referrals - invite as many friends as you want!\n\nSign up here: ${referralLink}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <StatsCard
        title="Shares"
        value={currentUser?.shares || 0}
        subtitle="Earn ₹2 on Every Share"
        subtitleValue={`Earned ₹${(currentUser?.shares || 0) * 2}`}
        actionButton={
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.open(generateWhatsAppLink(), "_blank");
                trackShare("whatsapp");
                trackUniqueAccountShare();
                onShowShareBanner();
                onSetUnclaimedShares((prev) => prev + 1);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="h-3 w-3" />
              Share Now
            </button>
            <button
              onClick={onCopyReferralLink}
              className={`py-2 px-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                copySuccess
                  ? "bg-green-100 text-green-600 scale-110"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 hover:scale-105"
              }`}
              title={copySuccess ? "Copied!" : "Copy referral link"}
            >
              {copySuccess ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        }
        icon={Share2}
        color="blue"
      />
      <StatsCard
        title="Clicks"
        value={currentUser?.clicks || 0}
        subtitle="Earn ₹10 per click"
        subtitleValue={`Earned ₹${(currentUser?.clicks || 0) * 10}`}
        description="Every time someone clicks your link, you earn ₹10."
        icon={Activity}
        color="green"
      />
      <StatsCard
        title="Referrals"
        value={currentUser?.invited_to || 0}
        subtitle="Earn ₹300 per referral"
        subtitleValue={`Earned ₹${(currentUser?.invited_to || 0) * 300}`}
        description="When someone signs up using your link, you both earn ₹300."
        icon={Users}
        color="purple"
      />
    </div>
  );
};

export default StatsSection;
