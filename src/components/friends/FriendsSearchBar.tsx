import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { FriendsSearchBarProps } from '../../types/friends';

export const FriendsSearchBar: React.FC<FriendsSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onPressAddButton,
  placeholder = 'Search by name or username...',
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.row}>
      {/* Rounded Olive Search Input Container */}
      <View
        style={styles.searchContainer}
        accessibilityRole="search"
        accessibilityLabel="Search by name or username"
      >
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="rgba(244, 241, 216, 0.65)"
          selectionColor={COLORS.cream}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke={COLORS.cream}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Square Outlined Plus Button [+] */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onPressAddButton}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Add or find friends"
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5V19M5 12H19"
            stroke={COLORS.friendsOliveText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 34,
  },
  searchContainer: {
    flex: 1,
    height: 46,
    backgroundColor: COLORS.friendsSearchBg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.cream,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: COLORS.friendsOliveText,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
