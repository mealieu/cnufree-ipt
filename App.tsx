import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { HomeScreen } from './src/screens/HomeScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { COLORS } from './src/constants/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [isAuthenticated, setIsAuthenticated] = React.useState(true);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.cream }}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={COLORS.darkGreen} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <HomeScreen onLogout={() => setIsAuthenticated(false)} />
    </>
  );
}
