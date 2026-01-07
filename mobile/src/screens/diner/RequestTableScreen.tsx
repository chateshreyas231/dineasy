import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';

export function RequestTableScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId: string };
  const addRequest = useAppStore((state) => state.addRequest);
  const currentIntent = useAppStore((state) => state.currentIntent);
  const [timeWindow, setTimeWindow] = useState('7:00 PM - 8:00 PM');
  const [notes, setNotes] = useState('');

  const handleSendRequest = () => {
    const request = {
      id: `req-${Date.now()}`,
      restaurantId,
      restaurantName: 'Restaurant', // Would get from restaurant data
      partySize: currentIntent?.partySize || 2,
      timeWindow,
      notes: notes || undefined,
      status: 'sent' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addRequest(request);
    (navigation as any).navigate('RequestStatus', { requestId: request.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Request Table" subtitle="Hold a table for your party" />

        <Card style={styles.card}>
          <Text style={styles.label}>Time Window</Text>
          <View style={styles.timeWindowContainer}>
            <Text style={styles.timeWindowText}>{timeWindow}</Text>
            <Text style={styles.timeWindowHint}>Tap to adjust</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Special Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g., quiet corner, candlelight, window seat..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#7F8C8D"
            multiline
            numberOfLines={4}
          />
        </Card>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your request will be sent to the restaurant. They'll respond with a confirmation or alternative times.
          </Text>
        </View>

        <Button
          title="Send Request"
          onPress={handleSendRequest}
          variant="primary"
          fullWidth
        />
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  timeWindowContainer: {
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeWindowText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  timeWindowHint: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#E8F4F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
});

