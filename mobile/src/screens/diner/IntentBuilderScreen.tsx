import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Card } from '../../components/Card';
import { colors, typography, spacing } from '../../theme';

export const IntentBuilderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const vibeTags = [
    'Date Night',
    'Quiet',
    'Live Music',
    'Outdoor Seating',
    'Romantic',
    'Family Friendly',
    'Business',
    'Casual',
  ];

  const cuisines = [
    'Italian',
    'French',
    'Japanese',
    'Mexican',
    'American',
    'Mediterranean',
    'Asian',
    'Steakhouse',
  ];

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleSearch = () => {
    navigation.navigate('Results' as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Refine Your Search</Text>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Vibe Tags</Text>
            <View style={styles.chipsContainer}>
              {vibeTags.map((vibe) => (
                <Chip
                  key={vibe}
                  label={vibe}
                  selected={selectedVibes.includes(vibe)}
                  onPress={() => toggleVibe(vibe)}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Cuisine</Text>
            <View style={styles.chipsContainer}>
              {cuisines.map((cuisine) => (
                <Chip
                  key={cuisine}
                  label={cuisine}
                  selected={selectedCuisines.includes(cuisine)}
                  onPress={() => toggleCuisine(cuisine)}
                />
              ))}
            </View>
          </Card>

          <Button
            title="Search"
            onPress={handleSearch}
            variant="primary"
            size="lg"
            style={styles.searchButton}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xl,
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
  searchButton: {
    marginTop: spacing.lg,
  },
});
