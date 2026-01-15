import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { TableRequest } from '../../types';
import * as Haptics from 'expo-haptics';

// Extract radius values to constants for StyleSheet
const badgeRadius = radius.sm;

export const RequestsInboxScreen: React.FC = () => {
  const navigation = useNavigation();
  const { requests, updateRequest } = useAppStore();
  
  // Filter to show only pending requests
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleAccept = (requestId: string) => {
    updateRequest(requestId, { status: 'confirmed' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDecline = (requestId: string) => {
    updateRequest(requestId, { status: 'declined' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleViewDetail = (request: TableRequest) => {
    navigation.navigate('RequestDetail' as never, { request } as never);
  };

  if (pendingRequests.length === 0) {
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
          <Text style={styles.subtitle}>{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {pendingRequests.map((request) => (
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
