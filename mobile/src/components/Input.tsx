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
  editable = true,
  ...props
}) => {
  const isDisabled = editable === false;
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        isDisabled && styles.inputContainerDisabled
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.primary.main}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, isDisabled && styles.inputDisabled, style]}
          placeholderTextColor={colors.text.muted}
          editable={editable}
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
    backgroundColor: colors.background.secondary, // Light grey background
    borderRadius: radius.xl, // More rounded (28px)
    borderWidth: 1, // Subtle border
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  inputContainerDisabled: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  inputDisabled: {
    color: colors.text.tertiary,
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
