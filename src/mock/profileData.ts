import { UserProfileData } from '../types/profile';

export const INITIAL_USER_PROFILE: UserProfileData = {
  id: 'usr_bernadette_cruz',
  firstName: 'Bernadette',
  lastName: 'Cruz',
  fullName: 'Bernadette Cruz',
  username: 'bernadette_c',
  email: 'bernadette.cruz@cnu.edu.ph',
  avatarUrl: undefined,
  initials: 'BC',
  bio: 'BS Computer Science student at Cebu Normal University.',
};

let currentProfile: UserProfileData = { ...INITIAL_USER_PROFILE };
const listeners: Array<(profile: UserProfileData) => void> = [];

export function getStoredProfile(): UserProfileData {
  return { ...currentProfile };
}

export function updateStoredProfile(updates: Partial<UserProfileData>): UserProfileData {
  const firstName = updates.firstName !== undefined ? updates.firstName : currentProfile.firstName;
  const lastName = updates.lastName !== undefined ? updates.lastName : currentProfile.lastName;
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || 'BC';

  currentProfile = {
    ...currentProfile,
    ...updates,
    firstName,
    lastName,
    fullName: updates.fullName || fullName,
    initials: updates.initials || initials,
  };

  listeners.forEach((listener) => listener(currentProfile));
  return { ...currentProfile };
}

export function subscribeToProfile(listener: (profile: UserProfileData) => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  };
}
