import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  message,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.text.muted} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
