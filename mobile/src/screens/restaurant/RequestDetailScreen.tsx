import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function RequestDetailScreen() {
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };
  const requests = useAppStore((state) => state.requests);
  const updateRequest = useAppStore((state) => state.updateRequest);
  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Request not found</Text>
      </SafeAreaView>
    );
  }

  const handleConfirm = (time?: string) => {
    updateRequest(requestId, {
      status: 'confirmed',
      timeWindow: time || request.timeWindow,
    });
  };

  const handleOfferAlternate = () => {
    updateRequest(requestId, {
      status: 'alternate',
      alternateTimes: ['7:30 PM - 8:30 PM', '8:45 PM - 9:45 PM'],
    });
  };

  const handleDecline = () => {
    updateRequest(requestId, { status: 'declined' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.restaurantName}>{request.restaurantName}</Text>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color="#FF6B6B" />
              <Text style={styles.detailText}>Party of {request.partySize}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#FF6B6B" />
              <Text style={styles.detailText}>Requested: {request.timeWindow}</Text>
            </View>
            {request.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Special Notes:</Text>
                <Text style={styles.notesText}>{request.notes}</Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Replies</Text>
          <View style={styles.quickReplies}>
            <Button
              title="Confirm for 7:30 PM"
              onPress={() => handleConfirm('7:30 PM - 8:30 PM')}
              variant="primary"
              fullWidth
              style={styles.replyButton}
            />
            <Button
              title="Confirm for 8:00 PM"
              onPress={() => handleConfirm('8:00 PM - 9:00 PM')}
              variant="primary"
              fullWidth
              style={styles.replyButton}
            />
            <Button
              title="Offer Alternative Times"
              onPress={handleOfferAlternate}
              variant="secondary"
              fullWidth
              style={styles.replyButton}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title="Confirm Request"
            onPress={() => handleConfirm()}
            variant="primary"
            fullWidth
            style={styles.actionButton}
          />
          <Button
            title="Decline Request"
            onPress={handleDecline}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
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
  card: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  quickReplies: {
    gap: 12,
  },
  replyButton: {
    marginBottom: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
});

