// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics Measurement ID - Replace with your actual GA4 Measurement ID
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-LPN95FN4N0";

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track quiz completion
export const trackQuizCompletion = () => {
  trackEvent("quiz_completed", "engagement", "quiz", 1);
};

// Track quiz start
export const trackQuizStart = () => {
  trackEvent("quiz_started", "engagement", "quiz", 1);
};

// Track share action
export const trackShare = (method: string) => {
  trackEvent("share", "social", method, 1);
};

// Track withdrawal request
export const trackWithdrawalRequest = (amount: number) => {
  trackEvent("withdrawal_requested", "conversion", "withdrawal", amount);
};

// Track user registration
export const trackUserRegistration = () => {
  trackEvent("user_registered", "conversion", "registration", 1);
};

// Track referral click
export const trackReferralClick = (referrerId: string) => {
  trackEvent("referral_click", "social", referrerId, 1);
};

// Track account page view
export const trackAccountView = () => {
  trackEvent("account_viewed", "engagement", "account", 1);
};

// Track win page view
export const trackWinPageView = () => {
  trackEvent("win_page_viewed", "engagement", "win_page", 1);
};

// Enhanced quiz question tracking
export const trackQuestionAnswered = (questionNumber: number, isCorrect: boolean) => {
  trackEvent(`question_${questionNumber}_answered`, "quiz", `question_${questionNumber}`, isCorrect ? 1 : 0);
};

// Track win page withdraw button click
export const trackWinPageWithdrawClick = () => {
  trackEvent("winpage_withdraw_btn_click", "conversion", "withdraw", 1);
};

// Track expanded payment proofs
export const trackExpandedPaymentProofs = () => {
  trackEvent("expanded_payment_proofs", "engagement", "payment_proofs", 1);
};

// Unique user tracking events (count only unique users)
export const trackUniqueInviteClickOnWinPage = () => {
  const key = 'unique_invite_click_on_win_page';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_invite_click_on_win_page", "unique_user", "invite", 1);
  }
};

export const trackUniqueProceedFromWinPage = () => {
  const key = 'unique_proceed_from_win_page';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_proceed_from_win_page", "unique_user", "proceed", 1);
  }
};

export const trackUniqueAccountUpdateOpened = () => {
  const key = 'unique_account_update_opened';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_update_opened", "unique_user", "account", 1);
  }
};

export const trackUniqueAccountShare = () => {
  const key = 'unique_account_share';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_share", "unique_user", "share", 1);
  }
};

export const trackUniqueHamburgerExpanded = () => {
  const key = 'unique_hamburger_expanded';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_hamburger_expanded", "unique_user", "navigation", 1);
  }
};

export const trackUniqueViewedTransactionHistory = () => {
  const key = 'unique_viewed_transaction_history';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_viewed_transaction_history", "unique_user", "transactions", 1);
  }
};

export const trackUniqueAccountInviteLinkCopied = () => {
  const key = 'unique_account_invite_link_copied';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_invite_link_copied", "unique_user", "invite", 1);
  }
};

export const trackUniqueAccountWithdrawClick = () => {
  const key = 'unique_account_withdraw_click';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_withdraw_click", "unique_user", "withdraw", 1);
  }
};

export const trackUniqueAccountDownloadClick = () => {
  const key = 'unique_account_download_click';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_download_click", "unique_user", "download", 1);
  }
};

export const trackUniqueAccountCodeEntered = () => {
  const key = 'unique_account_code_entered';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_code_entered", "unique_user", "verification", 1);
  }
};

export const trackUniqueAccountCodeVerifyClick = () => {
  const key = 'unique_account_code_verify_click';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_code_verify_click", "unique_user", "verification", 1);
  }
};

export const trackUniqueAccountCodeVerified = () => {
  const key = 'unique_account_code_verified';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_code_verified", "unique_user", "verification", 1);
  }
};

export const trackUniqueAccountWithdrawSuccess = () => {
  const key = 'unique_account_withdraw_success';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'true');
    trackEvent("unique_account_withdraw_success", "unique_user", "withdraw", 1);
  }
};
