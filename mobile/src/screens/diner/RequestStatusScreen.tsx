import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TableRequest } from '../../types';
import { getRequest, Request } from '../../data/requests';
import * as Haptics from 'expo-haptics';

export const RequestStatusScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateRequest } = useAppStore();
  const initialRequest = (route.params as any)?.request as TableRequest;
  const [request, setRequest] = useState<TableRequest | null>(initialRequest);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const status = request?.status || 'pending';

  // Convert API Request to TableRequest format
  const convertRequestToTableRequest = (apiRequest: Request, existingRequest?: TableRequest): TableRequest => {
    return {
      id: apiRequest.id,
      restaurantId: apiRequest.restaurant_id,
      restaurantName: existingRequest?.restaurantName || 'Restaurant',
      dateTime: new Date(apiRequest.datetime),
      partySize: apiRequest.party_size,
      status: apiRequest.status as 'pending' | 'confirmed' | 'declined' | 'cancelled',
      notes: apiRequest.notes || undefined,
    };
  };

  // Poll for request status updates
  useEffect(() => {
    if (!request || !request.id) {
      return;
    }

    // Only poll if status is pending
    if (status !== 'pending') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const pollRequestStatus = async () => {
      setIsLoading(true);
      try {
        const updatedRequest = await getRequest(request.id);
        if (updatedRequest) {
          const tableRequest = convertRequestToTableRequest(updatedRequest, request);
          setRequest(tableRequest);
          updateRequest(request.id, { status: tableRequest.status });

          // Stop polling if status changed to confirmed or declined
          if (tableRequest.status === 'confirmed' || tableRequest.status === 'declined') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsPolling(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      } catch (error) {
        console.error('Error polling request status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll immediately, then every 5 seconds
    pollRequestStatus();
    pollingIntervalRef.current = setInterval(pollRequestStatus, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [request?.id, status]);

  if (!request) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return { name: 'checkmark-circle', color: colors.status.success };
      case 'declined':
        return { name: 'close-circle', color: colors.status.error };
      default:
        return { name: 'time-outline', color: colors.status.warning };
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'confirmed':
        return 'Request Confirmed';
      case 'declined':
        return 'Request Declined';
      default:
        return 'Request Pending';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'confirmed':
        return 'Your table request has been confirmed by the restaurant!';
      case 'declined':
        return 'Unfortunately, the restaurant could not accommodate your request.';
      default:
        return 'Your table request is being reviewed by the restaurant.';
    }
  };

  const handleCancel = () => {
    if (request) {
      updateRequest(request.id, { status: 'cancelled' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.goBack();
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statusContainer}>
            <Ionicons
              name={statusIcon.name as any}
              size={64}
              color={statusIcon.color}
            />
            <Text style={styles.statusTitle}>{getStatusTitle()}</Text>
            <Text style={styles.statusMessage}>
              {getStatusMessage()}
            </Text>
            {isPolling && (
              <View style={styles.pollingIndicator}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.pollingText}>
                  {isLoading ? 'Checking status...' : 'Checking for updates...'}
                </Text>
              </View>
            )}
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Request Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Restaurant:</Text>
              <Text style={styles.detailValue}>{request.restaurantName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>
                {new Date(request.dateTime).toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Party Size:</Text>
              <Text style={styles.detailValue}>{request.partySize} guests</Text>
            </View>
            {request.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailValue}>{request.notes}</Text>
              </View>
            )}
          </Card>

          {status === 'pending' && (
            <Button
              title="Cancel Request"
              onPress={handleCancel}
              variant="secondary"
              size="lg"
              style={styles.button}
            />
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statusTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusMessage: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  pollingText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  card: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.muted,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  button: {
    width: '100%',
  },
});
