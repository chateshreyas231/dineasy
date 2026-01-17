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
import { colors, typography, spacing, shadows, gradients } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

export const RestaurantHomeStatusScreen: React.FC = () => {
  const { restaurantStatus, setRestaurantStatus } = useAppStore();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.soft as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>STATUS DASHBOARD</Text>

          <Card variant="glass3d" style={styles.card}>
            <Text style={styles.statusLabel}>CURRENT STATUS</Text>
            <View style={styles.statusContainer}>
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
            </View>
          </Card>

          <Card variant="glass3d" style={styles.card}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.buttonsContainer}>
              <Button
                title="Open"
                onPress={() => setRestaurantStatus('open')}
                variant={restaurantStatus === 'open' ? 'outlined' : 'ghost'}
                size="sm"
                style={[
                  styles.button,
                  restaurantStatus === 'open' && styles.buttonActive,
                ]}
              />
              <Button
                title="Busy"
                onPress={() => setRestaurantStatus('busy')}
                variant={restaurantStatus === 'busy' ? 'outlined' : 'ghost'}
                size="sm"
                style={[
                  styles.button,
                  restaurantStatus === 'busy' && styles.buttonActive,
                ]}
              />
              <Button
                title="Closed"
                onPress={() => setRestaurantStatus('closed')}
                variant={restaurantStatus === 'closed' ? 'outlined' : 'ghost'}
                size="sm"
                style={[
                  styles.button,
                  restaurantStatus === 'closed' && styles.buttonActive,
                ]}
              />
            </View>
          </Card>

          <Card variant="glass3d" style={styles.card}>
            <Text style={styles.sectionTitle}>TODAY'S OVERVIEW</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>12</Text>
                </View>
                <Text style={styles.statLabel}>REQUESTS</Text>
              </View>
              <View style={styles.stat}>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>8</Text>
                </View>
                <Text style={styles.statLabel}>CONFIRMED</Text>
              </View>
              <View style={styles.stat}>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>4</Text>
                </View>
                <Text style={styles.statLabel}>PENDING</Text>
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
    backgroundColor: colors.background.primary,
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
    marginBottom: spacing.xl,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    marginBottom: spacing.lg,
  },
  statusLabel: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusValue: {
    ...typography.h1,
    fontWeight: '700',
    fontSize: 42,
    letterSpacing: 1,
  },
  statusOpen: {
    color: colors.status.success,
    ...shadows.primary,
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  buttonActive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValueContainer: {
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h1,
    color: colors.primary.main,
    fontWeight: '700',
    fontSize: 36,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
