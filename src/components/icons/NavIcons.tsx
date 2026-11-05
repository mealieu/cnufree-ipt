import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color, size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FriendsIcon: React.FC<IconProps> = ({ color, size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left person */}
    <Circle cx="8" cy="7" r="3.2" stroke={color} strokeWidth={2} />
    <Path
      d="M2.5 19C2.5 15.5 5 13.5 8 13.5C10 13.5 11.5 14.5 12.3 16"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    {/* Right person */}
    <Circle cx="16" cy="8.5" r="2.8" stroke={color} strokeWidth={2} />
    <Path
      d="M12.5 19C12.5 16.5 14.2 15 16.5 15C19 15 21.5 16.5 21.5 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const SharedIcon: React.FC<IconProps> = ({ color, size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Calendar frame */}
    <Rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Spiral loops */}
    <Path d="M7 3V6M12 3V6M17 3V6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    {/* Grid dots / schedule markers */}
    <Circle cx="7.5" cy="11.5" r="1.2" fill={color} />
    <Circle cx="12" cy="11.5" r="1.2" fill={color} />
    <Circle cx="16.5" cy="11.5" r="1.2" fill={color} />
    <Circle cx="7.5" cy="16" r="1.2" fill={color} />
    <Circle cx="12" cy="16" r="1.2" fill={color} />
    <Circle cx="16.5" cy="16" r="1.2" fill={color} />
  </Svg>
);

export const NotificationsIcon: React.FC<IconProps> = ({ color, size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 9C18 6.23858 15.3137 4 12 4C8.68629 4 6 6.23858 6 9C6 14 4 16 4 16H20C20 16 18 14 18 9Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 19C10.2 19.8 11 20.5 12 20.5C13 20.5 13.8 19.8 14 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ color, size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
    <Path
      d="M4.5 20C4.5 16 7.85786 14.5 12 14.5C16.1421 14.5 19.5 16 19.5 20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const UserAvatarSilhouette: React.FC<{
  size?: number;
  color?: string;
  bgColor?: string;
}> = ({
  size = 48,
  color = '#627180',
  bgColor = '#DEE5ED',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill={bgColor} />
    <Circle cx="24" cy="18" r="7.5" fill={color} />
    <Path
      d="M10 39C10 31.5 16.5 29 24 29C31.5 29 38 31.5 38 39"
      stroke={color}
      strokeWidth={4.5}
      strokeLinecap="round"
      fill={color}
    />
  </Svg>
);
