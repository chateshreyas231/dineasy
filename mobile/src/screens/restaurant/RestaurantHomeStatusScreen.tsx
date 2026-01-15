import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ToggleRow } from '../../components/ToggleRow';
import { colors, typography, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

export const RestaurantHomeStatusScreen: React.FC = () => {
  const { restaurantStatus, setRestaurantStatus } = useAppStore();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Status Dashboard</Text>

          <Card style={styles.card}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text
              style={[
                styles.statusValue,
                restaurantStatus === 'open' && styles.statusOpen,
                restaurantStatus === 'closed' && styles.statusClosed,
                restaurantStatus === 'busy' && styles.statusBusy,
              ]}
            >
              {restaurantStatus.toUpperCase()}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.buttonsContainer}>
              <Button
                title="Open"
                onPress={() => setRestaurantStatus('open')}
                variant={restaurantStatus === 'open' ? 'primary' : 'secondary'}
                size="md"
                style={styles.button}
              />
              <Button
                title="Busy"
                onPress={() => setRestaurantStatus('busy')}
                variant={restaurantStatus === 'busy' ? 'primary' : 'secondary'}
                size="md"
                style={styles.button}
              />
              <Button
                title="Closed"
                onPress={() => setRestaurantStatus('closed')}
                variant={restaurantStatus === 'closed' ? 'primary' : 'secondary'}
                size="md"
                style={styles.button}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Requests</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Confirmed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  statusLabel: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  statusValue: {
    ...typography.h1,
    fontWeight: '700',
  },
  statusOpen: {
    color: colors.status.success,
  },
  statusClosed: {
    color: colors.status.error,
  },
  statusBusy: {
    color: colors.status.warning,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
});
