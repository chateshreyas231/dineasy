import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  value,
  onValueChange,
  description,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border.medium,
          true: colors.primary.main,
        }}
        thumbColor={colors.background.card}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});
