import { UserProfileData } from '../types/profile';
import { getStoredProfile } from '../mock/profileData';

export interface SignOutResult {
  success: boolean;
  backendConfigured: boolean;
  message: string;
  error?: string;
}

export interface AuthService {
  getCurrentUser: () => UserProfileData | null;
  isAuthenticated: () => boolean;
  isBackendConfigured: () => boolean;
  signOut: () => Promise<SignOutResult>;
  setSessionActive: (active: boolean) => void;
}

let isSessionActive = true;

/**
 * Authentication service implementation.
 * Clearly reports that Supabase backend authentication is not configured in this repository,
 * while managing client session state so logout reliably transitions out of authenticated screens.
 */
class AuthServiceImpl implements AuthService {
  getCurrentUser(): UserProfileData | null {
    if (!isSessionActive) {
      return null;
    }
    return getStoredProfile();
  }

  isAuthenticated(): boolean {
    return isSessionActive;
  }

  isBackendConfigured(): boolean {
    // Supabase client/keys are not yet configured in this project
    return false;
  }

  setSessionActive(active: boolean): void {
    isSessionActive = active;
  }

  async signOut(): Promise<SignOutResult> {
    try {
      // Simulate real auth network latency for realistic loading state
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Clear local authentication state
      isSessionActive = false;

      const backendConfigured = this.isBackendConfigured();

      return {
        success: true,
        backendConfigured,
        message: backendConfigured
          ? 'Successfully signed out of backend session.'
          : 'Backend authentication (Supabase) is not yet configured. Local session cleared successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        backendConfigured: false,
        message: 'Sign out failed due to an unexpected error.',
        error: err?.message || 'Unknown error during sign-out',
      };
    }
  }
}

export const authService = new AuthServiceImpl();
