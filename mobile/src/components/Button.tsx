import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    disabled && styles.buttonDisabled,
    style, // User style applied last to allow overrides
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
    variant === 'primary' && styles.textPrimary,
    variant === 'accent' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'ghost' && styles.textGhost,
    disabled && styles.textDisabled,
  ];

  if (variant === 'primary' || variant === 'accent') {
    const gradientColors: [string, string] =
      variant === 'primary'
        ? ['#FF6B92', '#B66DFF'] // Pink to purple gradient
        : ['#FF6B92', '#B66DFF']; // Same gradient for accent

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={buttonStyle}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
            <Text style={textStyle}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.primary.main : colors.text.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Extract radius value to constant to avoid StyleSheet issues
const buttonRadius = radius.lg;

const styles = StyleSheet.create({
  button: {
    borderRadius: buttonRadius, // More rounded (24px)
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'stretch', // Ensure button fills container width
    minWidth: 0, // Allow button to shrink if needed
    flexShrink: 1, // Allow button to shrink
    maxHeight: 200, // Prevent buttons from becoming too tall
  },
  button_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  button_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  button_lg: {
    paddingHorizontal: spacing.lg + 4,
    paddingVertical: spacing.md + 2,
    minHeight: 50,
  },
  buttonSecondary: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border.elegant,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
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
  },
  text_sm: {
    fontSize: 15,
  },
  text_md: {
    fontSize: 17,
  },
  text_lg: {
    fontSize: 17,
  },
  textPrimary: {
    color: colors.text.inverse,
  },
  textSecondary: {
    color: colors.text.primary,
  },
  textGhost: {
    color: colors.primary.main,
  },
  textDisabled: {
    opacity: 0.6,
  },
});
