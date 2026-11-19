import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { styles } from './ProfileModals.styles';
import { UserProfileData, ProfileValidationErrors } from '../../types/profile';
import { updateStoredProfile } from '../../mock/profileData';

export interface EditProfileModalProps {
  visible: boolean;
  currentProfile: UserProfileData;
  onClose: () => void;
  onSaved: (updated: UserProfileData) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentProfile,
  onClose,
  onSaved,
}) => {
  const [firstName, setFirstName] = useState(currentProfile.firstName || '');
  const [lastName, setLastName] = useState(currentProfile.lastName || '');
  const [username, setUsername] = useState(currentProfile.username || '');

  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (visible) {
      setFirstName(currentProfile.firstName || '');
      setLastName(currentProfile.lastName || '');
      setUsername(currentProfile.username || '');
      setErrors({});
      setFeedback(null);
      setIsSubmitting(false);
    }
  }, [visible, currentProfile]);

  const validate = (): boolean => {
    const errs: ProfileValidationErrors = {};
    const tFirst = firstName.trim();
    const tLast = lastName.trim();
    const tUser = username.trim();

    if (!tFirst) {
      errs.firstName = 'First name is required.';
    } else if (tFirst.length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
    }

    if (!tLast) {
      errs.lastName = 'Last name is required.';
    } else if (tLast.length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
    }

    if (!tUser) {
      errs.username = 'Username is required.';
    } else if (tUser.length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(tUser)) {
      errs.username = 'Username can only contain letters, numbers, and underscores.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setFeedback({ type: 'error', text: 'Please resolve the highlighted errors.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const tFirst = firstName.trim();
    const tLast = lastName.trim();
    const tUser = username.trim();

    const updated = updateStoredProfile({
      firstName: tFirst,
      lastName: tLast,
      username: tUser,
      fullName: `${tFirst} ${tLast}`,
    });

    setIsSubmitting(false);
    setFeedback({ type: 'success', text: 'Profile updated successfully!' });

    setTimeout(() => {
      onSaved(updated);
      onClose();
    }, 700);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={isSubmitting ? undefined : onClose}
          accessibilityLabel="Dismiss edit profile"
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle Bar */}
          <View style={styles.dragHandleBar} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.sheetCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Title (Figma PS-02) */}
            <Text style={styles.sheetTitle}>Edit your profile</Text>

            {/* Feedback Banner */}
            {feedback && (
              <View
                style={[
                  styles.feedbackBanner,
                  feedback.type === 'success' ? styles.successBanner : styles.errorBanner,
                ]}
              >
                <Text style={styles.feedbackText}>{feedback.text}</Text>
              </View>
            )}

            {/* Input Fields (Figma PS-02 Exact) */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.inputCard, errors.firstName && styles.inputCardError]}
                  value={firstName}
                  onChangeText={(val) => {
                    setFirstName(val);
                    if (errors.firstName) setErrors((e: ProfileValidationErrors) => ({ ...e, firstName: undefined }));
                  }}
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

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.inputCard, errors.lastName && styles.inputCardError]}
                  value={lastName}
                  onChangeText={(val) => {
                    setLastName(val);
                    if (errors.lastName) setErrors((e: ProfileValidationErrors) => ({ ...e, lastName: undefined }));
                  }}
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

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.inputCard, errors.username && styles.inputCardError]}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    if (errors.username) setErrors((e: ProfileValidationErrors) => ({ ...e, username: undefined }));
                  }}
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

            {/* Action Button: SAVE (Figma PS-02) */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, isSubmitting && styles.primaryActionBtnDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Save Profile Changes"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryActionBtnText}>SAVE</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
