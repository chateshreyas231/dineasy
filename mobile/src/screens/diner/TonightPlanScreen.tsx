import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function TonightPlanScreen() {
  const currentPlan = useAppStore((state) => state.currentPlan);
  const backupPlans = useAppStore((state) => state.backupPlans);
  const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);
  const setBackupPlans = useAppStore((state) => state.setBackupPlans);

  const handleSwitchToBackup = (backup: typeof backupPlans[0]) => {
    if (currentPlan) {
      setBackupPlans([currentPlan, ...backupPlans.filter((p) => p.restaurantId !== backup.restaurantId)]);
    }
    setCurrentPlan(backup);
    setBackupPlans(backupPlans.filter((p) => p.restaurantId !== backup.restaurantId));
  };

  if (!currentPlan && backupPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Plans Tonight</Text>
          <Text style={styles.emptyText}>
            Start searching for restaurants to create your plan
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Plan (Tonight)</Text>

        {currentPlan && (
          <Card style={styles.currentPlanCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planLabel}>Current Plan</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <Text style={styles.planRestaurantName}>{currentPlan.restaurantName}</Text>
            <View style={styles.planDetails}>
              <Ionicons name="time" size={16} color="#7F8C8D" />
              <Text style={styles.planDetailText}>{currentPlan.time}</Text>
              <Text style={styles.planDetailText}> • </Text>
              <Ionicons name="people" size={16} color="#7F8C8D" />
              <Text style={styles.planDetailText}>Party of {currentPlan.partySize}</Text>
            </View>
          </Card>
        )}

        {backupPlans.length > 0 && (
          <View style={styles.backupsSection}>
            <Text style={styles.backupsTitle}>Backup Suggestions</Text>
            {backupPlans.map((backup) => (
              <Card key={backup.restaurantId} style={styles.backupCard}>
                <View style={styles.backupInfo}>
                  <Text style={styles.backupRestaurantName}>{backup.restaurantName}</Text>
                  <View style={styles.planDetails}>
                    <Ionicons name="time" size={16} color="#7F8C8D" />
                    <Text style={styles.planDetailText}>{backup.time}</Text>
                    <Text style={styles.planDetailText}> • </Text>
                    <Ionicons name="people" size={16} color="#7F8C8D" />
                    <Text style={styles.planDetailText}>Party of {backup.partySize}</Text>
                  </View>
                </View>
                <Button
                  title="Switch to Backup"
                  onPress={() => handleSwitchToBackup(backup)}
                  variant="outline"
                  style={styles.switchButton}
                />
              </Card>
            ))}
          </View>
        )}
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
  currentPlanCard: {
    marginBottom: 32,
    backgroundColor: '#E8F5E9',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textTransform: 'uppercase',
  },
  activeBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planRestaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDetailText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  backupsSection: {
    marginTop: 8,
  },
  backupsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  backupCard: {
    marginBottom: 16,
  },
  backupInfo: {
    marginBottom: 12,
  },
  backupRestaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  switchButton: {
    marginTop: 8,
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

