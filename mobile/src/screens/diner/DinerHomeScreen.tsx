import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AIOrb } from '../../components/AIOrb';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import * as Haptics from 'expo-haptics';

const aiButtonRadius = radius.md;

export const DinerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [partySize, setPartySize] = useState(2);

  const quickChips = [
    'Date Night',
    'Quiet',
    'Live Music',
    'Outdoor Seating',
    'Romantic',
    'Family Friendly',
  ];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Navigate to results with search query
      navigation.navigate('Results' as never, { query: searchQuery } as never);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with AI Button */}
        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>Browse</Text>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              (navigation as any).navigate('AIAssistant');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {user ? `Welcome back, ${user.name}` : 'What would you like to discover today?'}
            </Text>
            <Text style={styles.title}>Discover Your Perfect Dining Experience</Text>
          </View>

          <View style={styles.orbContainer}>
            <AIOrb size={100} />
          </View>

          <Card style={styles.searchCard}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for restaurants..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <Button
              title="Search"
              onPress={handleSearch}
              variant="secondary"
              size="md"
              style={styles.searchButton}
            />
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Search</Text>
            <View style={styles.chipsContainer}>
              {quickChips.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  onPress={() => navigation.navigate('IntentBuilder' as never)}
                />
              ))}
            </View>
          </View>

          <Card style={styles.partyCard}>
            <Text style={styles.partyLabel}>Party Size</Text>
            <View style={styles.partySelector}>
              {[1, 2, 4, 6, 8].map((size) => (
                <Button
                  key={size}
                  title={size.toString()}
                  onPress={() => setPartySize(size)}
                  variant={partySize === size ? 'secondary' : 'ghost'}
                  size="sm"
                  style={styles.partyButton}
                />
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fallback color
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pageTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: aiButtonRadius,
    borderWidth: 1.5,
    borderColor: colors.border.elegant,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    minHeight: 120, // Ensure container has space
  },
  searchCard: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  searchButton: {
    width: '100%',
    maxHeight: 50, // Limit button height
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
  partyCard: {
    marginTop: spacing.md,
  },
  partyLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  partySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  partyButton: {
    flex: 1,
  },
});
