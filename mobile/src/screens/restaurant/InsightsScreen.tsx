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
import { colors, typography, spacing } from '../../theme';

export const InsightsScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Insights</Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Request Trends</Text>
            <View style={styles.stat}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Popular Times</Text>
            <Text style={styles.text}>7:00 PM - 8:00 PM</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Revenue Insights</Text>
            <View style={styles.stat}>
              <Text style={styles.statValue}>$12,450</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
  text: {
    ...typography.body,
    color: colors.text.primary,
  },
});
