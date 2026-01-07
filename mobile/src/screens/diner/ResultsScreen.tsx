import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { mockRestaurants } from '../../mock/restaurants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function ResultsScreen() {
  const navigation = useNavigation();
  const currentIntent = useAppStore((state) => state.currentIntent);
  const addRequest = useAppStore((state) => state.addRequest);
  const addWatch = useAppStore((state) => state.addWatch);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handlePingAvailability = (restaurantId: string, restaurantName: string) => {
    const request = {
      id: `req-${Date.now()}`,
      restaurantId,
      restaurantName,
      partySize: currentIntent?.partySize || 2,
      timeWindow: currentIntent?.timeWindow === 'now' ? 'Now' : currentIntent?.timeWindow || 'Later',
      status: 'sent' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addRequest(request);
    navigation.navigate('RequestStatus' as never, { requestId: request.id } as never);
  };

  const handleWatch = (restaurantId: string) => {
    const watch = {
      id: `watch-${Date.now()}`,
      geoLabel: 'Near me',
      radius: 2,
      timeRange: 'next 2 hours',
      vibeTags: currentIntent?.vibeTags || [],
      notificationsEnabled: true,
    };
    addWatch(watch);
  };

  const getMatchScore = (restaurant: typeof mockRestaurants[0]) => {
    // Simple match scoring based on tags
    let score = 70;
    if (currentIntent?.vibeTags) {
      const matchingVibes = restaurant.vibe.filter((v) => currentIntent.vibeTags.includes(v));
      score += matchingVibes.length * 10;
    }
    return Math.min(100, score);
  };

  if (viewMode === 'map') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <Ionicons name="list" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.mapHeaderText}>Map View</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color="#E0E0E0" />
          <Text style={styles.mapPlaceholderText}>Map view coming soon</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{mockRestaurants.length} restaurants found</Text>
        <TouchableOpacity onPress={() => setViewMode('map')}>
          <Ionicons name="map" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {mockRestaurants.map((restaurant) => {
          const matchScore = getMatchScore(restaurant);
          const waitRange = `${restaurant.estWaitMinRange[0]}-${restaurant.estWaitMinRange[1]} min`;

          return (
            <Card key={restaurant.id} style={styles.restaurantCard}>
              <View style={styles.cardHeader}>
                <View style={styles.matchScore}>
                  <Text style={styles.matchScoreText}>{matchScore}%</Text>
                  <Text style={styles.matchScoreLabel}>Match</Text>
                </View>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="location" size={14} color="#7F8C8D" />
                    <Text style={styles.metaText}>{restaurant.distance} mi</Text>
                    <Text style={styles.metaText}> • </Text>
                    <Text style={styles.metaText}>{'$'.repeat(restaurant.priceLevel)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tagsContainer}>
                {restaurant.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.waitTime}>
                <Ionicons name="time" size={16} color="#FF6B6B" />
                <Text style={styles.waitTimeText}>Est. wait: {waitRange}</Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Ping Availability"
                  onPress={() => handlePingAvailability(restaurant.id, restaurant.name)}
                  variant="primary"
                  style={styles.actionButton}
                />
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleWatch(restaurant.id)}
                >
                  <Ionicons name="eye" size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Watch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('RestaurantDetail' as never, { restaurantId: restaurant.id } as never)}
                >
                  <Ionicons name="open" size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Open</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  restaurantCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  matchScore: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginRight: 12,
  },
  matchScoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  matchScoreLabel: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  waitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  waitTimeText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 6,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mapHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
  },
});

