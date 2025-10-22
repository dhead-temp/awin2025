import React, { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  getFCMToken,
  hasNotificationPermission,
  sendTestNotification,
  sendWelcomeNotification,
  isPushNotificationSupported,
  initializeFCM,
  setupForegroundMessageListener,
  updateUserPushToken
} from '../utils/pushNotifications';
import { apiService } from '../services/api';
import { runNotificationDiagnostics, createTestNotification, getNotificationTroubleshootingTips } from '../utils/notificationDiagnostics';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const NotificationTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Check current permission status
    setPermissionStatus(Notification.permission);
  }, []);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    // Test 1: Browser Support Check
    addTestResult({
      name: 'Browser Support',
      status: 'pending',
      message: 'Checking browser support for push notifications...'
    });

    const isSupported = isPushNotificationSupported();
    addTestResult({
      name: 'Browser Support',
      status: isSupported ? 'success' : 'error',
      message: isSupported 
        ? '✅ Browser supports push notifications' 
        : '❌ Browser does not support push notifications',
      details: isSupported 
        ? 'Notification API, Service Worker, and PushManager are available'
        : 'Missing required APIs: Notification, ServiceWorker, or PushManager'
    });

    // Test 1.5: Secure Context Check
    addTestResult({
      name: 'Secure Context',
      status: 'pending',
      message: 'Checking secure context for notifications...'
    });

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    addTestResult({
      name: 'Secure Context',
      status: isSecure ? 'success' : 'error',
      message: isSecure 
        ? '✅ Secure context available' 
        : '❌ Notifications require HTTPS in production',
      details: isSecure 
        ? `Secure context: ${window.isSecureContext}, Hostname: ${window.location.hostname}`
        : 'Use HTTPS or localhost for notifications to work'
    });

    // Test 2: Service Worker Registration
    addTestResult({
      name: 'Service Worker',
      status: 'pending',
      message: 'Checking service worker registration...'
    });

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (registration) {
          addTestResult({
            name: 'Service Worker',
            status: 'success',
            message: '✅ Service worker is registered',
            details: `Scope: ${registration.scope}, State: ${registration.active?.state}`
          });
        } else {
          addTestResult({
            name: 'Service Worker',
            status: 'error',
            message: '❌ Service worker not found',
            details: 'Firebase messaging service worker is not registered'
          });
        }
      } else {
        addTestResult({
          name: 'Service Worker',
          status: 'error',
          message: '❌ Service Worker not supported',
          details: 'Browser does not support service workers'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Service Worker',
        status: 'error',
        message: '❌ Error checking service worker',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Permission Status
    addTestResult({
      name: 'Permission Status',
      status: 'pending',
      message: 'Checking notification permission...'
    });

    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);
    
    let permissionStatus: 'success' | 'error' | 'warning';
    let permissionMessage: string;
    
    switch (currentPermission) {
      case 'granted':
        permissionStatus = 'success';
        permissionMessage = '✅ Notification permission granted';
        break;
      case 'denied':
        permissionStatus = 'error';
        permissionMessage = '❌ Notification permission denied';
        break;
      case 'default':
        permissionStatus = 'warning';
        permissionMessage = '⚠️ Notification permission not requested yet';
        break;
    }

    addTestResult({
      name: 'Permission Status',
      status: permissionStatus,
      message: permissionMessage,
      details: `Current status: ${currentPermission}`
    });

    // Test 4: FCM Token Generation
    addTestResult({
      name: 'FCM Token',
      status: 'pending',
      message: 'Attempting to generate FCM token...'
    });

    try {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        addTestResult({
          name: 'FCM Token',
          status: 'success',
          message: '✅ FCM token generated successfully',
          details: `Token: ${token.substring(0, 20)}...`
        });
      } else {
        addTestResult({
          name: 'FCM Token',
          status: 'error',
          message: '❌ Failed to generate FCM token',
          details: 'Token generation returned null'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'FCM Token',
        status: 'error',
        message: '❌ Error generating FCM token',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Test Notification
    if (currentPermission === 'granted') {
      addTestResult({
        name: 'Test Notification',
        status: 'pending',
        message: 'Sending test notification...'
      });

      try {
        await sendTestNotification(currentUser?.id || 'test-user');
        addTestResult({
          name: 'Test Notification',
          status: 'success',
          message: '✅ Test notification sent successfully',
          details: 'Check your notification area for the test notification'
        });
      } catch (error) {
        addTestResult({
          name: 'Test Notification',
          status: 'error',
          message: '❌ Failed to send test notification',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      addTestResult({
        name: 'Test Notification',
        status: 'warning',
        message: '⚠️ Skipping test notification - permission not granted',
        details: 'Grant permission first to test notifications'
      });
    }

    // Test 6: API Integration (if user exists)
    if (currentUser?.id) {
      addTestResult({
        name: 'API Integration',
        status: 'pending',
        message: 'Testing API integration...'
      });

      try {
        const success = await updateUserPushToken(parseInt(currentUser.id));
        addTestResult({
          name: 'API Integration',
          status: success ? 'success' : 'error',
          message: success 
            ? '✅ FCM token updated in database' 
            : '❌ Failed to update FCM token in database',
          details: success 
            ? 'Token successfully stored for user' 
            : 'Check API endpoint and user authentication'
        });
      } catch (error) {
        addTestResult({
          name: 'API Integration',
          status: 'error',
          message: '❌ Error updating FCM token in database',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      addTestResult({
        name: 'API Integration',
        status: 'warning',
        message: '⚠️ Skipping API test - no user logged in',
        details: 'Create a user account first to test API integration'
      });
    }

    setIsRunningTests(false);
  };

  const requestPermission = async () => {
    addTestResult({
      name: 'Permission Request',
      status: 'pending',
      message: 'Requesting notification permission...'
    });

    try {
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      addTestResult({
        name: 'Permission Request',
        status: permission === 'granted' ? 'success' : 'error',
        message: permission === 'granted' 
          ? '✅ Permission granted successfully' 
          : '❌ Permission denied or dismissed',
        details: `Permission result: ${permission}`
      });

      if (permission === 'granted') {
        // Try to get FCM token after permission is granted
        try {
          const token = await getFCMToken();
          if (token) {
            setFcmToken(token);
            addTestResult({
              name: 'Auto Token Generation',
              status: 'success',
              message: '✅ FCM token generated after permission grant',
              details: `Token: ${token.substring(0, 20)}...`
            });
          }
        } catch (error) {
          addTestResult({
            name: 'Auto Token Generation',
            status: 'error',
            message: '❌ Failed to generate token after permission grant',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      addTestResult({
        name: 'Permission Request',
        status: 'error',
        message: '❌ Error requesting permission',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const sendManualTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      addTestResult({
        name: 'Manual Test',
        status: 'error',
        message: '❌ Permission not granted',
        details: 'Please grant notification permission first'
      });
      return;
    }

    addTestResult({
      name: 'Manual Test',
      status: 'pending',
      message: 'Sending manual test notification via Service Worker...'
    });

    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Notifications require HTTPS in production');
      }

      // Check if Service Worker is available
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      // Get the service worker registration
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        throw new Error('Service Worker not registered');
      }

      // Use Service Worker to show notification
      await registration.showNotification("💰 AWin Test Notification", {
        body: "This is a test notification from AWin!",
        icon: '/img/hdfc.png',
        badge: '/img/sbi.png',
        tag: 'awin-test',
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

      addTestResult({
        name: 'Manual Test',
        status: 'success',
        message: '✅ Manual test notification sent via Service Worker',
        details: 'Check your notification area'
      });
    } catch (error) {
      addTestResult({
        name: 'Manual Test',
        status: 'error',
        message: '❌ Failed to send manual test notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔔 Notification System Test</h1>
          <p className="text-gray-600 mb-6">
            This page helps diagnose issues with the push notification system. 
            Run tests to check browser support, permissions, FCM setup, and API integration.
          </p>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Permission Status</div>
                <div className={`font-semibold ${
                  permissionStatus === 'granted' ? 'text-green-600' : 
                  permissionStatus === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {permissionStatus === 'granted' ? '✅ Granted' : 
                   permissionStatus === 'denied' ? '❌ Denied' : '⚠️ Not Requested'}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">FCM Token</div>
                <div className={`font-semibold ${fcmToken ? 'text-green-600' : 'text-red-600'}`}>
                  {fcmToken ? '✅ Available' : '❌ Not Available'}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">User Status</div>
                <div className={`font-semibold ${currentUser ? 'text-green-600' : 'text-yellow-600'}`}>
                  {currentUser ? '✅ Logged In' : '⚠️ Not Logged In'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isRunningTests ? '⏳ Running Tests...' : '🧪 Run All Tests'}
            </button>
            
            <button
              onClick={async () => {
                addTestResult({
                  name: 'Quick Diagnostic',
                  status: 'pending',
                  message: 'Running quick diagnostic...'
                });

                const diagnostics = runNotificationDiagnostics();
                diagnostics.forEach(diag => {
                  addTestResult({
                    name: diag.test,
                    status: diag.status === 'pass' ? 'success' : diag.status === 'fail' ? 'error' : 'warning',
                    message: diag.message,
                    details: diag.details
                  });
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              🔍 Quick Diagnostic
            </button>
            
            <button
              onClick={requestPermission}
              disabled={permissionStatus === 'granted'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {permissionStatus === 'granted' ? '✅ Permission Granted' : '🔔 Request Permission'}
            </button>
            
            <button
              onClick={sendManualTestNotification}
              disabled={permissionStatus !== 'granted'}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              📤 Send Test Notification
            </button>
            
            <button
              onClick={async () => {
                addTestResult({
                  name: 'Constructor Test',
                  status: 'pending',
                  message: 'Testing Notification constructor...'
                });

                try {
                  const success = await createTestNotification();
                  addTestResult({
                    name: 'Constructor Test',
                    status: success ? 'success' : 'error',
                    message: success 
                      ? '✅ Notification constructor works' 
                      : '❌ Notification constructor failed',
                    details: success 
                      ? 'Constructor is accessible and working' 
                      : 'Check secure context and browser support'
                  });
                } catch (error) {
                  addTestResult({
                    name: 'Constructor Test',
                    status: 'error',
                    message: '❌ Constructor test failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                  });
                }
              }}
              disabled={permissionStatus !== 'granted'}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              🔧 Test Constructor
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700">Test Results</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getStatusIcon(result.status)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${getStatusColor(result.status)}`}>
                            {result.name}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.status === 'success' ? 'bg-green-100 text-green-800' :
                            result.status === 'error' ? 'bg-red-100 text-red-800' :
                            result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-1">{result.message}</p>
                        {result.details && (
                          <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Troubleshooting Tips</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              {getNotificationTroubleshootingTips().map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestPage;
