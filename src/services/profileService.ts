import {
  UserProfileData,
  UpdateProfilePayload,
  ProfileValidationErrors,
  UpdateProfileResult,
} from '../types/profile';
import { getStoredProfile, updateStoredProfile } from '../mock/profileData';

export interface ProfileService {
  getProfile: () => UserProfileData;
  isBackendConfigured: () => boolean;
  validateProfile: (payload: UpdateProfilePayload) => ProfileValidationErrors;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UpdateProfileResult>;
}

export function validateProfileInput(payload: UpdateProfilePayload): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  const trimmedFirst = (payload.firstName || '').trim();
  const trimmedLast = (payload.lastName || '').trim();
  const trimmedUser = (payload.username || '').trim();

  // 1. First Name validation
  if (!trimmedFirst) {
    errors.firstName = 'First name is required.';
  } else if (trimmedFirst.length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (trimmedFirst.length > 50) {
    errors.firstName = 'First name cannot exceed 50 characters.';
  }

  // 2. Last Name validation
  if (!trimmedLast) {
    errors.lastName = 'Last name is required.';
  } else if (trimmedLast.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  } else if (trimmedLast.length > 50) {
    errors.lastName = 'Last name cannot exceed 50 characters.';
  }

  // 3. Username validation
  if (!trimmedUser) {
    errors.username = 'Username is required.';
  } else if (trimmedUser.length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  } else if (trimmedUser.length > 30) {
    errors.username = 'Username cannot exceed 30 characters.';
  } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUser)) {
    errors.username = 'Username can only contain letters, numbers, and underscores.';
  }

  return errors;
}

class ProfileServiceImpl implements ProfileService {
  getProfile(): UserProfileData {
    return getStoredProfile();
  }

  isBackendConfigured(): boolean {
    // Supabase database / profile table is not yet configured in this project
    return false;
  }

  validateProfile(payload: UpdateProfilePayload): ProfileValidationErrors {
    return validateProfileInput(payload);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResult> {
    const errors = this.validateProfile(payload);
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
        backendConfigured: this.isBackendConfigured(),
        message: 'Please resolve the highlighted validation errors.',
      };
    }

    try {
      // Simulate real network / database latency for loading feedback
      await new Promise((resolve) => setTimeout(resolve, 700));

      const trimmedFirst = payload.firstName.trim();
      const trimmedLast = payload.lastName.trim();
      const trimmedUser = payload.username.trim();

      const updated = updateStoredProfile({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        username: trimmedUser,
        fullName: `${trimmedFirst} ${trimmedLast}`,
      });

      const backendConfigured = this.isBackendConfigured();

      return {
        success: true,
        profile: updated,
        backendConfigured,
        message: backendConfigured
          ? 'Profile successfully saved to backend.'
          : 'Profile updated successfully in local session. (Note: Supabase backend persistence is unconfigured).',
      };
    } catch (err: any) {
      return {
        success: false,
        errors: { general: err?.message || 'Failed to update profile.' },
        backendConfigured: this.isBackendConfigured(),
        message: 'An unexpected error occurred while saving profile changes.',
      };
    }
  }
}

export const profileService = new ProfileServiceImpl();
