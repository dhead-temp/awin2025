// Notification System Diagnostics
// This utility helps diagnose notification issues

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export const runNotificationDiagnostics = (): DiagnosticResult[] => {
  const results: DiagnosticResult[] = [];

  // Test 1: Basic API Support
  results.push({
    test: 'Notification API',
    status: typeof Notification !== 'undefined' ? 'pass' : 'fail',
    message: typeof Notification !== 'undefined' 
      ? 'Notification API is available' 
      : 'Notification API is not supported',
    details: typeof Notification !== 'undefined' 
      ? 'Constructor available' 
      : 'Browser does not support notifications'
  });

  // Test 2: Secure Context
  results.push({
    test: 'Secure Context',
    status: (window.isSecureContext || window.location.hostname === 'localhost') ? 'pass' : 'fail',
    message: (window.isSecureContext || window.location.hostname === 'localhost')
      ? 'Secure context available'
      : 'Not in secure context - notifications require HTTPS',
    details: `isSecureContext: ${window.isSecureContext}, hostname: ${window.location.hostname}`
  });

  // Test 3: Service Worker Support
  results.push({
    test: 'Service Worker Support',
    status: 'serviceWorker' in navigator ? 'pass' : 'fail',
    message: 'serviceWorker' in navigator 
      ? 'Service Worker API available' 
      : 'Service Worker API not supported',
    details: 'serviceWorker' in navigator 
      ? 'Service workers can be registered' 
      : 'Required for background notifications'
  });

  // Test 4: Push Manager Support
  results.push({
    test: 'Push Manager Support',
    status: 'PushManager' in window ? 'pass' : 'fail',
    message: 'PushManager' in window 
      ? 'Push Manager API available' 
      : 'Push Manager API not supported',
    details: 'PushManager' in window 
      ? 'Can handle push subscriptions' 
      : 'Required for FCM push notifications'
  });

  // Test 5: Current Permission Status
  const permission = Notification.permission;
  results.push({
    test: 'Permission Status',
    status: permission === 'granted' ? 'pass' : permission === 'denied' ? 'fail' : 'warning',
    message: permission === 'granted' 
      ? 'Notification permission granted' 
      : permission === 'denied' 
        ? 'Notification permission denied' 
        : 'Notification permission not requested',
    details: `Current permission: ${permission}`
  });

  // Test 6: Try to construct Notification (if permission granted)
  if (permission === 'granted') {
    try {
      // Don't actually create the notification, just test the constructor
      const NotificationConstructor = Notification;
      results.push({
        test: 'Notification Constructor',
        status: 'pass',
        message: 'Notification constructor is available',
        details: 'Can create notification objects'
      });
    } catch (error) {
      results.push({
        test: 'Notification Constructor',
        status: 'fail',
        message: 'Failed to access Notification constructor',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.push({
      test: 'Notification Constructor',
      status: 'warning',
      message: 'Cannot test constructor without permission',
      details: 'Grant permission first to test constructor'
    });
  }

  return results;
};

export const getNotificationTroubleshootingTips = (): string[] => {
  return [
    '🔧 Make sure you\'re using HTTPS (required for notifications)',
    '🔧 Check browser notification settings in chrome://settings/content/notifications',
    '🔧 Try refreshing the page and granting permission again',
    '🔧 Some browsers block notifications in private/incognito mode',
    '🔧 Ensure the service worker is accessible at /firebase-messaging-sw.js',
    '🔧 Check browser console for detailed error messages',
    '🔧 Verify Firebase configuration and VAPID key are correct',
    '🔧 Test with a different browser to isolate browser-specific issues'
  ];
};

export const createTestNotification = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (Notification.permission !== 'granted') {
        console.error('❌ Notification permission not granted');
        resolve(false);
        return;
      }

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        console.error('❌ Not in secure context');
        resolve(false);
        return;
      }

      const notification = new Notification("🧪 AWin Test", {
        body: "This is a test notification",
        icon: '/img/hdfc.png',
        tag: 'awin-test'
      });

      notification.onclick = () => {
        notification.close();
        resolve(true);
      };

      notification.onerror = () => {
        console.error('❌ Notification error occurred');
        resolve(false);
      };

      // Auto-resolve after 5 seconds if no error
      setTimeout(() => {
        notification.close();
        resolve(true);
      }, 5000);

    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      resolve(false);
    }
  });
};
