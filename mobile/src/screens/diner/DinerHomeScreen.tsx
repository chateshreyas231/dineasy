import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Restaurant } from '../../types';
import { listRestaurants } from '../../data/restaurants';
import * as Haptics from 'expo-haptics';

export const DinerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const quickChips = [
    { label: 'Date Night', cuisine: 'Romantic' },
    { label: 'Quiet', q: 'quiet restaurant' },
    { label: 'Live Music', q: 'restaurant live music' },
    { label: 'Outdoor Seating', q: 'restaurant outdoor seating' },
    { label: 'Romantic', cuisine: 'Romantic' },
    { label: 'Family Friendly', q: 'family friendly restaurant' },
  ];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async (filters?: { city?: string; cuisine?: string; q?: string }) => {
    setLoading(true);
    try {
      const results = await listRestaurants(filters);
      setRestaurants(results);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await loadRestaurants({ q: searchQuery });
    }
  };

  const handleChipPress = (chip: { label: string; cuisine?: string; q?: string }) => {
    if (chip.cuisine) {
      loadRestaurants({ cuisine: chip.cuisine });
    } else if (chip.q) {
      loadRestaurants({ q: chip.q });
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    (navigation as any).navigate('RestaurantDetail', { restaurant });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Minimalist Header - Grid, Circle with Arrow, Bookmark */}
        <View style={styles.header}>
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
              (navigation as any).navigate('AIAssistant');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="arrow-forward" size={16} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              (navigation as any).navigate('Watchlist');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.pageTitle}>BROWSE</Text>
            
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search restaurants..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.chipsContainer}>
                {quickChips.map((chip) => (
                  <TouchableOpacity
                    key={chip.label}
                    style={styles.chip}
                    onPress={() => handleChipPress(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.partySection}>
              <Text style={styles.partyLabel}>PARTY SIZE</Text>
              <View style={styles.partySelector}>
                {[1, 2, 4, 6, 8].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.partyButton,
                      partySize === size && styles.partyButtonActive,
                    ]}
                    onPress={() => setPartySize(size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.partyButtonText,
                        partySize === size && styles.partyButtonTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RESTAURANTS</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
              ) : restaurants.length > 0 ? (
                <View style={styles.restaurantsContainer}>
                  {restaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      onPress={() => handleRestaurantPress(restaurant)}
                      activeOpacity={0.9}
                    >
                      <Card variant="default" style={styles.restaurantCard} interactive>
                        {restaurant.imageUrl && (
                          <Image
                            source={{ uri: restaurant.imageUrl }}
                            style={styles.restaurantImage}
                          />
                        )}
                        <View style={styles.restaurantContent}>
                          <Text style={styles.restaurantName}>{restaurant.name}</Text>
                          <View style={styles.restaurantMeta}>
                            <Text style={styles.restaurantCode}>
                              {restaurant.id?.toString().padStart(3, '0') || '000'} RESTAURANT
                            </Text>
                            <Text style={styles.restaurantDetails}>
                              {restaurant.cuisine} • {restaurant.rating}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No restaurants found</Text>
                </View>
              )}
            </View>
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={24} color={colors.text.primary} />
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
  mainContent: {
    padding: spacing.lg,
  },
  pageTitle: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xl,
  },
  searchSection: {
    marginBottom: spacing.xl,
  },
  searchInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.secondary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partySection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  partyLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text.muted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  partySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  partyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  partyButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  partyButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantsContainer: {
    gap: spacing.lg,
  },
  restaurantCard: {
    marginBottom: 0,
    overflow: 'hidden',
    padding: 0,
  },
  restaurantImage: {
    width: '100%',
    height: 280,
    marginBottom: 0,
    borderRadius: 0,
  },
  restaurantContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  restaurantName: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  restaurantMeta: {
    gap: spacing.xs,
  },
  restaurantCode: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '400',
  },
  restaurantDetails: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '400',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
  },
});
