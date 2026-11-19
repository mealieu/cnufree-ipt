export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  bio?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
}

export interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  general?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  profile?: UserProfileData;
  errors?: ProfileValidationErrors;
  backendConfigured: boolean;
  message: string;
}
