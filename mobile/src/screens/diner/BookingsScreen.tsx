/**
 * Bookings Screen - Shows all bookings with statuses
 */

import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius, gradients, shadows } from '../../theme';
import { bookingApi } from '../../utils/api';
import * as Haptics from 'expo-haptics';

const cardBorderRadius = radius.xl;
const badgeRadius = radius.sm;

interface Booking {
  id: string;
  placeId?: string;
  restaurantName: string;
  restaurantAddress?: string;
  datetime: string;
  partySize: number;
  provider: string;
  status: string;
  bookingUrl?: string;
  confirmation?: any;
}

export const BookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.list();
      if (response.data?.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return colors.status.success;
      case 'PENDING_EXTERNAL':
        return colors.status.warning;
      case 'MONITORING':
        return colors.status.info;
      case 'CANCELLED':
        return colors.text.muted;
      case 'FAILED':
        return colors.status.error;
      default:
        return colors.text.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'checkmark-circle';
      case 'PENDING_EXTERNAL':
        return 'time';
      case 'MONITORING':
        return 'search';
      case 'CANCELLED':
        return 'close-circle';
      case 'FAILED':
        return 'alert-circle';
      default:
        return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.datetime) >= new Date() && b.status !== 'CANCELLED'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.datetime) < new Date() || b.status === 'CANCELLED'
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.soft as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {upcomingBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcomingBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Navigate to booking detail
                  }}
                  activeOpacity={0.7}
                >
                  <Card variant="glass3d" style={styles.bookingCard} interactive>
                    <View style={styles.bookingHeader}>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.restaurantName}>{booking.restaurantName}</Text>
                        <Text style={styles.bookingDetails}>
                          {formatDate(booking.datetime)} • {formatTime(booking.datetime)}
                        </Text>
                        <Text style={styles.bookingDetails}>
                          Party of {booking.partySize}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(booking.status) + '20' },
                        ]}
                      >
                        <Ionicons
                          name={getStatusIcon(booking.status) as any}
                          size={16}
                          color={getStatusColor(booking.status)}
                        />
                        <Text
                          style={[styles.statusText, { color: getStatusColor(booking.status) }]}
                        >
                          {booking.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    {booking.status === 'MONITORING' && (
                      <View style={styles.monitoringIndicator}>
                        <Ionicons name="search" size={14} color={colors.status.info} />
                        <Text style={styles.monitoringText}>
                          Checking for availability...
                        </Text>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {pastBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past</Text>
              {pastBookings.map((booking) => (
                <Card key={booking.id} variant="glass" style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.restaurantName}>{booking.restaurantName}</Text>
                      <Text style={styles.bookingDetails}>
                        {formatDate(booking.datetime)} • {formatTime(booking.datetime)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(booking.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(booking.status) }]}
                      >
                        {booking.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {bookings.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.text.muted} />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubtext}>
                Start browsing restaurants to make your first booking
              </Text>
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
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bookingCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingInfo: {
    flex: 1,
  },
  restaurantName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bookingDetails: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs / 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: badgeRadius,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  monitoringIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.status.info + '10',
    borderRadius: radius.sm,
  },
  monitoringText: {
    ...typography.bodySmall,
    color: colors.status.info,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
