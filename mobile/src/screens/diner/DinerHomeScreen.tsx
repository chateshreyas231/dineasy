import React, { useState, useEffect, useMemo } from 'react';
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
import { FilterModal } from '../../components/FilterModal';
import { PlatformBadges } from '../../components/PlatformBadge';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Restaurant } from '../../types';
import { listRestaurants, listRestaurantsFromSupabase, ListRestaurantsFilters } from '../../data/restaurants';
import { syncRestaurant } from '../../services/restaurantSyncService';
import * as Haptics from 'expo-haptics';

export const DinerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListRestaurantsFilters>({});
  
  // Typewriter animation states
  const messages = useMemo(() => [
    user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome',
    'How can we help you today?',
    'What are you craving?',
    'Ready to dine?',
    'Find your perfect table',
    'Where shall we go?',
    'Discover great restaurants',
    'Let\'s find something special',
  ], [user?.name]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const quickChips = [
    { label: 'Date Night', cuisine: 'Romantic' },
    { label: 'Quiet', q: 'quiet restaurant' },
    { label: 'Live Music', q: 'restaurant live music' },
    { label: 'Outdoor Seating', q: 'restaurant outdoor seating' },
    { label: 'Romantic', cuisine: 'Romantic' },
    { label: 'Family Friendly', q: 'family friendly restaurant' },
  ];

  // Load restaurants from Supabase on mount
  useEffect(() => {
    const loadInitialRestaurants = async () => {
      setLoading(true);
      try {
        const supabaseRestaurants = await listRestaurantsFromSupabase({
          limit: 20,
        });
        console.log(`Loaded ${supabaseRestaurants.length} restaurants from Supabase`);
        if (supabaseRestaurants.length > 0) {
          setRestaurants(supabaseRestaurants);
        } else {
          console.log('No restaurants found in Supabase. User can search to find restaurants.');
        }
      } catch (error) {
        console.error('Error loading initial restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialRestaurants();
  }, []);

  // Cursor blink animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Blink speed

    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter animation effect
  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayedText.length < currentMessage.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
      }, 50); // Typing speed
    } else if (!isDeleting && displayedText.length === currentMessage.length) {
      // Finished typing, wait before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); // Pause before deleting
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, 30); // Deleting speed (faster)
    } else if (isDeleting && displayedText.length === 0) {
      // Finished deleting, move to next message
      setIsDeleting(false);
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [displayedText, isDeleting, currentMessageIndex, messages]);

  const loadRestaurants = async (appliedFilters?: ListRestaurantsFilters, autoSync: boolean = true) => {
    setLoading(true);
    try {
      const filtersToUse = appliedFilters || filters;
      const results = await listRestaurants(filtersToUse);
      setRestaurants(results);
      
      // Automatically sync restaurants to Supabase if we have results
      if (autoSync && results.length > 0) {
        setSyncing(true);
        try {
          // Sync each restaurant individually (more reliable)
          const restaurantsToSync = results.slice(0, 20); // Limit to 20 for performance
          let syncedCount = 0;
          
          for (const restaurant of restaurantsToSync) {
            if (restaurant.placeId) {
              try {
                const syncResult = await syncRestaurant(restaurant.placeId);
                if (syncResult.success) {
                  syncedCount++;
                  console.log(`Synced: ${restaurant.name}`);
                }
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (err) {
                console.error(`Failed to sync ${restaurant.name}:`, err);
              }
            }
          }
          
          console.log(`Sync complete: ${syncedCount}/${restaurantsToSync.length} restaurants synced`);
          
          // Reload restaurants from Supabase after sync
          if (syncedCount > 0) {
            const supabaseRestaurants = await listRestaurantsFromSupabase({
              limit: 50,
            });
            if (supabaseRestaurants.length > 0) {
              setRestaurants(supabaseRestaurants);
            }
          }
        } catch (syncError) {
          console.error('Error syncing restaurants:', syncError);
        } finally {
          setSyncing(false);
        }
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const searchFilters: ListRestaurantsFilters = {
        ...filters,
        q: searchQuery,
      };
      setFilters(searchFilters);
      await loadRestaurants(searchFilters);
    }
  };

  const handleChipPress = (chip: { label: string; cuisine?: string; q?: string }) => {
    const chipFilters: ListRestaurantsFilters = {
      ...filters,
    };
    if (chip.cuisine) {
      chipFilters.cuisine = chip.cuisine;
    } else if (chip.q) {
      chipFilters.q = chip.q;
    }
    setFilters(chipFilters);
    loadRestaurants(chipFilters);
  };

  const handleApplyFilters = (appliedFilters: ListRestaurantsFilters) => {
    setFilters(appliedFilters);
    setShowFilters(false);
    loadRestaurants(appliedFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setShowFilters(false);
    setRestaurants([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.cuisine) count++;
    if (filters.venueType) count++;
    if (filters.vibes && filters.vibes.length > 0) count += filters.vibes.length;
    if (filters.partySize && filters.partySize !== 2) count++;
    return count;
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    (navigation as any).navigate('RestaurantDetail', { restaurant });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Minimalist Header - Welcome message, Circle with Arrow, Bookmark */}
        <View style={styles.header}>
          <View style={styles.headerWelcome}>
            <Text style={styles.welcomeText} numberOfLines={1}>
              {displayedText}
              {showCursor && <Text style={styles.cursor}>|</Text>}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerCenterIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              (navigation as any).navigate('AIAssistant');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="sparkles" size={16} color={colors.text.primary} />
            </View>
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
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurants..."
                  placeholderTextColor={colors.text.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFilters(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="filter"
                    size={20}
                    color={colors.text.primary}
                  />
                  {getActiveFiltersCount() > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {getActiveFiltersCount()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* <View style={styles.section}>
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
            </View> */}


            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RESTAURANTS</Text>
              {loading || syncing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.main} />
                  {syncing && (
                    <Text style={styles.syncingText}>Syncing to database...</Text>
                  )}
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
                            {/* Add platform badges */}
                            {restaurant.platforms && restaurant.platforms.length > 0 && (
                              <View style={styles.platformsContainer}>
                                <PlatformBadges 
                                  platforms={restaurant.platforms} 
                                  maxVisible={3}
                                  size="small"
                                />
                              </View>
                            )}
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No restaurants found</Text>
                  <Text style={styles.emptySubtext}>
                    Search for restaurants to discover and sync them to your database
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <FilterModal
          visible={showFilters}
          filters={filters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* Footer with same header pattern */}
        {/* <View style={styles.footer}>
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
        </View> */}
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
  headerWelcome: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
    fontSize: 20,
    minHeight: 24, // Prevent layout shift
  },
  cursor: {
    opacity: 1,
    color: colors.text.primary,
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
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 10,
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
    gap: spacing.md,
  },
  syncingText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    opacity: 0.7,
  },
  platformsContainer: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
