import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMSMbYqjhBVvyjMAlUHBfqehUcGp1Q9wI",
  authDomain: "awin-7b114.firebaseapp.com",
  projectId: "awin-7b114",
  storageBucket: "awin-7b114.firebasestorage.app",
  messagingSenderId: "381217101653",
  appId: "1:381217101653:web:8e0d51f31af24e348601dc",
  measurementId: "G-TFXVH36BSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

// Export Firebase app instance
export default app;

// VAPID key for web push notifications
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Replace the placeholder below with your actual VAPID key
export const VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa40HI..."; // Replace with your actual VAPID key
