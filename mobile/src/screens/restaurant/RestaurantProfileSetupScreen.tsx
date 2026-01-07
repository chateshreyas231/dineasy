import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';

const vibeOptions = ['Quiet', 'Live Music', 'Romantic', 'Family', 'Sports', 'Upscale', 'Casual'];
const cuisineOptions = ['Italian', 'Mexican', 'Japanese', 'American', 'French', 'Mediterranean', 'Asian', 'Indian'];
const priceOptions = ['$', '$$', '$$$'];

export function RestaurantProfileSetupScreen() {
  const navigation = useNavigation();
  const restaurantProfile = useAppStore((state) => state.restaurantProfile);
  const setRestaurantProfile = useAppStore((state) => state.setRestaurantProfile);
  const [vibeTags, setVibeTags] = useState<string[]>(restaurantProfile?.vibeTags || []);
  const [cuisine, setCuisine] = useState<string[]>(restaurantProfile?.cuisine || []);
  const [hours, setHours] = useState(restaurantProfile?.hours || '');
  const [avgPrice, setAvgPrice] = useState<1 | 2 | 3>(restaurantProfile?.avgPrice || 2);
  const [maxHolds, setMaxHolds] = useState(restaurantProfile?.maxHolds || 5);

  const toggleVibe = (tag: string) => {
    setVibeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleCuisine = (tag: string) => {
    setCuisine((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    if (restaurantProfile) {
      setRestaurantProfile({
        ...restaurantProfile,
        vibeTags,
        cuisine,
        hours,
        avgPrice,
        maxHolds,
      });
    }
    // Navigate to main restaurant app
    navigation.navigate('Status' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Set Restaurant Profile" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vibe Tags</Text>
          <View style={styles.chipContainer}>
            {vibeOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={vibeTags.includes(option)}
                onPress={() => toggleVibe(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuisine</Text>
          <View style={styles.chipContainer}>
            {cuisineOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={cuisine.includes(option)}
                onPress={() => toggleCuisine(option)}
              />
            ))}
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Hours"
            value={hours}
            onChangeText={setHours}
            placeholder="e.g., Mon-Fri: 11am-10pm, Sat-Sun: 10am-11pm"
          />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Average Price</Text>
          <View style={styles.chipContainer}>
            {priceOptions.map((option, index) => {
              const level = (index + 1) as 1 | 2 | 3;
              return (
                <Chip
                  key={option}
                  label={option}
                  selected={avgPrice === level}
                  onPress={() => setAvgPrice(level)}
                />
              );
            })}
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Max Holds"
            value={maxHolds.toString()}
            onChangeText={(text) => setMaxHolds(parseInt(text) || 5)}
            placeholder="5"
            keyboardType="number-pad"
          />
          <Text style={styles.hint}>Maximum number of table holds at once</Text>
        </Card>

        <Button title="Save & Continue" onPress={handleSave} variant="primary" fullWidth />
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
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    marginBottom: 24,
  },
  hint: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
});

