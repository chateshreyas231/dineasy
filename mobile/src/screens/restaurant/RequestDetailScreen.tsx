import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { TableRequest } from '../../types';
import * as Haptics from 'expo-haptics';

// Extract radius values to constants for StyleSheet
const statusBadgeRadius = radius.sm;

export const RequestDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateRequest } = useAppStore();
  const request = (route.params as any)?.request as TableRequest;

  if (!request) {
    return null;
  }

  const handleAccept = () => {
    updateRequest(request.id, { status: 'confirmed' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleDecline = () => {
    updateRequest(request.id, { status: 'declined' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };
  const getStatusColor = () => {
    switch (request.status) {
      case 'confirmed':
        return colors.status.success;
      case 'declined':
        return colors.status.error;
      case 'cancelled':
        return colors.text.muted;
      default:
        return colors.status.warning;
    }
  };

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
          <Text style={styles.title}>Request Details</Text>

          <Card style={styles.card}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Reservation Details</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
            </View>
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
              <Text style={styles.detailValue}>{request.partySize} guest{request.partySize !== 1 ? 's' : ''}</Text>
            </View>
            {request.notes && (
              <View style={styles.notesRow}>
                <Text style={styles.detailLabel}>Special Requests:</Text>
                <Text style={styles.detailValue}>{request.notes}</Text>
              </View>
            )}
          </Card>

          {request.status === 'pending' && (
            <View style={styles.actions}>
              <Button
                title="Accept Request"
                onPress={handleAccept}
                variant="primary"
                size="lg"
                style={styles.button}
              />
              <Button
                title="Decline Request"
                onPress={handleDecline}
                variant="secondary"
                size="lg"
                style={styles.button}
              />
            </View>
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
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: statusBadgeRadius,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  notesRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
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
  actions: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
