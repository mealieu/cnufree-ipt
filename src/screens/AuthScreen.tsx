import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AuthToggle } from '../components/auth/AuthToggle';
import { AuthInput } from '../components/auth/AuthInput';
import { PrimaryButton } from '../components/PrimaryButton'; // Reusing existing component if suitable, or wrapping below

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo */}
          <Text style={styles.logoText}>CNUFREE</Text>

          {/* Header */}
          <Text style={styles.heading}>
            {isLogin ? 'Welcome back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Sign in to see who’s free.'
              : 'Join CNU Free and sync schedules with friends.'}
          </Text>

          {/* Custom Toggle */}
          <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

          {/* Dynamic Form Fields */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <AuthInput
                label="Full Name"
                placeholder="E.g John Doe"
                autoCapitalize="words"
              />
            )}
            
            <AuthInput
              label="Email Address"
              placeholder="Name@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <AuthInput
              label="Password"
              placeholder="Min. 8 characters"
              secureTextEntry
            />

            {!isLogin && (
              <AuthInput
                label="Confirm password"
                placeholder="Re-enter password"
                secureTextEntry
              />
            )}
          </View>

          {/* Auxiliary Links & Checkbox */}
          {isLogin ? (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxPlaceholder} />
              <Text style={styles.checkboxText}>
                I agree to the Terms and Privacy Policy
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            {/* If PrimaryButton.tsx accepts custom styles/colors, use it. Otherwise, implementing a direct replica here for accuracy. */}
            <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Login' : 'Create account'}
              </Text>
            </TouchableOpacity>

            {/* Bottom Switch Link */}
            <View style={styles.bottomLinkContainer}>
              <Text style={styles.bottomText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.bottomLinkText}>
                  {isLogin ? 'Create an account' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1D8',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Keeps it mobile-sized on your desktop browser
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60, // Increased top padding to push logo down slightly
    paddingBottom: 40,
  },
  logoText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 32, // Increased gap between CNUFREE and the Heading
  },
  heading: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    color: '#000000',
    marginBottom: 4, // Tighter gap between heading and subtitle
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#000000',
  },
  formContainer: {
    width: '100%',
    marginTop: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 40, // Increased gap before the submit button
    marginTop: -4, // Pulls the "Forgot password" slightly closer to the input field
  },
  forgotPasswordText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#14891A', 
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40, // Increased gap before the submit button
    marginTop: 8,
    marginLeft: 4,
  },
  checkboxPlaceholder: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#000000',
  },
  submitContainer: {
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#5C7057', 
    width: 200, 
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12, // Tighter gap between the button and the bottom text
  },
  submitButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#000000',
  },
  bottomLinkText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#22C55E', 
  },
});