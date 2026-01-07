import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Card } from '../../components/Card';
import { AIOrb } from '../../components/AIOrb';
import { colors } from '../../theme/colors';

const quickChips = ['Date Night', 'Quiet', 'Live Music', 'Quick Bite', 'Business Lunch'];
const waitToleranceOptions = ['0-15', '15-30', '30-60', '60+'];

export function DinerHomeScreen() {
  const navigation = useNavigation();
  const setCurrentIntent = useAppStore((state) => state.setCurrentIntent);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Current Location');
  const [timeWindow, setTimeWindow] = useState<'now' | 'later' | string>('now');
  const [partySize, setPartySize] = useState(2);
  const [waitTolerance, setWaitTolerance] = useState<'0-15' | '15-30' | '30-60' | '60+'>('15-30');

  const handleFindOptions = () => {
    const intent = {
      query,
      locationLabel: location,
      timeWindow,
      partySize,
      waitTolerance,
      vibeTags: [],
      cuisineTags: [],
      mustHaves: [],
    };
    setCurrentIntent(intent);
    navigation.navigate('IntentBuilder' as never);
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.greeting}>Hi there! 👋</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AI' as never)}
                style={styles.aiButton}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.aiButtonGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>AI</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>What do you feel like?</Text>
            <Text style={styles.subtitle}>Ask our AI assistant or search below</Text>
          </View>

          {/* AI Orb Preview */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AI' as never)}
            style={styles.aiOrbContainer}
            activeOpacity={0.8}
          >
            <AIOrb size={120} />
            <View style={styles.aiOrbTextContainer}>
              <Text style={styles.aiOrbTitle}>AI Assistant</Text>
              <Text style={styles.aiOrbSubtitle}>Tap to chat with your dining AI</Text>
            </View>
          </TouchableOpacity>

          <Card style={styles.inputCard} glow>
            <View style={styles.inputContainer}>
              <Ionicons name="search" size={24} color={colors.primary.light} style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search for restaurants, cuisines, dishes..."
                placeholderTextColor={colors.text.muted}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </Card>

          <View style={styles.quickChips}>
            {quickChips.map((chip) => (
              <Chip key={chip} label={chip} onPress={() => setQuery(chip)} />
            ))}
          </View>

          <Card style={styles.sectionCard}>
            <TouchableOpacity style={styles.row} onPress={() => {/* Open location picker */}}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={colors.primary.light} />
              </View>
              <Text style={styles.rowText}>{location}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} onPress={() => {/* Open time picker */}}>
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={20} color={colors.primary.light} />
              </View>
              <Text style={styles.rowText}>
                {timeWindow === 'now' ? 'Now' : timeWindow === 'later' ? 'Later' : timeWindow}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={20} color={colors.primary.light} />
              </View>
              <Text style={styles.rowText}>Party Size: {partySize}</Text>
              <View style={styles.partySizeControls}>
                <TouchableOpacity
                  onPress={() => setPartySize(Math.max(1, partySize - 1))}
                  style={styles.partyButton}
                >
                  <Ionicons name="remove" size={18} color={colors.primary.light} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPartySize(partySize + 1)}
                  style={styles.partyButton}
                >
                  <Ionicons name="add" size={18} color={colors.primary.light} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons name="hourglass" size={20} color={colors.primary.light} />
              </View>
              <Text style={styles.rowText}>Wait Tolerance</Text>
            </View>
            <View style={styles.waitToleranceContainer}>
              {waitToleranceOptions.map((option) => (
                <Chip
                  key={option}
                  label={`${option} min`}
                  selected={waitTolerance === option}
                  onPress={() => setWaitTolerance(option as typeof waitTolerance)}
                />
              ))}
            </View>
          </Card>

          <Button title="Find Options" onPress={handleFindOptions} variant="primary" fullWidth />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  aiButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  aiOrbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  aiOrbTextContainer: {
    flex: 1,
    marginLeft: 20,
  },
  aiOrbTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  aiOrbSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  inputCard: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 48,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  sectionCard: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 8,
  },
  partySizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitToleranceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});
