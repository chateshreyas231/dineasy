import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SectionHeader } from '../../components/SectionHeader';

export function ProfileScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const requests = useAppStore((state) => state.requests);
  const setRole = useAppStore((state) => state.setRole);

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Profile" />

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {preferences ? (
            <View style={styles.preferences}>
              {preferences.dietary.length > 0 && (
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Dietary:</Text>
                  <Text style={styles.preferenceValue}>{preferences.dietary.join(', ')}</Text>
                </View>
              )}
              {preferences.budget.length > 0 && (
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Budget:</Text>
                  <Text style={styles.preferenceValue}>
                    {preferences.budget.map((b) => '$'.repeat(b)).join(', ')}
                  </Text>
                </View>
              )}
              {preferences.ambience.length > 0 && (
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Ambience:</Text>
                  <Text style={styles.preferenceValue}>{preferences.ambience.join(', ')}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No preferences set</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>History</Text>
          {requests.length > 0 ? (
            <View style={styles.history}>
              {requests.slice(0, 5).map((request) => (
                <View key={request.id} style={styles.historyItem}>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyRestaurant}>{request.restaurantName}</Text>
                    <Text style={styles.historyDetails}>
                      {request.timeWindow} • Party of {request.partySize}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      request.status === 'confirmed' && styles.statusConfirmed,
                      request.status === 'declined' && styles.statusDeclined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        request.status === 'confirmed' && styles.statusTextConfirmed,
                        request.status === 'declined' && styles.statusTextDeclined,
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No reservation history</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.emptyText}>Payment methods (optional)</Text>
          <Button title="Add Payment Method" onPress={() => {}} variant="outline" fullWidth />
        </Card>

        <Button title="Logout" onPress={handleLogout} variant="outline" fullWidth />
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
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  preferences: {
    gap: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    width: 80,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  history: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyContent: {
    flex: 1,
  },
  historyRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusConfirmed: {
    backgroundColor: '#E8F5E9',
  },
  statusDeclined: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textTransform: 'capitalize',
  },
  statusTextConfirmed: {
    color: '#4ECDC4',
  },
  statusTextDeclined: {
    color: '#FF6B6B',
  },
});

