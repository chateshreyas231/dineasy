import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function RequestsInboxScreen() {
  const navigation = useNavigation();
  const requests = useAppStore((state) => state.requests);
  const updateRequest = useAppStore((state) => state.updateRequest);

  const pendingRequests = requests.filter((r) => r.status === 'sent' || r.status === 'seen');

  const handleConfirm = (requestId: string) => {
    updateRequest(requestId, { status: 'confirmed' });
  };

  const handleOfferAlternate = (requestId: string) => {
    updateRequest(requestId, {
      status: 'alternate',
      alternateTimes: ['7:30 PM - 8:30 PM', '8:45 PM - 9:45 PM'],
    });
  };

  const handleDecline = (requestId: string) => {
    updateRequest(requestId, { status: 'declined' });
  };

  if (pendingRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptyText}>
            New table requests will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{pendingRequests.length} Pending Request{pendingRequests.length !== 1 ? 's' : ''}</Text>

        {pendingRequests.map((request) => (
          <Card key={request.id} style={styles.requestCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('RequestDetail' as never, { requestId: request.id } as never)}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.restaurantName}>{request.restaurantName}</Text>
                <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
              </View>
              <View style={styles.requestDetails}>
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
                    <Text style={styles.detailText} numberOfLines={1}>{request.notes}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <Button
                title="Confirm"
                onPress={() => handleConfirm(request.id)}
                variant="primary"
                style={styles.actionButton}
              />
              <Button
                title="Alternate"
                onPress={() => handleOfferAlternate(request.id)}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title="Decline"
                onPress={() => handleDecline(request.id)}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </Card>
        ))}
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
  requestCard: {
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  requestDetails: {
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
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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

