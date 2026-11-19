import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { styles } from './EditProfileScreen.styles';
import { UserProfileData, ProfileValidationErrors } from '../types/profile';
import { profileService, validateProfileInput } from '../services/profileService';

export interface EditProfileScreenProps {
  initialProfile?: UserProfileData;
  onSaveSuccess?: (updated: UserProfileData) => void;
  onCancel?: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  initialProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const current = initialProfile || profileService.getProfile();

  const [firstName, setFirstName] = useState(current.firstName || '');
  const [lastName, setLastName] = useState(current.lastName || '');
  const [username, setUsername] = useState(current.username || '');

  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFieldChange = (field: 'firstName' | 'lastName' | 'username', value: string) => {
    if (field === 'firstName') setFirstName(value);
    if (field === 'lastName') setLastName(value);
    if (field === 'username') setUsername(value);

    // Clear individual field error as user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (statusMessage) {
      setStatusMessage(null);
    }
  };

  const handleSave = async () => {
    // 1. Client-side input validation
    const payload = {
      firstName,
      lastName,
      username,
    };

    const validationErrors = validateProfileInput(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatusMessage({ type: 'error', text: 'Please correct the highlighted fields.' });
      return;
    }

    // 2. Prevent duplicate submissions & show loading feedback
    setIsSubmitting(true);
    setErrors({});
    setStatusMessage(null);

    try {
      const result = await profileService.updateProfile(payload);
      setIsSubmitting(false);

      if (result.success && result.profile) {
        setStatusMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        setTimeout(() => {
          onSaveSuccess?.(result.profile!);
        }, 800);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        setStatusMessage({
          type: 'error',
          text: result.message || 'Failed to save profile changes.',
        });
      }
    } catch {
      setIsSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: 'An unexpected error occurred while saving your profile.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={isSubmitting ? undefined : onCancel}
        accessibilityLabel="Dismiss edit profile"
      />

      <View style={styles.sheetContainer}>
        {/* Top Drag Handle Bar */}
        <View style={styles.dragHandleBar} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={styles.sheetTitle}>Edit your profile</Text>

          {/* Feedback Banner */}
          {statusMessage && (
            <View
              style={[
                styles.feedbackBanner,
                statusMessage.type === 'success' ? styles.successBanner : styles.errorBanner,
              ]}
            >
              <Text style={styles.feedbackText}>{statusMessage.text}</Text>
            </View>
          )}

          {/* Input Fields (Matching Figma Reference Exactly) */}
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.inputCard, errors.firstName && styles.inputCardError]}
                value={firstName}
                onChangeText={(val) => handleFieldChange('firstName', val)}
                placeholder="First Name"
                placeholderTextColor="#7D8D7E"
                autoCapitalize="words"
                editable={!isSubmitting}
                accessibilityLabel="First Name"
              />
              {errors.firstName && (
                <Text style={styles.fieldErrorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.inputCard, errors.lastName && styles.inputCardError]}
                value={lastName}
                onChangeText={(val) => handleFieldChange('lastName', val)}
                placeholder="Last Name"
                placeholderTextColor="#7D8D7E"
                autoCapitalize="words"
                editable={!isSubmitting}
                accessibilityLabel="Last Name"
              />
              {errors.lastName && (
                <Text style={styles.fieldErrorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Username */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.inputCard, errors.username && styles.inputCardError]}
                value={username}
                onChangeText={(val) => handleFieldChange('username', val)}
                placeholder="Username"
                placeholderTextColor="#7D8D7E"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel="Username"
              />
              {errors.username && (
                <Text style={styles.fieldErrorText}>{errors.username}</Text>
              )}
            </View>
          </View>

          {/* Action Button: SAVE */}
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save Profile Changes"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};
