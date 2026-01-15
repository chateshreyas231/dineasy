import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.primary.main}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.muted}
          {...props}
        />
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.primary.main}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary, // White background
    borderRadius: radius.xl, // More rounded (28px)
    borderWidth: 0, // No border for cleaner look
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
