// Chrome Notification Debug Component
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ChromeDebugProps {
  onClose: () => void;
}

const ChromeNotificationDebug: React.FC<ChromeDebugProps> = ({ onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isChecking, setIsChecking] = useState(false);

  const checkChromeCompatibility = async () => {
    setIsChecking(true);
    const info: any = {};

    // Check browser support
    info.browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other';
    info.notificationSupport = 'Notification' in window;
    info.serviceWorkerSupport = 'serviceWorker' in navigator;
    info.pushManagerSupport = 'PushManager' in window;
    
    // Check current permission
    info.currentPermission = Notification.permission;
    
    // Check service worker registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        info.serviceWorkerRegistered = !!registration;
        info.serviceWorkerState = registration?.active?.state || 'not found';
      } catch (error) {
        info.serviceWorkerError = error.message;
      }
    }
    
    // Check if running on HTTPS or localhost
    info.isSecureContext = window.isSecureContext;
    info.protocol = window.location.protocol;
    info.hostname = window.location.hostname;
    
    // Check Firebase config
    info.firebaseConfigPresent = !!window.firebase;
    
    setDebugInfo(info);
    setIsChecking(false);
  };

  useEffect(() => {
    checkChromeCompatibility();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Chrome Notification Debug
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Browser Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Browser Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Browser:</span>
                  <span className="font-mono">{debugInfo.browser}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Protocol:</span>
                  <span className="font-mono">{debugInfo.protocol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hostname:</span>
                  <span className="font-mono">{debugInfo.hostname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure Context:</span>
                  {getStatusIcon(debugInfo.isSecureContext)}
                </div>
              </div>
            </div>

            {/* Feature Support */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Feature Support
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Notification API:</span>
                  {getStatusIcon(debugInfo.notificationSupport)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Worker:</span>
                  {getStatusIcon(debugInfo.serviceWorkerSupport)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Manager:</span>
                  {getStatusIcon(debugInfo.pushManagerSupport)}
                </div>
              </div>
            </div>

            {/* Permission Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Permission Status
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span>Current Permission:</span>
                <div className="flex items-center gap-2">
                  {getPermissionIcon(debugInfo.currentPermission)}
                  <span className="font-mono">{debugInfo.currentPermission}</span>
                </div>
              </div>
            </div>

            {/* Service Worker Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Service Worker Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Registered:</span>
                  {getStatusIcon(debugInfo.serviceWorkerRegistered)}
                </div>
                <div className="flex items-center justify-between">
                  <span>State:</span>
                  <span className="font-mono">{debugInfo.serviceWorkerState}</span>
                </div>
                {debugInfo.serviceWorkerError && (
                  <div className="text-red-600 text-xs">
                    Error: {debugInfo.serviceWorkerError}
                  </div>
                )}
              </div>
            </div>

            {/* Common Chrome Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Common Chrome Issues:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Make sure you're using HTTPS or localhost</li>
                <li>• Check Chrome notification settings (chrome://settings/content/notifications)</li>
                <li>• Ensure VAPID key is configured in Firebase Console</li>
                <li>• Try refreshing the page after granting permission</li>
                <li>• Check if notifications are blocked for this site</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={checkChromeCompatibility}
                disabled={isChecking}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isChecking ? 'Checking...' : 'Refresh Check'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                  alert('Debug info copied to clipboard!');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Copy Debug Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChromeNotificationDebug;
