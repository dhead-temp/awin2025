// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics Measurement ID - Replace with your actual GA4 Measurement ID
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual ID

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track quiz completion
export const trackQuizCompletion = () => {
  trackEvent('quiz_completed', 'engagement', 'quiz', 1);
};

// Track quiz start
export const trackQuizStart = () => {
  trackEvent('quiz_started', 'engagement', 'quiz', 1);
};

// Track share action
export const trackShare = (method: string) => {
  trackEvent('share', 'social', method, 1);
};

// Track withdrawal request
export const trackWithdrawalRequest = (amount: number) => {
  trackEvent('withdrawal_requested', 'conversion', 'withdrawal', amount);
};

// Track user registration
export const trackUserRegistration = () => {
  trackEvent('user_registered', 'conversion', 'registration', 1);
};

// Track referral click
export const trackReferralClick = (referrerId: string) => {
  trackEvent('referral_click', 'social', referrerId, 1);
};

// Track account page view
export const trackAccountView = () => {
  trackEvent('account_viewed', 'engagement', 'account', 1);
};

// Track win page view
export const trackWinPageView = () => {
  trackEvent('win_page_viewed', 'engagement', 'win_page', 1);
};
