import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { getTimeAwareGreeting, formatDashboardDate } from '../../mock/dashboardData';

interface HeaderGreetingProps {
  userName?: string;
  style?: object;
}

export const HeaderGreeting: React.FC<HeaderGreetingProps> = ({
  userName = 'Bernadette',
  style,
}) => {
  const [greeting, setGreeting] = useState(() => getTimeAwareGreeting(userName));
  const [dateString, setDateString] = useState(() => formatDashboardDate());

  // Update greeting and date dynamically every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setGreeting(getTimeAwareGreeting(userName, now));
      setDateString(formatDashboardDate(now));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, [userName]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.greetingText}>{greeting}</Text>
      <Text style={styles.dateText}>{dateString}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetingText: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.textDark,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
});
