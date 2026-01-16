import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing, radius } from '../../theme';
import { listRestaurantPendingRequests, setRequestStatus, Request } from '../../data/requests';
import { TableRequest } from '../../types';
import * as Haptics from 'expo-haptics';

// Extract radius values to constants for StyleSheet
const badgeRadius = radius.sm;

// Map API Request to UI TableRequest
const mapRequestToTableRequest = (request: Request & { restaurants?: { name: string } }): TableRequest => ({
  id: request.id,
  restaurantId: request.restaurant_id,
  restaurantName: request.restaurants?.name || 'Unknown Restaurant',
  dateTime: new Date(request.datetime),
  partySize: request.party_size,
  status: request.status.toLowerCase() as 'pending' | 'confirmed' | 'declined' | 'cancelled',
  notes: request.notes || undefined,
});

export const RequestsInboxScreen: React.FC = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState<TableRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const data = await listRestaurantPendingRequests();
      const mappedRequests = data.map(mapRequestToTableRequest);
      setRequests(mappedRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const handleAccept = async (requestId: string) => {
    // Optimistic update
    setRequests((prev) =>
      prev.filter((r) => r.id !== requestId)
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // API call
    await setRequestStatus(requestId, 'ACCEPTED');
    // Reload to ensure sync
    loadRequests();
  };

  const handleDecline = async (requestId: string) => {
    // Optimistic update
    setRequests((prev) =>
      prev.filter((r) => r.id !== requestId)
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // API call
    await setRequestStatus(requestId, 'DECLINED');
    // Reload to ensure sync
    loadRequests();
  };

  const handleViewDetail = (request: TableRequest) => {
    navigation.navigate('RequestDetail' as never, { request } as never);
  };

  if (!loading && requests.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <EmptyState
            icon="mail-outline"
            title="No Pending Requests"
            message="Table requests from diners will appear here"
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Requests</Text>
          <Text style={styles.subtitle}>{requests.length} pending request{requests.length !== 1 ? 's' : ''}</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {requests.map((request) => (
            <TouchableOpacity
              key={request.id}
              onPress={() => handleViewDetail(request)}
              activeOpacity={0.7}
            >
              <Card style={styles.card}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.restaurantName}</Text>
                    <Text style={styles.requestDetails}>
                      {request.partySize} guest{request.partySize !== 1 ? 's' : ''} • {new Date(request.dateTime).toLocaleString()}
                    </Text>
                    {request.notes && (
                      <Text style={styles.requestNotes} numberOfLines={2}>
                        {request.notes}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    title="Accept"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAccept(request.id);
                    }}
                    variant="primary"
                    size="sm"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Decline"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDecline(request.id);
                    }}
                    variant="secondary"
                    size="sm"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.elegant,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  requestInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  requestName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  requestDetails: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  requestNotes: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: badgeRadius,
  },
  statusPending: {
    backgroundColor: colors.status.warning + '20',
  },
  statusText: {
    ...typography.caption,
    color: colors.status.warning,
    fontWeight: '600',
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
