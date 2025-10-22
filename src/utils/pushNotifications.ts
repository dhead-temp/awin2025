// Firebase Cloud Messaging Push Notification Utilities
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, VAPID_KEY } from '../config/firebase';
import { apiService } from '../services/api';

// Check if push notifications are supported
export const isPushNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushNotificationSupported()) {
    console.warn('❌ Push notifications are not supported in this browser');
    return 'denied';
  }

  console.log('🔔 Requesting notification permission...');
  console.log('Current permission:', Notification.permission);

  try {
    const permission = await Notification.requestPermission();
    console.log('📱 Notification permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted!');
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied by user');
    } else {
      console.log('⏸️ Notification permission dismissed by user');
    }
    
    return permission;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return 'denied';
  }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Check if VAPID key is properly configured
    if (VAPID_KEY === "BEl62iUYgUivxIkv69yViEuiBIa40HI..." || !VAPID_KEY) {
      console.error('❌ VAPID key not configured! Please get your VAPID key from Firebase Console');
      return null;
    }

    console.log('🔑 Attempting to get FCM token with VAPID key...');
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });
    
    if (token) {
      console.log('✅ FCM Token generated successfully:', token);
      return token;
    } else {
      console.log('❌ No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving FCM token:', error);
    console.error('Error details:', error);
    return null;
  }
};

// Update FCM token for user
export const updateUserPushToken = async (userId: number): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      console.error('Failed to get FCM token');
      return false;
    }
    
    const response = await apiService.updatePushNotificationToken(userId, token);
    
    if (response.status === 'success') {
      console.log('FCM token updated successfully');
      localStorage.setItem('fcmToken', token);
      return true;
    } else {
      console.error('Failed to update FCM token:', response.message);
      return false;
    }
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return false;
  }
};

// Handle push notification permission request
export const handlePushNotificationPermission = async (userId: number): Promise<boolean> => {
  try {
    // Request permission
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      // Update FCM token in database
      const success = await updateUserPushToken(userId);
      
      if (success) {
        // Set up message listener for foreground notifications
        setupForegroundMessageListener();
        
        // Send welcome notification
        await sendWelcomeNotification(userId.toString());
      }
      
      return success;
    } else {
      console.log('Notification permission denied or dismissed');
      return false;
    }
  } catch (error) {
    console.error('Error handling push notification permission:', error);
    return false;
  }
};

// Set up foreground message listener
export const setupForegroundMessageListener = (): void => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    
    // Show notification when app is in foreground using Service Worker
    if (payload.notification) {
      sendNotification(
        payload.notification.title || 'AWin Notification',
        payload.notification.body || 'You have a new notification',
        {
          icon: '/img/sbi.png',
          badge: '/img/hdfc.png',
          tag: 'awin-notification'
        }
      ).catch(error => {
        console.error('Failed to show foreground notification:', error);
      });
    }
  });
};

// Check if user has granted notification permission
export const hasNotificationPermission = (): boolean => {
  return Notification.permission === 'granted';
};

// Helper function to send notifications using Service Worker
export const sendNotification = async (
  title: string,
  body: string,
  options: {
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string }>;
  } = {}
): Promise<boolean> => {
  try {
    // Check permission
    if (!hasNotificationPermission()) {
      console.warn('❌ Notification permission not granted');
      return false;
    }

    // Check if Service Worker is available
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return false;
    }

    // Get the service worker registration
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) {
      console.error('❌ Service Worker not registered');
      return false;
    }

    // Use Service Worker to show notification
    await registration.showNotification(title, {
      body,
      icon: options.icon || '/img/hdfc.png',
      badge: options.badge || '/img/sbi.png',
      tag: options.tag || 'awin-notification',
      requireInteraction: options.requireInteraction || true,
      actions: options.actions || [
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

    console.log('✅ Notification sent successfully:', title);
    return true;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return false;
  }
};

// Send welcome notification when permission is first granted
export const sendWelcomeNotification = async (userId: string): Promise<void> => {
  await sendNotification(
    "🎉 Welcome to AWin!",
    "You'll receive updates about your earnings and withdrawals!",
    {
      icon: '/img/icici.png',
      badge: '/img/axis.png',
      tag: 'awin-welcome'
    }
  );
};

// Send test notification (for debugging and manual testing)
export const sendTestNotification = async (userId: string): Promise<void> => {
  await sendNotification(
    "💰 AWin Earnings Update",
    "Check your latest earnings and withdrawal status!",
    {
      icon: '/img/hdfc.png',
      badge: '/img/sbi.png',
      tag: 'awin-earnings'
    }
  );
};

// Send earnings notification
export const sendEarningsNotification = async (amount: number): Promise<void> => {
  await sendNotification(
    "💰 New Earnings!",
    `You've earned ₹${amount}! Check your account for details.`,
    {
      icon: '/img/hdfc.png',
      badge: '/img/sbi.png',
      tag: 'awin-earnings'
    }
  );
};

// Send withdrawal notification
export const sendWithdrawalNotification = async (amount: number): Promise<void> => {
  await sendNotification(
    "💳 Withdrawal Request",
    `Your withdrawal request of ₹${amount} has been submitted successfully!`,
    {
      icon: '/img/icici.png',
      badge: '/img/axis.png',
      tag: 'awin-withdrawal'
    }
  );
};

// Send referral notification
export const sendReferralNotification = async (referralName: string): Promise<void> => {
  await sendNotification(
    "👥 New Referral!",
    `${referralName} joined using your referral link! You both earn rewards.`,
    {
      icon: '/img/sbi.png',
      badge: '/img/hdfc.png',
      tag: 'awin-referral'
    }
  );
};

// Send quiz completion notification
export const sendQuizCompletionNotification = async (earnings: number): Promise<void> => {
  await sendNotification(
    "🎉 Quiz Completed!",
    `Congratulations! You earned ₹${earnings} by completing the quiz.`,
    {
      icon: '/img/axis.png',
      badge: '/img/icici.png',
      tag: 'awin-quiz'
    }
  );
};

// Initialize FCM (call this when app starts)
export const initializeFCM = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Firebase Cloud Messaging...');
    
    // Check service worker registration
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (registration) {
        console.log('✅ Service worker registered:', registration);
      } else {
        console.log('⚠️ Service worker not found, registering...');
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service worker registered successfully');
        } catch (error) {
          console.error('❌ Failed to register service worker:', error);
        }
      }
    }
    
    // Check if we already have permission
    if (hasNotificationPermission()) {
      console.log('✅ Notification permission already granted');
      
      // Set up foreground message listener
      setupForegroundMessageListener();
      
      // Try to get existing token
      const token = await getFCMToken();
      if (token) {
        console.log('✅ FCM initialized with existing token');
      }
    } else {
      console.log('⏸️ Notification permission not granted yet');
    }
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
  }
};
