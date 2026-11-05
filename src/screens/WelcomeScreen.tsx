import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { FeatureCard } from '../components/FeatureCard';
import { PrimaryButton } from '../components/PrimaryButton';

export const WelcomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome Heading */}
          <Text style={styles.welcomeHeading}>WELCOME TO CNUFREE</Text>

          {/* Overlapping Cards Section */}
          <View style={styles.cardsContainer}>
            <FeatureCard
              title="Organize your schedule"
              description="See your week in one clear view."
              icon="🗂️"
              style={{ transform: [{ translateX: -90 }, { rotate: '-12deg' }, { translateY: 15 }] }}
            />
            <FeatureCard
              title="Find common free time"
              description="Make plans when everyone's available."
              icon="📋"
              alignRight={true}
              style={{ transform: [{ translateX: 90 }, { rotate: '12deg' }, { translateY: 15 }] }}
            />
            <FeatureCard
              title="Connect with friends"
              description="Share availability with the people you choose."
              icon="🧑‍🤝‍🧑"
              isCenter
              style={{ position: 'relative' }}
            />
          </View>

          {/* Text and Call to Action Section */}
          <View style={styles.textSection}>
            <Text style={styles.mainHeadline}>Turn free time into plans</Text>
            <Text style={styles.supportingDescription}>
              Spend less time coordinating and more time enjoying the moments that matter.
            </Text>
          </View>

          <PrimaryButton
            label="Get Started"
            onPress={() => console.log('Get Started Pressed')}
            style={styles.buttonSpacing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-evenly',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
    minHeight: 560,
  },
  welcomeHeading: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textDark,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
  },
  cardsContainer: {
    height: 280,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  supportingDescription: {
    fontFamily: FONTS.italic,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
    textAlign: 'left',
    alignSelf: 'center',
    width: '90%',
  },
  buttonSpacing: {
    marginBottom: 40,
    alignSelf: 'center',
  },
});
