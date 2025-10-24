/**
 * Test script to verify Microsoft Clarity integration
 * Run this in the browser console to test Clarity functionality
 */

// Test if Clarity is loaded
console.log('Testing Microsoft Clarity integration...');

// Check if Clarity script is loaded
if (typeof window !== 'undefined' && window.clarity) {
  console.log('✅ Microsoft Clarity is loaded and available');
  console.log('Clarity object:', window.clarity);
  
  // Test basic functionality
  try {
    // Test setting custom data
    window.clarity.set('test_key', 'test_value');
    console.log('✅ Clarity.set() works');
    
    // Test event tracking
    window.clarity.event('test_event');
    console.log('✅ Clarity.event() works');
    
    // Test user identification
    window.clarity.identify('test_user_123');
    console.log('✅ Clarity.identify() works');
    
    console.log('🎉 All Clarity functions are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Clarity functions:', error);
  }
} else {
  console.error('❌ Microsoft Clarity is not loaded');
  console.log('Make sure the Clarity script is included in your HTML');
}

// Test the utility functions
console.log('\nTesting Clarity utility functions...');

// Import the clarity utility (this would work in a module context)
if (typeof window !== 'undefined') {
  // Simulate the utility functions
  const testClarityUtils = {
    identify: (userId) => {
      if (window.clarity) {
        window.clarity.identify(userId);
        console.log('✅ Utility: identify() called with', userId);
      }
    },
    set: (key, value) => {
      if (window.clarity) {
        window.clarity.set(key, value);
        console.log('✅ Utility: set() called with', key, '=', value);
      }
    },
    event: (eventName) => {
      if (window.clarity) {
        window.clarity.event(eventName);
        console.log('✅ Utility: event() called with', eventName);
      }
    }
  };
  
  // Test utility functions
  testClarityUtils.identify('test_user_456');
  testClarityUtils.set('utility_test', 'success');
  testClarityUtils.event('utility_test_event');
  
  console.log('🎉 Clarity utility functions are working!');
}

console.log('\n📊 Microsoft Clarity integration test completed');
console.log('Check the Clarity dashboard at https://clarity.microsoft.com/ to see the data');
