import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  if (selected) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.chip, styles.chipSelected, style]}
      >
        <LinearGradient
          colors={['#FF6B92', '#B66DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.textSelected}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.chip, styles.chipUnselected, style]}
    >
      <Text style={styles.textUnselected}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40, // Slightly taller for better touch target
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipSelected: {
    borderWidth: 0,
  },
  chipUnselected: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border.elegant,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textSelected: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  textUnselected: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
