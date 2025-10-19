# Firebase Cloud Messaging Setup Guide

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing project
3. Follow the setup wizard

### Step 2: Add Web App
1. In Firebase Console, click "Add app" → Web (</>) icon
2. Register your app with a nickname (e.g., "AWin Web App")
3. Copy the Firebase configuration object

### Step 3: Enable Cloud Messaging
1. In Firebase Console, go to "Project Settings" → "Cloud Messaging"
2. Generate a Web Push certificate (VAPID key)
3. Copy the VAPID key

## 🔧 Configuration

### ✅ Firebase Config Updated
Your Firebase configuration has been updated in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAMSMbYqjhBVvyjMAlUHBfqehUcGp1Q9wI",
  authDomain: "awin-7b114.firebaseapp.com",
  projectId: "awin-7b114",
  storageBucket: "awin-7b114.firebasestorage.app",
  messagingSenderId: "381217101653",
  appId: "1:381217101653:web:8e0d51f31af24e348601dc",
  measurementId: "G-TFXVH36BSG"
};
```

### 🔑 Get Your VAPID Key
**IMPORTANT**: You still need to get your VAPID key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **awin-7b114**
3. Click ⚙️ **Project Settings**
4. Go to **Cloud Messaging** tab
5. Scroll to **Web Push certificates** section
6. Click **Generate key pair** (if you don't have one)
7. Copy the **public key** (starts with `BEl62iUYgUivxIkv69yViEuiBIa40HI...`)
8. Replace the placeholder in `src/config/firebase.ts`:

```typescript
export const VAPID_KEY = "YOUR_ACTUAL_VAPID_KEY_HERE";
```

### ✅ Service Worker Updated
The service worker in `public/firebase-messaging-sw.js` has been updated with your Firebase config.

## 🧪 Testing

### Development Testing
1. **Start your app**: `npm run dev`
2. **Open in browser**: Navigate to your app
3. **Click withdraw button**: Should request notification permission
4. **Grant permission**: You should see "Notifications On" badge
5. **Click Test button**: Should show a test notification

### Production Testing
1. **Build app**: `npm run build`
2. **Deploy to HTTPS**: FCM requires HTTPS in production
3. **Test notifications**: Use Firebase Console to send test messages

## 📱 Features Implemented

### ✅ What's Working:
- **Permission Request**: Automatic permission request on withdraw
- **FCM Token Generation**: Real Firebase tokens generated
- **Database Integration**: Tokens stored in your database
- **Foreground Notifications**: Notifications show when app is open
- **Background Notifications**: Service worker handles background messages
- **Test Notifications**: Manual test button in account page
- **Welcome Notifications**: Automatic welcome message on permission grant

### 🔄 How It Works:
1. **User clicks withdraw** → Permission request appears
2. **User grants permission** → FCM token generated and stored
3. **Welcome notification** → Immediate test notification sent
4. **Background ready** → Service worker handles future notifications
5. **Database updated** → Token stored for server-side notifications

## 🚀 Backend Integration

To send notifications from your backend, you'll need:

### PHP Example:
```php
function sendFCMNotification($token, $title, $body) {
    $serverKey = 'your-server-key'; // From Firebase Console
    
    $url = 'https://fcm.googleapis.com/fcm/send';
    
    $data = [
        'to' => $token,
        'notification' => [
            'title' => $title,
            'body' => $body,
            'icon' => '/favicon.ico'
        ]
    ];
    
    $headers = [
        'Authorization: key=' . $serverKey,
        'Content-Type: application/json'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

## ⚠️ Important Notes

- **HTTPS Required**: FCM only works on HTTPS in production
- **Service Worker**: Must be accessible at `/firebase-messaging-sw.js`
- **VAPID Key**: Required for web push notifications
- **Server Key**: Keep secret, use only on backend
- **Token Updates**: Tokens may change, handle token refresh

## 🔍 Troubleshooting

### Common Issues:
1. **Permission denied**: Check browser notification settings
2. **Token not generated**: Verify Firebase config and VAPID key
3. **Service worker not found**: Ensure file is in public directory
4. **HTTPS required**: Use HTTPS in production or localhost for testing

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase project settings
3. Test with Firebase Console notifications
4. Check service worker registration in DevTools
