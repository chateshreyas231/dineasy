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
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

export const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setPreferences } = useAppStore();
  const [dietary, setDietary] = useState<string[]>([]);
  const [ambience, setAmbience] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string[]>([]);

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal'];
  const ambienceOptions = ['Quiet', 'Romantic', 'Family Friendly', 'Business', 'Casual'];
  const cuisineOptions = ['Italian', 'French', 'Japanese', 'Mexican', 'American'];

  const toggleOption = (
    option: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    if (current.includes(option)) {
      setter(current.filter((o) => o !== option));
    } else {
      setter([...current, option]);
    }
  };

  const handleContinue = () => {
    setPreferences({
      dietary,
      budget: 'medium',
      ambience,
      cuisine,
    });
    navigation.navigate('DinerHome' as never);
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
          <Text style={styles.title}>Set Your Preferences</Text>
          <Text style={styles.subtitle}>
            Help us personalize your dining experience
          </Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
            <View style={styles.chipsContainer}>
              {dietaryOptions.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={dietary.includes(option)}
                  onPress={() => toggleOption(option, dietary, setDietary)}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Ambience</Text>
            <View style={styles.chipsContainer}>
              {ambienceOptions.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={ambience.includes(option)}
                  onPress={() => toggleOption(option, ambience, setAmbience)}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
            <View style={styles.chipsContainer}>
              {cuisineOptions.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={cuisine.includes(option)}
                  onPress={() => toggleOption(option, cuisine, setCuisine)}
                />
              ))}
            </View>
          </Card>

          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            style={styles.button}
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
  card: {
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
  button: {
    marginTop: spacing.lg,
  },
});
