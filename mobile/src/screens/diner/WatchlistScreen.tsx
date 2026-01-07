import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { ToggleRow } from '../../components/ToggleRow';
import { Button } from '../../components/Button';

export function WatchlistScreen() {
  const watches = useAppStore((state) => state.watches);
  const toggleWatchNotifications = useAppStore((state) => state.toggleWatchNotifications);
  const removeWatch = useAppStore((state) => state.removeWatch);

  if (watches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👀</Text>
          <Text style={styles.emptyTitle}>No Active Watches</Text>
          <Text style={styles.emptyText}>
            Watch restaurants to get notified when tables become available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Active Watches</Text>

        {watches.map((watch) => (
          <Card key={watch.id} style={styles.watchCard}>
            <View style={styles.watchHeader}>
              <View style={styles.watchInfo}>
                <Text style={styles.watchLabel}>{watch.geoLabel}</Text>
                <Text style={styles.watchDetails}>
                  {watch.radius} mi • {watch.timeRange}
                </Text>
                {watch.vibeTags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {watch.vibeTags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <ToggleRow
              label="Notifications"
              value={watch.notificationsEnabled}
              onValueChange={() => toggleWatchNotifications(watch.id)}
            />

            <Button
              title="Remove Watch"
              onPress={() => removeWatch(watch.id)}
              variant="outline"
              fullWidth
              style={styles.removeButton}
            />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 24,
  },
  watchCard: {
    marginBottom: 16,
  },
  watchHeader: {
    marginBottom: 16,
  },
  watchInfo: {
    marginBottom: 8,
  },
  watchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  watchDetails: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  removeButton: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});

