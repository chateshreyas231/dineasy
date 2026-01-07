import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RequestStatus } from '../../types';

export function RequestStatusScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };
  const requests = useAppStore((state) => state.requests);
  const updateRequest = useAppStore((state) => state.updateRequest);
  const request = requests.find((r) => r.id === requestId);
  const [status, setStatus] = useState<RequestStatus>(request?.status || 'sent');

  useEffect(() => {
    if (!request) return;

    // Simulate status progression
    const timers: NodeJS.Timeout[] = [];

    if (status === 'sent') {
      const timer1 = setTimeout(() => {
        setStatus('seen');
        updateRequest(requestId, { status: 'seen' });
      }, 2000);
      timers.push(timer1);
    }

    if (status === 'seen') {
      const timer2 = setTimeout(() => {
        // Randomly choose confirmed, alternate, or declined
        const outcomes: RequestStatus[] = ['confirmed', 'alternate', 'declined'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setStatus(outcome);
        if (outcome === 'alternate') {
          updateRequest(requestId, {
            status: 'alternate',
            alternateTimes: ['7:30 PM - 8:30 PM', '8:45 PM - 9:45 PM'],
          });
        } else {
          updateRequest(requestId, { status: outcome });
        }
      }, 3000);
      timers.push(timer2);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [status, requestId, updateRequest]);

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Request not found</Text>
      </SafeAreaView>
    );
  }

  const getStatusIcon = (statusStep: string) => {
    if (statusStep === 'sent') {
      return status === 'sent' ? 'checkmark-circle' : 'checkmark-circle';
    }
    if (statusStep === 'seen') {
      if (status === 'sent') return 'ellipse-outline';
      return 'checkmark-circle';
    }
    if (statusStep === 'confirmed') {
      if (['sent', 'seen'].includes(status)) return 'ellipse-outline';
      if (status === 'confirmed') return 'checkmark-circle';
      return 'close-circle';
    }
    return 'ellipse-outline';
  };

  const getStatusColor = (statusStep: string) => {
    if (statusStep === 'sent') return status === 'sent' ? '#FF6B6B' : '#4ECDC4';
    if (statusStep === 'seen') {
      if (status === 'sent') return '#E0E0E0';
      return status === 'seen' ? '#FF6B6B' : '#4ECDC4';
    }
    if (statusStep === 'confirmed') {
      if (['sent', 'seen'].includes(status)) return '#E0E0E0';
      if (status === 'confirmed') return '#4ECDC4';
      return '#FF6B6B';
    }
    return '#E0E0E0';
  };

  const handleAcceptAlternate = (time: string) => {
    updateRequest(requestId, { status: 'confirmed', timeWindow: time });
    setStatus('confirmed');
  };

  const handleDeclineAlternate = () => {
    updateRequest(requestId, { status: 'declined' });
    setStatus('declined');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.restaurantName}>{request.restaurantName}</Text>
          <Text style={styles.details}>
            Party of {request.partySize} • {request.timeWindow}
          </Text>
          {request.notes && <Text style={styles.notes}>Notes: {request.notes}</Text>}
        </Card>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <Ionicons
              name={getStatusIcon('sent') as any}
              size={24}
              color={getStatusColor('sent')}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Request Sent</Text>
              <Text style={styles.timelineTime}>Just now</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Ionicons
              name={getStatusIcon('seen') as any}
              size={24}
              color={getStatusColor('seen')}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Restaurant Seen</Text>
              <Text style={styles.timelineTime}>
                {status !== 'sent' ? 'A moment ago' : 'Waiting...'}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Ionicons
              name={getStatusIcon('confirmed') as any}
              size={24}
              color={getStatusColor('confirmed')}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>
                {status === 'confirmed'
                  ? 'Confirmed!'
                  : status === 'alternate'
                  ? 'Alternate Times Offered'
                  : status === 'declined'
                  ? 'Declined'
                  : 'Waiting for Response'}
              </Text>
              <Text style={styles.timelineTime}>
                {status === 'confirmed'
                  ? 'Table held for you'
                  : status === 'alternate'
                  ? 'Choose a time below'
                  : status === 'declined'
                  ? 'Try another restaurant'
                  : '...'}
              </Text>
            </View>
          </View>
        </View>

        {status === 'alternate' && request.alternateTimes && (
          <Card style={styles.alternateCard}>
            <Text style={styles.alternateTitle}>Available Times:</Text>
            {request.alternateTimes.map((time, index) => (
              <View key={index} style={styles.alternateOption}>
                <Text style={styles.alternateTime}>{time}</Text>
                <Button
                  title="Accept"
                  onPress={() => handleAcceptAlternate(time)}
                  variant="primary"
                  style={styles.alternateButton}
                />
              </View>
            ))}
            <Button
              title="Decline"
              onPress={handleDeclineAlternate}
              variant="outline"
              fullWidth
            />
          </Card>
        )}

        {status === 'confirmed' && (
          <Card style={styles.confirmedCard}>
            <Text style={styles.confirmedTitle}>Hold expires in 10 min</Text>
            <Text style={styles.confirmedText}>
              Your table is confirmed for {request.timeWindow}. Please arrive on time.
            </Text>
            <Button
              title="Confirm & View Details"
              onPress={() => {
                // Navigate to plan or details
                navigation.goBack();
              }}
              variant="primary"
              fullWidth
            />
          </Card>
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
  card: {
    marginBottom: 24,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  alternateCard: {
    marginBottom: 24,
  },
  alternateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  alternateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  alternateTime: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  alternateButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  confirmedCard: {
    marginBottom: 24,
    backgroundColor: '#E8F5E9',
  },
  confirmedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  confirmedText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
    lineHeight: 24,
  },
});

