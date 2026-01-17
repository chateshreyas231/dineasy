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
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing, radius, gradients, shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Restaurant } from '../../types';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export const WatchlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { watchlist, removeFromWatchlist } = useAppStore();

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail' as never, { restaurant } as never);
  };

  const handleRemove = (restaurant: Restaurant) => {
    removeFromWatchlist(restaurant.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (watchlist.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <EmptyState
            icon="heart-outline"
            title="Your Watchlist is Empty"
            message="Save restaurants you love to access them quickly"
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
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {watchlist.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Card variant="glass3d" style={styles.card} interactive>
                {restaurant.imageUrl && (
                  <Image
                    source={{ uri: restaurant.imageUrl }}
                    style={styles.image}
                  />
                )}
                <View style={styles.content}>
                  <Text style={styles.name}>{restaurant.name}</Text>
                  <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemove(restaurant);
                    }}
                  >
                    <Ionicons name="heart" size={24} color={colors.status.error} />
                  </TouchableOpacity>
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
  card: {
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  content: {
    position: 'relative',
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cuisine: {
    ...typography.body,
    color: colors.text.muted,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
