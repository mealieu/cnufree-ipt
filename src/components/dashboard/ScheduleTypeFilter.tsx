import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const filterOptions = ['All', 'Classes', 'Free Time'];

export const ScheduleTypeFilter = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <View style={styles.container}>
      {filterOptions.map((option) => {
        const isActive = activeFilter === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveFilter(option)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isActive && styles.activeText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EAEEDB', // Matches the pale cream/green pill background in the reference
    borderRadius: 30,
    marginHorizontal: 24,
    marginBottom: 24, // Spacing between this filter and the timeline below it
    padding: 2, // Slight padding so the active pill sits inside the container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: '#287A74', // Exact Teal Green
    borderWidth: 1,
    borderColor: '#F9F509', // Exact Yellow for the active outline
  },
  tabText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10, // STRICTLY 10px
    color: '#000000',
  },
  activeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF', // White text for contrast on the Teal background
  },
});