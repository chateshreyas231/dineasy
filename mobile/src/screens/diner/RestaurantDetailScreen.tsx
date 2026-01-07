import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { mockRestaurants } from '../../mock/restaurants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function RestaurantDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId: string };
  const restaurant = mockRestaurants.find((r) => r.id === restaurantId);
  const addRequest = useAppStore((state) => state.addRequest);
  const addWatch = useAppStore((state) => state.addWatch);
  const currentIntent = useAppStore((state) => state.currentIntent);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const handleRequestTable = () => {
    navigation.navigate('RequestTable' as never, { restaurantId: restaurant.id } as never);
  };

  const handleWatch = () => {
    const watch = {
      id: `watch-${Date.now()}`,
      geoLabel: restaurant.address,
      radius: 1,
      timeRange: 'next 2 hours',
      vibeTags: restaurant.vibe,
      notificationsEnabled: true,
    };
    addWatch(watch);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image" size={64} color="#E0E0E0" />
          <Text style={styles.photoPlaceholderText}>Photo Gallery</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color="#7F8C8D" />
            <Text style={styles.metaText}>{restaurant.distance} mi • {restaurant.address}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{'$'.repeat(restaurant.priceLevel)}</Text>
            <Text style={styles.metaText}> • Est. wait: {restaurant.estWaitMinRange[0]}-{restaurant.estWaitMinRange[1]} min</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {restaurant.vibe.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {restaurant.cuisine.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Best Times</Text>
          {restaurant.bestTimes.map((time, index) => (
            <Text key={index} style={styles.sectionText}>• {time}</Text>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {restaurant.highlights.map((highlight, index) => (
            <Text key={index} style={styles.sectionText}>• {highlight}</Text>
          ))}
        </Card>

        <View style={styles.actions}>
          <Button
            title="Request a Table"
            onPress={handleRequestTable}
            variant="primary"
            fullWidth
          />
          <TouchableOpacity style={styles.secondaryAction} onPress={handleWatch}>
            <Ionicons name="eye" size={20} color="#FF6B6B" />
            <Text style={styles.secondaryActionText}>Watch Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
            <Ionicons name="navigate" size={20} color="#FF6B6B" />
            <Text style={styles.secondaryActionText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 8,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

