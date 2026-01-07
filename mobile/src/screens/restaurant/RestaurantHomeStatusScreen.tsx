import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SectionHeader } from '../../components/SectionHeader';
import { RestaurantStatus } from '../../types';

const statusOptions: { label: string; value: RestaurantStatus; color: string }[] = [
  { label: 'Open', value: 'open', color: '#4ECDC4' },
  { label: 'Moderate', value: 'moderate', color: '#FFE66D' },
  { label: 'Busy', value: 'busy', color: '#FF6B6B' },
  { label: 'Full', value: 'full', color: '#7F8C8D' },
];

export function RestaurantHomeStatusScreen() {
  const restaurantStatus = useAppStore((state) => state.restaurantStatus);
  const setRestaurantStatus = useAppStore((state) => state.setRestaurantStatus);
  const nextAvailableWindow = useAppStore((state) => state.nextAvailableWindow);
  const setNextAvailableWindow = useAppStore((state) => state.setNextAvailableWindow);
  const [editingWindow, setEditingWindow] = useState(false);
  const [newWindow, setNewWindow] = useState(nextAvailableWindow || '7:30 PM - 8:00 PM');

  const currentStatus = statusOptions.find((s) => s.value === restaurantStatus);

  const handleUpdateStatus = (status: RestaurantStatus) => {
    setRestaurantStatus(status);
  };

  const handleSaveWindow = () => {
    setNextAvailableWindow(newWindow);
    setEditingWindow(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Restaurant Status" />

        <Card style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <View style={styles.statusSelector}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  restaurantStatus === option.value && styles.statusOptionActive,
                  { borderColor: option.color },
                ]}
                onPress={() => handleUpdateStatus(option.value)}
              >
                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                <Text
                  style={[
                    styles.statusOptionText,
                    restaurantStatus === option.value && styles.statusOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.windowCard}>
          <Text style={styles.windowLabel}>Next Available Window</Text>
          {editingWindow ? (
            <View style={styles.editWindow}>
              <Text style={styles.windowText}>{newWindow}</Text>
              <View style={styles.windowActions}>
                <Button
                  title="Save"
                  onPress={handleSaveWindow}
                  variant="primary"
                  style={styles.windowButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => setEditingWindow(false)}
                  variant="outline"
                  style={styles.windowButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.windowDisplay}>
              <Text style={styles.windowText}>{nextAvailableWindow || 'Not set'}</Text>
              <Button
                title="Update"
                onPress={() => setEditingWindow(true)}
                variant="outline"
                style={styles.updateButton}
              />
            </View>
          )}
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Requests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5 min</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
          </View>
        </Card>
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
  statusCard: {
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  statusOptionActive: {
    backgroundColor: '#F0F0F0',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  statusOptionTextActive: {
    fontWeight: '700',
  },
  windowCard: {
    marginBottom: 24,
  },
  windowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  windowDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    flex: 1,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editWindow: {
    gap: 12,
  },
  windowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  windowButton: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

