import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { AIActivity } from '../services/aiAgentService';

interface LiveActivityFeedProps {
  activities: AIActivity[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: AIActivity['type']) => {
    switch (type) {
      case 'question':
        return 'help-circle-outline';
      case 'thinking':
        return 'hourglass-outline';
      case 'searching':
        return 'search-outline';
      case 'checking':
        return 'checkmark-circle-outline';
      case 'booking':
        return 'calendar-outline';
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  };

  const getActivityColor = (type: AIActivity['type']) => {
    switch (type) {
      case 'success':
        return colors.status.success;
      case 'error':
        return colors.status.error;
      case 'booking':
        return colors.primary.main;
      case 'checking':
        return colors.status.info;
      default:
        return colors.text.muted;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyText}>Start a conversation to see AI activities</Text>
        </View>
      ) : (
        activities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
              <Ionicons
                name={getActivityIcon(activity.type) as any}
                size={20}
                color={getActivityColor(activity.type)}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityMessage}>{activity.message}</Text>
              <Text style={styles.activityTime}>
                {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
