import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.primary.main}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action && <View>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
});
