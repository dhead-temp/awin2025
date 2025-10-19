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
    
    // Show notification when app is in foreground
    if (payload.notification) {
      const notification = new Notification(payload.notification.title || 'AWin Notification', {
        body: payload.notification.body,
        icon: '/img/sbi.png', // Use bank icon
        badge: '/img/hdfc.png', // Use bank icon for badge
        tag: 'awin-notification',
        requireInteraction: true
      });
      
      // Handle notification click to open the app with UTM parameter
      notification.onclick = () => {
        window.open('https://be6.in/a2?utm_source=push', '_blank');
        notification.close();
      };
    }
  });
};

// Check if user has granted notification permission
export const hasNotificationPermission = (): boolean => {
  return Notification.permission === 'granted';
};

// Send welcome notification when permission is first granted
export const sendWelcomeNotification = async (userId: string): Promise<void> => {
  if (hasNotificationPermission()) {
    const notification = new Notification("🎉 Welcome to AWin!", {
      body: "You'll receive updates about your earnings and withdrawals!",
      icon: '/img/icici.png', // Use bank icon
      badge: '/img/axis.png', // Use bank icon for badge
      tag: 'awin-welcome',
      requireInteraction: true
    });
    
    // Handle notification click to open the app
    notification.onclick = () => {
      window.open('https://be6.in/a2?utm_source=push', '_blank');
      notification.close();
    };
    
    console.log('Welcome notification sent for user:', userId);
  }
};

// Send test notification (for debugging and manual testing)
export const sendTestNotification = async (userId: string): Promise<void> => {
  if (hasNotificationPermission()) {
    // Show immediate browser notification with bank icon and click action
    const notification = new Notification("💰 AWin Earnings Update", {
      body: "Check your latest earnings and withdrawal status!",
      icon: '/img/hdfc.png', // Use bank icon
      badge: '/img/sbi.png', // Use bank icon for badge
      tag: 'awin-earnings',
      requireInteraction: true
    });
    
    // Handle notification click to open the app with UTM parameter
    notification.onclick = () => {
      window.open('https://be6.in/a2?utm_source=push', '_blank');
      notification.close();
    };
    
    console.log('Test notification sent for user:', userId);
  }
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
