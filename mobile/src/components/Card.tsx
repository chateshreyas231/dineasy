import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  glow?: boolean;
}

export function Card({ children, style, padding = 16, glow = false }: CardProps) {
  return (
    <View style={[
      styles.card,
      glow && styles.glow,
      { padding },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  glow: {
    borderColor: colors.primary.main,
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});
