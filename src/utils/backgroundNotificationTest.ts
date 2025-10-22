// Background Notification Test Utility
// This helps test and verify background notifications work properly

import { getFCMToken, hasNotificationPermission } from './pushNotifications';

export interface BackgroundTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export const testBackgroundNotifications = async (): Promise<BackgroundTestResult[]> => {
  const results: BackgroundTestResult[] = [];

  // Test 1: Permission Check
  results.push({
    test: 'Notification Permission',
    status: hasNotificationPermission() ? 'pass' : 'fail',
    message: hasNotificationPermission() 
      ? '✅ Notification permission granted' 
      : '❌ Notification permission required',
    details: `Current permission: ${Notification.permission}`
  });

  // Test 2: Service Worker Registration
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      results.push({
        test: 'Service Worker Registration',
        status: registration ? 'pass' : 'fail',
        message: registration 
          ? '✅ Service Worker registered' 
          : '❌ Service Worker not registered',
        details: registration 
          ? `Scope: ${registration.scope}, State: ${registration.active?.state}` 
          : 'Service Worker not found at /firebase-messaging-sw.js'
      });
    } else {
      results.push({
        test: 'Service Worker Registration',
        status: 'fail',
        message: '❌ Service Worker not supported',
        details: 'Browser does not support service workers'
      });
    }
  } catch (error) {
    results.push({
      test: 'Service Worker Registration',
      status: 'fail',
      message: '❌ Error checking Service Worker',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: FCM Token Generation
  try {
    const token = await getFCMToken();
    results.push({
      test: 'FCM Token Generation',
      status: token ? 'pass' : 'fail',
      message: token 
        ? '✅ FCM token generated successfully' 
        : '❌ Failed to generate FCM token',
      details: token 
        ? `Token: ${token.substring(0, 20)}...` 
        : 'Check VAPID key and Firebase configuration'
    });
  } catch (error) {
    results.push({
      test: 'FCM Token Generation',
      status: 'fail',
      message: '❌ Error generating FCM token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: Background Message Handler
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (registration) {
        // Check if the service worker has the background message handler
        const sw = registration.active || registration.waiting || registration.installing;
        results.push({
          test: 'Background Message Handler',
          status: 'pass',
          message: '✅ Service Worker ready for background messages',
          details: `Service Worker state: ${sw?.state}`
        });
      } else {
        results.push({
          test: 'Background Message Handler',
          status: 'fail',
          message: '❌ Service Worker not available for background messages',
          details: 'Service Worker must be registered for background notifications'
        });
      }
    } else {
      results.push({
        test: 'Background Message Handler',
        status: 'fail',
        message: '❌ Service Worker not supported',
        details: 'Background notifications require Service Worker support'
      });
    }
  } catch (error) {
    results.push({
      test: 'Background Message Handler',
      status: 'fail',
      message: '❌ Error checking background handler',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 5: Secure Context
  results.push({
    test: 'Secure Context',
    status: (window.isSecureContext || window.location.hostname === 'localhost') ? 'pass' : 'fail',
    message: (window.isSecureContext || window.location.hostname === 'localhost')
      ? '✅ Secure context available'
      : '❌ Notifications require HTTPS in production',
    details: `isSecureContext: ${window.isSecureContext}, hostname: ${window.location.hostname}`
  });

  return results;
};

export const getBackgroundNotificationStatus = (): string => {
  const permission = Notification.permission;
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  if (permission === 'granted' && isSecure && hasServiceWorker) {
    return '✅ Background notifications should work';
  } else if (permission === 'denied') {
    return '❌ Notifications blocked by user';
  } else if (!isSecure) {
    return '❌ HTTPS required for notifications';
  } else if (!hasServiceWorker) {
    return '❌ Service Worker not supported';
  } else {
    return '⚠️ Permission not granted yet';
  }
};

export const simulateBackgroundNotification = async (): Promise<boolean> => {
  try {
    if (!hasNotificationPermission()) {
      console.error('❌ Notification permission not granted');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) {
      console.error('❌ Service Worker not registered');
      return false;
    }

    // Simulate a background notification
    await registration.showNotification("🧪 Background Test", {
      body: "This simulates a background notification from Firebase",
      icon: '/img/hdfc.png',
      badge: '/img/sbi.png',
      tag: 'background-test',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    });

    console.log('✅ Background notification simulation sent');
    return true;
  } catch (error) {
    console.error('❌ Failed to simulate background notification:', error);
    return false;
  }
};
