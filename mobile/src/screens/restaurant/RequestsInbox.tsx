import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/Chip';
import { colors, typography, spacing, radius, gradients, shadows } from '../../theme';
import { listRestaurantRequests, Request } from '../../services/api/requests';
import { useProfileStore } from '../../store/useProfileStore';
import { supabase } from '../../lib/supabase';
import { Restaurant } from '../../types/supabase';
import * as Haptics from 'expo-haptics';

/**
 * Extract dietary and allergy tags from preferences_snapshot
 */
function extractPreferenceTags(preferencesSnapshot: any): string[] {
  if (!preferencesSnapshot) return [];
  
  const tags: string[] = [];
  
  // Extract dietary preferences
  if (preferencesSnapshot.dietary && Array.isArray(preferencesSnapshot.dietary)) {
    tags.push(...preferencesSnapshot.dietary);
  }
  
  // Extract allergies
  if (preferencesSnapshot.allergies && Array.isArray(preferencesSnapshot.allergies)) {
    tags.push(...preferencesSnapshot.allergies);
  }
  
  // Extract other preference fields
  if (preferencesSnapshot.dietary_restrictions && Array.isArray(preferencesSnapshot.dietary_restrictions)) {
    tags.push(...preferencesSnapshot.dietary_restrictions);
  }
  
  return tags;
}

/**
 * Format time window for display
 */
function formatTimeWindow(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startTime = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  const dateStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  return `${dateStr} • ${startTime} - ${endTime}`;
}

export const RequestsInbox: React.FC = () => {
  const navigation = useNavigation();
  const { profile } = useProfileStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find restaurant for logged-in owner
  const findRestaurant = useCallback(async () => {
    if (!profile?.id) {
      setError('Profile not loaded');
      return;
    }

    try {
      const { data, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_user_id', profile.id)
        .single();

      if (restaurantError) {
        if (restaurantError.code === 'PGRST116') {
          setError('No restaurant found for this account');
        } else {
          setError(`Failed to find restaurant: ${restaurantError.message}`);
        }
        return;
      }

      setRestaurant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find restaurant');
    }
  }, [profile]);

  // Load pending requests
  const loadRequests = useCallback(async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await listRestaurantRequests(restaurant.id, 'pending');
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurant]);

  useEffect(() => {
    findRestaurant();
  }, [findRestaurant]);

  useEffect(() => {
    if (restaurant) {
      loadRequests();
    }
  }, [restaurant, loadRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const handleRequestPress = (request: Request) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RequestDetails' as never, { request } as never);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error && !restaurant) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <EmptyState
            icon="alert-circle-outline"
            title="Error"
            message={error}
          />
        </SafeAreaView>
      </View>
    );
  }

  // Empty state
  if (!loading && requests.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>REQUESTS</Text>
          <Text style={styles.subtitle}>Pending requests from diners</Text>
        </View>
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
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>REQUESTS</Text>
          <Text style={styles.subtitle}>
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {requests.map((request) => {
            const tags = extractPreferenceTags(request.preferences_snapshot);
            return (
              <TouchableOpacity
                key={request.id}
                onPress={() => handleRequestPress(request)}
                activeOpacity={0.7}
              >
                <Card variant="glass3d" style={styles.card} interactive>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.partySize}>
                        {request.party_size} guest{request.party_size !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.timeWindow}>
                        {formatTimeWindow(request.time_window_start, request.time_window_end)}
                      </Text>
                      {request.notes && (
                        <Text style={styles.notes} numberOfLines={2}>
                          {request.notes}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, styles.statusPending]}>
                      <Text style={styles.statusText}>Pending</Text>
                    </View>
                  </View>
                  {tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {tags.slice(0, 5).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          style={styles.tag}
                        />
                      ))}
                      {tags.length > 5 && (
                        <Text style={styles.moreTags}>+{tags.length - 5} more</Text>
                      )}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.muted,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
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
  errorBanner: {
    backgroundColor: colors.status.error + '20',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
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
  partySize: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timeWindow: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  notes: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  moreTags: {
    ...typography.caption,
    color: colors.text.muted,
    alignSelf: 'center',
    marginLeft: spacing.xs,
  },
});
