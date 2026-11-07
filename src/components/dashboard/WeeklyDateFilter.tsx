import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const weekDays = [
  { day: 'Mon', date: '19' }, { day: 'Tue', date: '20' }, { day: 'Wed', date: '21' },
  { day: 'Thurs', date: '22' }, { day: 'Fri', date: '23' }, { day: 'Sat', date: '24' },
  { day: 'Sun', date: '25' },
];

export const WeeklyDateFilter = () => {
  const [selectedDate, setSelectedDate] = useState('20');

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {weekDays.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <TouchableOpacity
              key={item.date}
              style={[styles.filterItem, isSelected ? styles.selectedItem : styles.unselectedItem]}
              onPress={() => setSelectedDate(item.date)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayText, isSelected ? styles.selectedText : styles.unselectedText]}>
                {item.day}
              </Text>
              <Text style={[styles.dateText, isSelected ? styles.selectedText : styles.unselectedText]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12, // Tighter bottom margin because the pill filter is directly below it
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  filterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 48,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedItem: { backgroundColor: '#11776D' }, // Exact Teal Green
  unselectedItem: { backgroundColor: '#AFEFD4' }, // Exact Light Green
  dayText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10, // STRICTLY 10px
    marginBottom: 4,
  },
  dateText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10, // STRICTLY 10px
  },
  selectedText: { color: '#FFFFFF' },
  unselectedText: { color: '#000000' }
});