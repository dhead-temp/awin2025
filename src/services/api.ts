// API Configuration
const API_BASE_URL = 'https://be7.in/winapi.php';

// Domain configuration - easy to change
export const DOMAIN = 'https://be6.in/a2';

// API Response Types
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface User {
  id: number;
  token: string;
  name?: string;
  email?: string;
  phone?: string;
  upi?: string;
  shares: number;
  clicks: number;
  is_terabox_done: boolean;
  is_quiz_reward_claimed: string;
  quiz_withdraw: boolean;
  invited_by?: string;
  created_on: string;
  balance: number;
}

interface Transaction {
  id: string | number;
  amount: string | number;
  type: 'credit' | 'debit';
  note?: string;
  created_on: string;
}

interface UserWithTransactions {
  user: User;
  transactions: Transaction[];
}

// Global request cache to prevent duplicate API calls across components
const requestCache = new Map<string, Promise<any>>();

// API Service Class
class ApiService {
  private async makeRequest<T>(
    action: string,
    method: 'GET' | 'POST' = 'GET',
    data?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(API_BASE_URL);
      url.searchParams.set('action', action);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && data) {
        // For POST requests, send data as form data to match PHP backend
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          // Ensure numeric fields are sent as numbers, not strings
          if (key === 'shares' || key === 'clicks' || key === 'balance') {
            formData.append(key, String(Number(value)));
          } else {
            formData.append(key, String(value));
          }
        });
        options.body = formData;
        // Remove Content-Type header to let browser set it with boundary
        delete (options.headers as any)['Content-Type'];
      }

      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Create a new user
  async createUser(referralCode?: string): Promise<ApiResponse<{ user_id: number; token: string; ip: string }>> {
    const url = new URL(API_BASE_URL);
    url.searchParams.set('action', 'create_user');
    if (referralCode) {
      url.searchParams.set('ref', referralCode);
    }
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create user request failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  // Update user data
  async updateUser(userId: number, updates: Partial<User>): Promise<ApiResponse> {
    console.log('API: updateUser called', { userId, updates });
    const data = { user_id: userId, ...updates };
    return this.makeRequest('update_user', 'POST', data);
  }

  // Get user details with transactions
  async getUser(userId: number): Promise<ApiResponse<UserWithTransactions>> {
    console.log('API: getUser called', { userId });
    
    // Create a unique cache key for this request
    const cacheKey = `getUser_${userId}`;
    
    // Check if this request is already in progress
    if (requestCache.has(cacheKey)) {
      console.log('API: getUser request already in progress, returning cached promise', { userId });
      return requestCache.get(cacheKey)!;
    }
    
    // Create the request promise
    const requestPromise = (async () => {
      const url = new URL(API_BASE_URL);
      url.searchParams.set('action', 'get_user');
      url.searchParams.set('user_id', userId.toString());
      
      try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('API request failed:', error);
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      } finally {
        // Remove from cache when done (success or error)
        requestCache.delete(cacheKey);
      }
    })();
    
    // Store the promise in cache
    requestCache.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Increment click count for invite code using got_click endpoint
  async incrementClickCount(inviteCode: string): Promise<ApiResponse> {
    // First validate the invite code (which is the user's ID)
    const userId = parseInt(inviteCode);
    if (isNaN(userId)) {
      return { status: 'error', message: 'Invalid invite code' };
    }

    // Use the got_click endpoint directly for better performance
    const url = new URL(API_BASE_URL);
    url.searchParams.set('action', 'got_click');
    url.searchParams.set('id', userId.toString());
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Click increment request failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to increment click count',
      };
    }
  }

  // Update quiz reward claimed status and shares
  async updateQuizRewardStatus(userId: number, shares: number): Promise<ApiResponse> {
    console.log('API: updateQuizRewardStatus called', { userId, shares });
    return this.updateUser(userId, {
      is_quiz_reward_claimed: '1',
      shares: shares
    });
  }

  // Update quiz withdraw status
  async updateQuizWithdrawStatus(userId: number, quizWithdraw: boolean): Promise<ApiResponse> {
    return this.updateUser(userId, {
      quiz_withdraw: quizWithdraw
    });
  }

  // Create withdrawal request
  async createWithdrawalRequest(userId: number, amount: number): Promise<ApiResponse<{ transaction_id: number; amount: number; type: string; note: string }>> {
    const data = { user_id: userId, amount: amount };
    return this.makeRequest('withdraw_request', 'POST', data);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { User, Transaction, UserWithTransactions, ApiResponse };
