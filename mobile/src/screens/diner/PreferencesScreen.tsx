import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/SectionHeader';

const dietaryOptions = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free'];
const budgetOptions = ['$', '$$', '$$$'];
const ambienceOptions = ['Quiet', 'Music', 'Romantic', 'Family', 'Sports'];

export function PreferencesScreen() {
  const navigation = useNavigation();
  const setPreferences = useAppStore((state) => state.setPreferences);
  const [dietary, setDietary] = useState<string[]>([]);
  const [budget, setBudget] = useState<(1 | 2 | 3)[]>([]);
  const [ambience, setAmbience] = useState<string[]>([]);

  const toggleDietary = (option: string) => {
    setDietary((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  };

  const toggleBudget = (option: string) => {
    const level = (budgetOptions.indexOf(option) + 1) as 1 | 2 | 3;
    setBudget((prev) => (prev.includes(level) ? prev.filter((b) => b !== level) : [...prev, level]));
  };

  const toggleAmbience = (option: string) => {
    setAmbience((prev) => (prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]));
  };

  const handleSave = () => {
    setPreferences({ dietary, budget, ambience });
    // Reset navigation to main app - DinerTabs will show Tab Navigator instead of OnboardingStack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'DinerApp' as never }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Preferences Setup" subtitle="Tell us what you like" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary</Text>
          <View style={styles.chipContainer}>
            {dietaryOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={dietary.includes(option)}
                onPress={() => toggleDietary(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.chipContainer}>
            {budgetOptions.map((option) => {
              const level = budgetOptions.indexOf(option) + 1;
              return (
                <Chip
                  key={option}
                  label={option}
                  selected={budget.includes(level as 1 | 2 | 3)}
                  onPress={() => toggleBudget(option)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambience</Text>
          <View style={styles.chipContainer}>
            {ambienceOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={ambience.includes(option)}
                onPress={() => toggleAmbience(option)}
              />
            ))}
          </View>
        </View>

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
});

