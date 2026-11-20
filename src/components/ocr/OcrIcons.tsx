import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface IconProps {
  color?: string;
  size?: number;
}

/**
 * Cloud upload icon with upward arrow, matching Figma PS-06 Upload your Schedule button
 */
export const UploadCloudIcon: React.FC<IconProps> = ({
  color = COLORS.white,
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Cloud body */}
    <Path
      d="M6.5 19C4.01472 19 2 16.9853 2 14.5C2 12.1564 3.79151 10.2313 6.10425 10.024C6.58288 6.59253 9.49755 4 13 4C17.0864 4 20.4484 7.07345 20.899 11.118C21.5422 11.597 22 12.3575 22 13.25C22 14.7688 20.7688 16 19.25 16H18"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Arrow pointing up */}
    <Path
      d="M12 11V20"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
    <Path
      d="M8.5 14.5L12 11L15.5 14.5"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Radial 12-spoke animated spinner matching exact Figma PS-06 processing state
 */
export const RadialSpokeSpinner: React.FC<{
  size?: number;
  color?: string;
  isProcessing?: boolean;
}> = ({
  size = 76,
  color = '#121A14',
  isProcessing = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isProcessing) {
      rotateAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim, isProcessing]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spokes = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        transform: isProcessing ? [{ rotate: spin }] : [],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G transform="translate(50, 50)">
          {spokes.map((index) => {
            const angle = (index * 360) / 12;
            const opacity = isProcessing ? 0.25 + (index / 12) * 0.75 : 1;
            return (
              <G key={index} transform={`rotate(${angle})`}>
                <Rect
                  x={-2.2}
                  y={-38}
                  width={4.4}
                  height={14}
                  rx={2.2}
                  fill={color}
                  opacity={opacity}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    </Animated.View>
  );
};

/**
 * Success Checkmark Badge: large dark green circle with light mint checkmark matching PS-08
 */
export const SuccessCheckmarkBadge: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.ocrBadgeCircleBg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }}
  >
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 12.5L9.5 17.5L19.5 7.5"
        stroke={COLORS.ocrCheckmarkGreen}
        strokeWidth={3.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

/**
 * Error Exclamation Badge: large dark green circle with light mint exclamation mark matching PS-08
 */
export const ErrorExclamationBadge: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.ocrBadgeCircleBg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }}
  >
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6V13"
        stroke={COLORS.ocrCheckmarkGreen}
        strokeWidth={3.8}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={18} r={2} fill={COLORS.ocrCheckmarkGreen} />
    </Svg>
  </View>
);

/**
 * Edit pencil icon for correcting extracted table entries (PS-07)
 */
export const EditPencilIcon: React.FC<IconProps> = ({
  color = '#2C3E2D',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10217 19.5 3.5C19.8978 3.89783 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10217 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Trash icon for deleting an incorrectly extracted entry (PS-07)
 */
export const TrashIcon: React.FC<IconProps> = ({
  color = '#B25D5D',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H21M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M10 11V17M14 11V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/**
 * Plus icon for adding missed schedule entry
 */
export const PlusIcon: React.FC<IconProps> = ({
  color = COLORS.white,
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

/**
 * Profile quick action icons shown in Figma PS-06 background:
 * 1. Edit Profile (pencil in circle)
 * 2. My Schedule (calendar in circle)
 * 3. Import Schedule (cloud in circle)
 * 4. Share Link (share node in circle)
 */
export const QuickActionIcons = {
  EditProfile: ({ size = 20, color = '#121A14' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3A2.828 2.828 0 1 1 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  MySchedule: ({ size = 20, color = '#121A14' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={17} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={8} cy={14} r={1} fill={color} />
      <Circle cx={12} cy={14} r={1} fill={color} />
      <Circle cx={16} cy={14} r={1} fill={color} />
    </Svg>
  ),
  ImportSchedule: ({ size = 20, color = '#121A14' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M12 12v9m-3-3 3-3 3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  ShareLink: ({ size = 20, color = '#121A14' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={2} />
      <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={2} />
      <Path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" stroke={color} strokeWidth={2} />
    </Svg>
  ),
};
