import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing, shadows } from '../theme';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'outlined';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  uppercase?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  uppercase = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    variant === 'primary' && styles.buttonPrimary,
    variant === 'accent' && styles.buttonAccent,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    variant === 'outlined' && styles.buttonOutlined,
    disabled && styles.buttonDisabled,
    isPressed && styles.buttonPressed,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
    variant === 'primary' && styles.textPrimary,
    variant === 'accent' && styles.textAccent,
    variant === 'secondary' && styles.textSecondary,
    variant === 'ghost' && styles.textGhost,
    variant === 'outlined' && styles.textOutlined,
    disabled && styles.textDisabled,
  ];

  const displayText = uppercase ? title.toUpperCase() : title;

  // Primary and Accent buttons with gradient
  if (variant === 'primary' || variant === 'accent') {
    const gradientColors: [string, string] =
      variant === 'primary'
        ? ['#000000', '#1A1A1A'] // Black gradient
        : ['#4A4A4A', '#6A6A6A']; // Gray gradient for accent

    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          buttonStyle,
          pressed && !disabled && styles.buttonPressed,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
            <Text style={textStyle}>{displayText}</Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  // Other button variants
  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'ghost'
              ? colors.primary.main
              : variant === 'outlined'
              ? colors.primary.main
              : colors.text.primary
          }
          size="small"
        />
      ) : (
        <Text style={textStyle}>{displayText}</Text>
      )}
    </Pressable>
  );
};

const buttonRadius = radius.xl; // 28px - more rounded

const styles = StyleSheet.create({
  button: {
    borderRadius: buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    minWidth: 0,
    flexShrink: 1,
    position: 'relative',
  },
  button_sm: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minHeight: 40,
  },
  button_md: {
    paddingHorizontal: spacing.lg + 4,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  button_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 4,
    minHeight: 56,
  },
  // Primary button - black with subtle shadow
  buttonPrimary: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Accent button - gray with subtle shadow
  buttonAccent: {
    ...Platform.select({
      ios: {
        shadowColor: '#4A4A4A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Secondary button - light gray background
  buttonSecondary: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  // Ghost button - transparent
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  // Outlined button - border only
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    textAlign: 'center',
    fontWeight: '600',
    flexShrink: 0,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 17,
  },
  textPrimary: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  textAccent: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  textGhost: {
    color: colors.primary.main,
    fontWeight: '500',
  },
  textOutlined: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.6,
  },
});
