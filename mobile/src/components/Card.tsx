import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'glass3d';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  interactive = false,
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    variant === 'glass' && styles.cardGlass,
    variant === 'glass3d' && styles.cardGlass3d,
    interactive && styles.cardInteractive,
    style,
  ];

  if (variant === 'glass' || variant === 'glass3d') {
    return (
      <View style={cardStyle}>
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>
        <View style={styles.cardContent}>{children}</View>
        {/* Glass highlight overlay - subtle on light */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassHighlight}
          pointerEvents="none"
        />
      </View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const cardBorderRadius = radius.md;

const styles = StyleSheet.create({
  card: {
    borderRadius: cardBorderRadius,
    padding: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  cardContent: {
    zIndex: 1,
  },
  cardElevated: {
    backgroundColor: colors.background.elevated,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cardOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.elegant,
    ...shadows.xs,
  },
  cardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  cardGlass3d: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },
  cardInteractive: {
    ...shadows.sm,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: cardBorderRadius,
    zIndex: 2,
  },
});
