import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing, gradients, shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { bookingApi } from '../../utils/api';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';

export const TonightPlanScreen: React.FC = () => {
  const { currentPlan, setCurrentPlan } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load bookings on mount
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingApi.list();
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Set the most recent/upcoming booking as current plan
        const bookings = response.data as any[];
        const upcoming = bookings
          .filter((b: any) => new Date(b.dateTime) >= new Date())
          .sort((a: any, b: any) => 
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          )[0];
        if (upcoming) {
          setCurrentPlan({
            id: upcoming.id,
            restaurantId: upcoming.restaurantId,
            restaurantName: upcoming.restaurantName,
            dateTime: new Date(upcoming.dateTime),
            partySize: upcoming.partySize,
            status: upcoming.status,
            bookingLink: upcoming.bookingLink,
            provider: upcoming.provider,
          });
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleViewBooking = async () => {
    if (currentPlan?.bookingLink) {
      setLoading(true);
      try {
        await WebBrowser.openBrowserAsync(currentPlan.bookingLink);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error opening booking:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (currentPlan?.id) {
      setLoading(true);
      try {
        await bookingApi.cancel(currentPlan.id);
        setCurrentPlan(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!currentPlan) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <EmptyState
            icon="calendar-outline"
            title="No Plans Tonight"
            message="Book a table to see your reservation here"
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Tonight's Plan</Text>

          <Card variant="glass3d" style={styles.card}>
            <Text style={styles.restaurantName}>{currentPlan.restaurantName}</Text>
            <View style={styles.details}>
              <Text style={styles.detail}>
                {new Date(currentPlan.dateTime).toLocaleString()}
              </Text>
              <Text style={styles.detail}>
                Party of {currentPlan.partySize}
              </Text>
            </View>
            <View style={styles.actions}>
              {currentPlan.bookingLink && (
                <Button
                  title="View Booking"
                  onPress={handleViewBooking}
                  variant="primary"
                  size="md"
                  loading={loading}
                  style={styles.button}
                />
              )}
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                size="md"
                loading={loading}
                style={styles.button}
              />
            </View>
          </Card>
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
    fontWeight: '700',
  },
  card: {
    marginBottom: spacing.lg,
  },
  restaurantName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  details: {
    marginBottom: spacing.md,
  },
  detail: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
