# Google Analytics Setup

This project includes Google Analytics 4 (GA4) tracking for monitoring user behavior and conversions.

## Setup Instructions

### 1. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use an existing one
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Google Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 3. Update Analytics Configuration

In `src/utils/analytics.ts`, the Measurement ID is automatically read from the environment variable:

```typescript
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
```

You can also update the fallback value if needed.

## Tracked Events

The following events are automatically tracked:

### Page Views
- All page navigation is tracked automatically
- Custom page titles and paths are sent

### User Actions
- **Quiz Start**: When user begins the quiz
- **Quiz Completion**: When user completes the quiz successfully
- **Account View**: When user visits account page
- **Win Page View**: When user reaches win page
- **User Registration**: When new user account is created

### Social & Sharing
- **Share Action**: When user shares via WhatsApp
- **Referral Click**: When someone clicks a referral link

### Conversions
- **Withdrawal Request**: When user requests withdrawal (with amount)

## Custom Events

You can track custom events using the analytics utility:

```typescript
import { trackEvent } from '../utils/analytics';

// Track custom event
trackEvent('button_click', 'ui', 'header_menu', 1);
```

## Development vs Production

- Analytics only initializes in production by default
- To test in development, set `VITE_GA_MEASUREMENT_ID` in your `.env` file
- Analytics will initialize if the environment variable is present

## Privacy Considerations

- No personally identifiable information is tracked
- Only user actions and page views are recorded
- User IDs are anonymized
- Follow Google Analytics data retention policies

## Verification

After setup, you can verify tracking is working by:

1. Opening browser developer tools
2. Going to Network tab
3. Looking for requests to `google-analytics.com` or `googletagmanager.com`
4. Checking Google Analytics Real-time reports
