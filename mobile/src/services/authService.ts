/**
 * Authentication Service
 * Handles Google, Apple, and Email/Password authentication
 */

import * as SecureStore from 'expo-secure-store';
import { authApi, apiClient } from '../utils/api';
import { useAppStore } from '../store/useAppStore';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
  error?: string;
}

class AuthService {
  /**
   * Email/Password Login
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await authApi.login(email, password);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user && response.data?.accessToken) {
        await this.saveAuthData(response.data.accessToken, response.data.user);
        useAppStore.getState().setUser(response.data.user);
        return { success: true, user: response.data.user, token: response.data.accessToken };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  /**
   * Email/Password Registration
   */
  async registerWithEmail(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const response = await authApi.register(email, password, name);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user && response.data?.accessToken) {
        await this.saveAuthData(response.data.accessToken, response.data.user);
        useAppStore.getState().setUser(response.data.user);
        return { success: true, user: response.data.user, token: response.data.accessToken };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  /**
   * Google Sign In
   * Note: Requires proper OAuth setup in app.json
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // For MVP, we'll use a simplified approach
      // In production, use expo-auth-session with Google OAuth
      // This is a placeholder that can be enhanced
      return { success: false, error: 'Google Sign In requires OAuth configuration' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Google sign in failed' };
    }
  }

  /**
   * Apple Sign In
   * Note: Requires Apple Developer account setup
   */
  async signInWithApple(): Promise<AuthResult> {
    try {
      // For MVP, we'll use a simplified approach
      // In production, use expo-apple-authentication
      // This is a placeholder that can be enhanced
      return { success: false, error: 'Apple Sign In requires Apple Developer setup' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Apple sign in failed' };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // Call backend logout if needed
        // await apiClient.post('/auth/logout');
      }
      
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      apiClient.setToken(null);
      useAppStore.getState().setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userData) {
        apiClient.setToken(token);
        const user = JSON.parse(userData);
        useAppStore.getState().setUser(user);
        
        // Verify token is still valid
        const response = await authApi.getMe();
        if (response.error) {
          await this.logout();
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  /**
   * Save authentication data securely
   */
  private async saveAuthData(token: string, user: any): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    apiClient.setToken(token);
  }

  /**
   * Get current token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
