import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';

const vibeOptions = ['Quiet', 'Romantic', 'Energetic', 'Cozy', 'Upscale', 'Casual', 'Live Music'];
const cuisineOptions = ['Italian', 'Mexican', 'Japanese', 'American', 'French', 'Mediterranean', 'Asian', 'Indian'];
const mustHaveOptions = ['Outdoor Seating', 'Bar', 'Parking', 'Wheelchair Accessible', 'WiFi', 'Pet Friendly'];

export function IntentBuilderScreen() {
  const navigation = useNavigation();
  const currentIntent = useAppStore((state) => state.currentIntent);
  const setCurrentIntent = useAppStore((state) => state.setCurrentIntent);
  const [vibeTags, setVibeTags] = useState<string[]>(currentIntent?.vibeTags || []);
  const [cuisineTags, setCuisineTags] = useState<string[]>(currentIntent?.cuisineTags || []);
  const [mustHaves, setMustHaves] = useState<string[]>(currentIntent?.mustHaves || []);
  const [dishesLike, setDishesLike] = useState(currentIntent?.dishesLike || '');

  const toggleVibe = (tag: string) => {
    setVibeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleCuisine = (tag: string) => {
    setCuisineTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleMustHave = (tag: string) => {
    setMustHaves((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleFindOptions = () => {
    if (currentIntent) {
      setCurrentIntent({
        ...currentIntent,
        vibeTags,
        cuisineTags,
        mustHaves,
        dishesLike,
      });
    }
    navigation.navigate('Results' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Build Your Intent" subtitle="Refine your search" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vibe</Text>
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
                selected={cuisineTags.includes(option)}
                onPress={() => toggleCuisine(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Must-haves</Text>
          <View style={styles.chipContainer}>
            {mustHaveOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={mustHaves.includes(option)}
                onPress={() => toggleMustHave(option)}
              />
            ))}
          </View>
        </View>

        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>I want dishes like… (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., pasta carbonara, sushi rolls, tacos..."
            value={dishesLike}
            onChangeText={setDishesLike}
            placeholderTextColor="#7F8C8D"
            multiline
          />
        </Card>

        <Button title="Find Options" onPress={handleFindOptions} variant="primary" fullWidth />
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
  inputCard: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

