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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { colors, typography, spacing, radius, shadows } from '../../theme';
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
      navigation.navigate('RequestTable' as never, { restaurant_id: restaurant.id } as never);
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
      <SafeAreaView style={styles.safeArea}>
        {/* Minimalist Header - Colon icon, Logo, Bookmark */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLogo}>DINEASY</Text>
          </View>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleAddToWatchlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInWatchlist ? "bookmark" : "bookmark-outline"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Image */}
          {restaurant.imageUrl && (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
          )}

          {/* Product Information */}
          <View style={styles.productInfo}>
            <Text style={styles.productCode}>
              {restaurant.id?.toString().padStart(3, '0') || '000'} RESTAURANT
            </Text>
            <Text style={styles.productName}>{restaurant.name}</Text>
            <Text style={styles.productDetails}>
              {restaurant.cuisine} • {restaurant.rating} • {restaurant.location}
            </Text>
          </View>

          {/* Color/Options Selector - Using small circles */}
          <View style={styles.optionsContainer}>
            {[1, 2, 3].map((option) => (
              <View key={option} style={styles.optionCircle} />
            ))}
          </View>

          {/* Details Section */}
          {restaurant.highlights && restaurant.highlights.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>FEATURES</Text>
              <View style={styles.detailsContent}>
                {restaurant.highlights.map((highlight, idx) => (
                  <Text key={idx} style={styles.detailText}>
                    {highlight}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {restaurant.bestTimes && restaurant.bestTimes.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>BEST TIMES</Text>
              <View style={styles.timesContainer}>
                {restaurant.bestTimes.map((time, idx) => (
                  <View key={idx} style={styles.timeChip}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Button */}
          <View style={styles.actionSection}>
            <Button
              title={restaurant.bookingLink ? "BOOK NOW" : "REQUEST TABLE"}
              onPress={handleBookNow}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.button}
              uppercase
            />
          </View>
        </ScrollView>

        {/* Footer with same header pattern */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerCenterIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="arrow-forward" size={16} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleAddToWatchlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInWatchlist ? "bookmark" : "bookmark-outline"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  headerCenterIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 400,
    marginBottom: 0,
    backgroundColor: colors.background.secondary,
  },
  productInfo: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  productCode: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  productName: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  productDetails: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '400',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  optionCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.medium,
  },
  detailsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.lg,
  },
  detailsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '500',
  },
  detailsContent: {
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '400',
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '400',
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  button: {
    width: '100%',
  },
});
