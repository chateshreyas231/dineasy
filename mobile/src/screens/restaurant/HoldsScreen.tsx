import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function HoldsScreen() {
  const requests = useAppStore((state) => state.requests);
  const updateRequest = useAppStore((state) => state.updateRequest);
  const confirmedRequests = requests.filter((r) => r.status === 'confirmed');
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining: Record<string, number> = {};
      confirmedRequests.forEach((request) => {
        const createdAt = request.createdAt.getTime();
        const elapsed = now - createdAt;
        const remainingMs = 10 * 60 * 1000 - elapsed; // 10 minutes
        remaining[request.id] = Math.max(0, Math.floor(remainingMs / 1000));
      });
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmedRequests]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMarkSeated = (requestId: string) => {
    // In real app, this would mark the table as seated
    updateRequest(requestId, { status: 'confirmed' }); // Keep as confirmed but mark seated
  };

  const handleCancelHold = (requestId: string) => {
    updateRequest(requestId, { status: 'declined' });
  };

  if (confirmedRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Active Holds</Text>
          <Text style={styles.emptyText}>
            Confirmed table requests will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Active Holds ({confirmedRequests.length})</Text>

        {confirmedRequests.map((request) => {
          const remaining = timeRemaining[request.id] || 0;
          const isExpired = remaining === 0;

          return (
            <Card key={request.id} style={[styles.holdCard, isExpired && styles.holdCardExpired]}>
              <View style={styles.holdHeader}>
                <Text style={styles.holdRestaurantName}>{request.restaurantName}</Text>
                <View style={[styles.timer, isExpired && styles.timerExpired]}>
                  <Ionicons name="time" size={16} color={isExpired ? '#FF6B6B' : '#4ECDC4'} />
                  <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
                    {isExpired ? 'Expired' : formatTime(remaining)}
                  </Text>
                </View>
              </View>

              <View style={styles.holdDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color="#7F8C8D" />
                  <Text style={styles.detailText}>Party of {request.partySize}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color="#7F8C8D" />
                  <Text style={styles.detailText}>{request.timeWindow}</Text>
                </View>
                {request.notes && (
                  <View style={styles.detailRow}>
                    <Ionicons name="chatbubble-outline" size={16} color="#7F8C8D" />
                    <Text style={styles.detailText}>{request.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.holdActions}>
                <Button
                  title="Mark Seated"
                  onPress={() => handleMarkSeated(request.id)}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="Cancel Hold"
                  onPress={() => handleCancelHold(request.id)}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          );
        })}
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
  holdCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  holdCardExpired: {
    borderLeftColor: '#FF6B6B',
    opacity: 0.7,
  },
  holdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  holdRestaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  timerExpired: {
    backgroundColor: '#FFEBEE',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  timerTextExpired: {
    color: '#FF6B6B',
  },
  holdDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  holdActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});

