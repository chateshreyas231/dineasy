import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius } from '../../theme';
import { Restaurant } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { restaurantApi, bookingApi } from '../../utils/api';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

export const RestaurantDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addToWatchlist, watchlist, user, setCurrentPlan } = useAppStore();
  const restaurant = (route.params as any)?.restaurant as Restaurant;
  const [loading, setLoading] = useState(false);

  const isInWatchlist = restaurant ? watchlist.some((r) => r.id === restaurant.id) : false;

  if (!restaurant) {
    return null;
  }

  const handleAddToWatchlist = () => {
    if (!isInWatchlist) {
      addToWatchlist(restaurant);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleBookNow = async () => {
    if (!restaurant.bookingLink) {
      // Request table through app
      navigation.navigate('RequestTable' as never, { restaurant } as never);
      return;
    }

    setLoading(true);
    try {
      // Open booking link in browser
      await WebBrowser.openBrowserAsync(restaurant.bookingLink);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error opening booking link:', error);
    } finally {
      setLoading(false);
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
          {restaurant.imageUrl && (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
          )}

          <Card style={styles.card}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.meta}>
              <View style={styles.rating}>
                <Ionicons name="star" size={20} color={colors.accent.gold} />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
              <Text style={styles.location}>{restaurant.location}</Text>
            </View>
          </Card>

          {restaurant.highlights && restaurant.highlights.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {restaurant.highlights.map((highlight, idx) => (
                <View key={idx} style={styles.highlight}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </Card>
          )}

          {restaurant.bestTimes && restaurant.bestTimes.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Best Times</Text>
              <View style={styles.timesContainer}>
                {restaurant.bestTimes.map((time, idx) => (
                  <View key={idx} style={styles.timeChip}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleAddToWatchlist}
              style={[styles.watchlistButton, isInWatchlist && styles.watchlistButtonActive]}
            >
              <Ionicons
                name={isInWatchlist ? "heart" : "heart-outline"}
                size={24}
                color={isInWatchlist ? colors.status.error : colors.text.muted}
              />
            </TouchableOpacity>
            <Button
              title={restaurant.bookingLink ? "Book Now" : "Request Table"}
              onPress={handleBookNow}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.button}
            />
          </View>
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
  image: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  name: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cuisine: {
    ...typography.body,
    color: colors.text.muted,
  },
  location: {
    ...typography.body,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightText: {
    ...typography.body,
    color: colors.text.primary,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  timeText: {
    ...typography.body,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  watchlistButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  watchlistButtonActive: {
    backgroundColor: colors.primary.glow,
    borderColor: colors.primary.main,
  },
  button: {
    flex: 1,
    marginTop: 0,
  },
});
