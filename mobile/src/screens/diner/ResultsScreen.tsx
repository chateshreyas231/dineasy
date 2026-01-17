import React from 'react';
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
import { colors, typography, spacing, radius, gradients, shadows } from '../../theme';
import { mockRestaurants } from '../../mock/restaurants';
import { Restaurant } from '../../types';
import { restaurantApi } from '../../utils/api';
import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';

export const ResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addToWatchlist } = useAppStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [loading, setLoading] = useState(false);

  const searchQuery = (route.params as any)?.query as string;

  useEffect(() => {
    if (searchQuery) {
      loadSearchResults(searchQuery);
    }
  }, [searchQuery]);

  const loadSearchResults = async (query: string) => {
    setLoading(true);
    try {
      const response = await restaurantApi.search(query);
      if (response.data?.results) {
        // Transform API results to Restaurant format
        const transformed = response.data.results.map((r: any) => ({
          id: r.restaurantId || r.name,
          name: r.name,
          cuisine: r.cuisine || 'Unknown',
          rating: r.rating || 4.5,
          priceLevel: r.priceRange?.length || 2,
          location: r.location,
          distance: r.distance,
          imageUrl: r.imageUrl,
          highlights: r.vibeTags || [],
          bookingLink: r.bookingLink,
          platform: r.platform,
        }));
        setRestaurants(transformed);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      setRestaurants(mockRestaurants);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail' as never, { restaurant } as never);
  };

  const handleAddToWatchlist = (restaurant: Restaurant) => {
    addToWatchlist(restaurant);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.soft as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Search Results</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {restaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Card variant="glass3d" style={styles.restaurantCard} interactive>
                {restaurant.imageUrl && (
                  <Image
                    source={{ uri: restaurant.imageUrl }}
                    style={styles.image}
                  />
                )}
                <View style={styles.content}>
                  <Text style={styles.name}>{restaurant.name}</Text>
                  <View style={styles.meta}>
                    <View style={styles.rating}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={colors.accent.gold}
                      />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                    <Text style={styles.distance}>
                      {restaurant.distance} mi
                    </Text>
                  </View>
                  <View style={styles.highlights}>
                    {restaurant.highlights?.slice(0, 3).map((highlight, idx) => (
                      <View key={idx} style={styles.highlight}>
                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                  <Button
                    title="View Details"
                    onPress={() => handleRestaurantPress(restaurant)}
                    variant="primary"
                    size="sm"
                    style={styles.button}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
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
  restaurantCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  content: {
    gap: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
  },
  meta: {
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
  cuisine: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  distance: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  highlight: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  highlightText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.sm,
  },
});
