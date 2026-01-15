import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import * as Haptics from 'expo-haptics';

export const RequestStatusScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateRequest } = useAppStore();
  const request = (route.params as any)?.request as TableRequest;
  const status = request?.status || 'pending';

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
