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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AIOrb } from '../../components/AIOrb';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Restaurant } from '../../types';
import { listRestaurants } from '../../data/restaurants';
import * as Haptics from 'expo-haptics';

const aiButtonRadius = radius.md;

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
    navigation.navigate('RestaurantDetail' as never, { restaurant } as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with AI Button */}
        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>Browse</Text>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              (navigation as any).navigate('AIAssistant');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {user ? `Welcome back, ${user.name}` : 'What would you like to discover today?'}
            </Text>
            <Text style={styles.title}>Discover Your Perfect Dining Experience</Text>
          </View>

          <View style={styles.orbContainer}>
            <AIOrb size={100} />
          </View>

          <Card style={styles.searchCard}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for restaurants..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <Button
              title="Search"
              onPress={handleSearch}
              variant="secondary"
              size="md"
              style={styles.searchButton}
            />
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Search</Text>
            <View style={styles.chipsContainer}>
              {quickChips.map((chip) => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  onPress={() => handleChipPress(chip)}
                />
              ))}
            </View>
          </View>

          <Card style={styles.partyCard}>
            <Text style={styles.partyLabel}>Party Size</Text>
            <View style={styles.partySelector}>
              {[1, 2, 4, 6, 8].map((size) => (
                <Button
                  key={size}
                  title={size.toString()}
                  onPress={() => setPartySize(size)}
                  variant={partySize === size ? 'secondary' : 'ghost'}
                  size="sm"
                  style={styles.partyButton}
                />
              ))}
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurants</Text>
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
                  >
                    <Card style={styles.restaurantCard}>
                      {restaurant.imageUrl && (
                        <Image
                          source={{ uri: restaurant.imageUrl }}
                          style={styles.restaurantImage}
                        />
                      )}
                      <View style={styles.restaurantContent}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <View style={styles.restaurantMeta}>
                          <View style={styles.rating}>
                            <Ionicons
                              name="star"
                              size={16}
                              color={colors.accent.gold}
                            />
                            <Text style={styles.ratingText}>{restaurant.rating}</Text>
                          </View>
                          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                          {restaurant.distance && (
                            <Text style={styles.restaurantDistance}>
                              {restaurant.distance} mi
                            </Text>
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
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fallback color
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pageTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: aiButtonRadius,
    borderWidth: 1.5,
    borderColor: colors.border.elegant,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    minHeight: 120, // Ensure container has space
  },
  searchCard: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  searchButton: {
    width: '100%',
    maxHeight: 50, // Limit button height
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  partyCard: {
    marginTop: spacing.md,
  },
  partyLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  partySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  partyButton: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantsContainer: {
    gap: spacing.md,
  },
  restaurantCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  restaurantContent: {
    gap: spacing.sm,
  },
  restaurantName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  restaurantCuisine: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  restaurantDistance: {
    ...typography.bodySmall,
    color: colors.text.muted,
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
