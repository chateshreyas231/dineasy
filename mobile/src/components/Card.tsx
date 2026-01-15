import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    variant === 'glass' && styles.cardGlass,
    style,
  ];

  if (variant === 'glass') {
    return (
      <BlurView intensity={80} tint="light" style={cardStyle}>
        {children}
      </BlurView>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const cardBorderRadius = radius['2xl']; // Extract to constant for StyleSheet

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: cardBorderRadius, // More rounded (32px)
    padding: spacing.lg,
    borderWidth: 0, // No border for cleaner look
  },
  cardElevated: {
    borderColor: colors.border.elegant,
  },
  cardOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border.elegant,
  },
  cardGlass: {
    backgroundColor: colors.background.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
});
