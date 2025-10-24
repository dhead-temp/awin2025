/**
 * Microsoft Clarity utility functions
 * Provides programmatic access to Clarity tracking features
 */

// Extend the Window interface to include Clarity
declare global {
  interface Window {
    clarity: {
      (action: string, ...args: any[]): void;
      identify: (userId: string) => void;
      set: (key: string, value: string) => void;
      event: (eventName: string) => void;
      consent: (consent: boolean) => void;
    };
  }
}

/**
 * Microsoft Clarity utility class
 */
export class ClarityService {
  private static instance: ClarityService;
  private isInitialized = false;

  private constructor() {
    this.checkInitialization();
  }

  /**
   * Get singleton instance of ClarityService
   */
  public static getInstance(): ClarityService {
    if (!ClarityService.instance) {
      ClarityService.instance = new ClarityService();
    }
    return ClarityService.instance;
  }

  /**
   * Check if Clarity is loaded and ready
   */
  private checkInitialization(): void {
    if (typeof window !== 'undefined' && window.clarity) {
      this.isInitialized = true;
    } else {
      // Retry after a short delay if Clarity isn't loaded yet
      setTimeout(() => this.checkInitialization(), 100);
    }
  }

  /**
   * Wait for Clarity to be ready
   */
  private async waitForClarity(): Promise<void> {
    return new Promise((resolve) => {
      const checkClarity = () => {
        if (typeof window !== 'undefined' && window.clarity) {
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(checkClarity, 100);
        }
      };
      checkClarity();
    });
  }

  /**
   * Identify a user in Clarity
   * @param userId - Unique identifier for the user
   */
  public async identify(userId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForClarity();
    }
    
    if (typeof window !== 'undefined' && window.clarity) {
      try {
        window.clarity.identify(userId);
        console.log('Clarity: User identified as', userId);
      } catch (error) {
        console.error('Clarity: Failed to identify user', error);
      }
    }
  }

  /**
   * Set custom data for the current session
   * @param key - Custom data key
   * @param value - Custom data value
   */
  public async set(key: string, value: string): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForClarity();
    }
    
    if (typeof window !== 'undefined' && window.clarity) {
      try {
        window.clarity.set(key, value);
        console.log(`Clarity: Set ${key} = ${value}`);
      } catch (error) {
        console.error('Clarity: Failed to set custom data', error);
      }
    }
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   */
  public async event(eventName: string): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForClarity();
    }
    
    if (typeof window !== 'undefined' && window.clarity) {
      try {
        window.clarity.event(eventName);
        console.log('Clarity: Event tracked:', eventName);
      } catch (error) {
        console.error('Clarity: Failed to track event', error);
      }
    }
  }

  /**
   * Set user consent for data collection
   * @param consent - Whether user has consented to data collection
   */
  public async consent(consent: boolean): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForClarity();
    }
    
    if (typeof window !== 'undefined' && window.clarity) {
      try {
        window.clarity.consent(consent);
        console.log('Clarity: Consent set to', consent);
      } catch (error) {
        console.error('Clarity: Failed to set consent', error);
      }
    }
  }

  /**
   * Track page view (automatically handled by Clarity, but can be used for custom tracking)
   * @param pageName - Optional custom page name
   */
  public async pageView(pageName?: string): Promise<void> {
    if (pageName) {
      await this.set('page', pageName);
    }
    // Clarity automatically tracks page views, but we can add custom data
  }

  /**
   * Track user actions with custom events
   * @param action - The action performed
   * @param details - Optional details about the action
   */
  public async trackAction(action: string, details?: string): Promise<void> {
    await this.event(`action_${action}`);
    if (details) {
      await this.set(`action_${action}_details`, details);
    }
  }

  /**
   * Track quiz completion
   * @param score - Quiz score
   * @param timeSpent - Time spent on quiz
   */
  public async trackQuizCompletion(score: number, timeSpent?: number): Promise<void> {
    await this.event('quiz_completed');
    await this.set('quiz_score', score.toString());
    if (timeSpent) {
      await this.set('quiz_time_spent', timeSpent.toString());
    }
  }

  /**
   * Track referral actions
   * @param action - Type of referral action (click, share, etc.)
   * @param inviteCode - The invite code used
   */
  public async trackReferral(action: string, inviteCode?: string): Promise<void> {
    await this.event(`referral_${action}`);
    if (inviteCode) {
      await this.set('referral_code', inviteCode);
    }
  }

  /**
   * Track earnings and rewards
   * @param amount - Amount earned
   * @param source - Source of earnings (quiz, referral, etc.)
   */
  public async trackEarnings(amount: number, source: string): Promise<void> {
    await this.event('earnings_received');
    await this.set('earnings_amount', amount.toString());
    await this.set('earnings_source', source);
  }
}

// Export singleton instance
export const clarityService = ClarityService.getInstance();

// Export convenience functions
export const clarity = {
  identify: (userId: string) => clarityService.identify(userId),
  set: (key: string, value: string) => clarityService.set(key, value),
  event: (eventName: string) => clarityService.event(eventName),
  consent: (consent: boolean) => clarityService.consent(consent),
  pageView: (pageName?: string) => clarityService.pageView(pageName),
  trackAction: (action: string, details?: string) => clarityService.trackAction(action, details),
  trackQuizCompletion: (score: number, timeSpent?: number) => clarityService.trackQuizCompletion(score, timeSpent),
  trackReferral: (action: string, inviteCode?: string) => clarityService.trackReferral(action, inviteCode),
  trackEarnings: (amount: number, source: string) => clarityService.trackEarnings(amount, source),
};
