import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

export type PlatformType = 
  | 'opentable' 
  | 'resy' 
  | 'tock' 
  | 'toast' 
  | 'yelp_reservations' 
  | 'google_reserve' 
  | 'sevenrooms'
  | 'deeplink';

interface PlatformBadgeProps {
  platform: PlatformType;
  size?: 'small' | 'medium';
}

const platformConfig: Record<PlatformType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  opentable: { label: 'OpenTable', icon: 'restaurant', color: '#DA3743' },
  resy: { label: 'Resy', icon: 'calendar', color: '#000000' },
  tock: { label: 'Tock', icon: 'time', color: '#1A1A1A' },
  toast: { label: 'Toast', icon: 'cafe', color: '#FF6B35' },
  yelp_reservations: { label: 'Yelp', icon: 'star', color: '#FF1A1A' },
  google_reserve: { label: 'Google', icon: 'logo-google', color: '#4285F4' },
  sevenrooms: { label: '7Rooms', icon: 'grid', color: '#000000' },
  deeplink: { label: 'Website', icon: 'link', color: colors.text.muted },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, size = 'small' }) => {
  const config = platformConfig[platform] || platformConfig.deeplink;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall, { backgroundColor: config.color + '15' }]}>
      <Ionicons 
        name={config.icon} 
        size={isSmall ? 12 : 14} 
        color={config.color} 
        style={styles.icon}
      />
      <Text 
        style={[
          styles.label, 
          isSmall && styles.labelSmall,
          { color: config.color }
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </View>
  );
};

interface PlatformBadgesProps {
  platforms?: string[];
  maxVisible?: number;
  size?: 'small' | 'medium';
}

export const PlatformBadges: React.FC<PlatformBadgesProps> = ({ 
  platforms = [], 
  maxVisible = 3,
  size = 'small' 
}) => {
  if (!platforms || platforms.length === 0) {
    return null;
  }

  const visiblePlatforms = platforms.slice(0, maxVisible);
  const remainingCount = platforms.length - maxVisible;

  return (
    <View style={styles.container}>
      {visiblePlatforms.map((platform, index) => (
        <PlatformBadge 
          key={`${platform}-${index}`} 
          platform={platform as PlatformType} 
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <View style={[styles.badge, styles.badgeSmall, styles.moreBadge]}>
          <Text style={styles.moreText}>+{remainingCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    gap: spacing.xs,
  },
  badgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  labelSmall: {
    fontSize: 9,
  },
  moreBadge: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  moreText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.text.muted,
    fontWeight: '600',
  },
});
