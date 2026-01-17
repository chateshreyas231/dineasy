import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Input } from './Input';
import { colors, typography, spacing, radius } from '../theme';
import { ListRestaurantsFilters } from '../data/restaurants';
import * as Haptics from 'expo-haptics';

interface FilterModalProps {
  visible: boolean;
  filters: ListRestaurantsFilters;
  onClose: () => void;
  onApply: (filters: ListRestaurantsFilters) => void;
  onReset: () => void;
}

const vibeOptions = [
  { label: 'Date Night', value: 'date night' },
  { label: 'Quiet', value: 'quiet' },
  { label: 'Live Music', value: 'live music' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Casual', value: 'casual' },
  { label: 'Upscale', value: 'upscale' },
  { label: 'Family Friendly', value: 'family friendly' },
  { label: 'Outdoor Seating', value: 'outdoor seating' },
  { label: 'Rooftop', value: 'rooftop' },
  { label: 'Waterfront', value: 'waterfront' },
];

const venueTypes = [
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Bar', value: 'bar' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Bistro', value: 'bistro' },
  { label: 'Fine Dining', value: 'fine dining' },
  { label: 'Fast Casual', value: 'fast casual' },
  { label: 'Food Hall', value: 'food hall' },
  { label: 'Brewery', value: 'brewery' },
];

const cuisineOptions = [
  { label: 'Italian', value: 'italian' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'American', value: 'american' },
  { label: 'French', value: 'french' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Asian', value: 'asian' },
  { label: 'Indian', value: 'indian' },
  { label: 'Thai', value: 'thai' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Korean', value: 'korean' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'Greek', value: 'greek' },
  { label: 'Middle Eastern', value: 'middle eastern' },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Steakhouse', value: 'steakhouse' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
];

const partySizes = [1, 2, 4, 6, 8, 10, 12, 15, 20];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<ListRestaurantsFilters>(filters);
  const [location, setLocation] = useState(filters.location || '');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(filters.vibes || []);
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>(filters.cuisine ? [filters.cuisine] : []);
  const [selectedVenueType, setSelectedVenueType] = useState<string[]>(filters.venueType ? [filters.venueType] : []);
  const [partySize, setPartySize] = useState(filters.partySize || 2);

  const handleVibeToggle = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVibes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleCuisineToggle = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCuisine((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleVenueTypeToggle = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVenueType((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const appliedFilters: ListRestaurantsFilters = {
      ...localFilters,
      location: location.trim() || undefined,
      vibes: selectedVibes.length > 0 ? selectedVibes : undefined,
      cuisine: selectedCuisine.length > 0 ? selectedCuisine[0] : undefined,
      venueType: selectedVenueType.length > 0 ? selectedVenueType[0] : undefined,
      partySize: partySize || undefined,
    };
    onApply(appliedFilters);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocation('');
    setSelectedVibes([]);
    setSelectedCuisine([]);
    setSelectedVenueType([]);
    setPartySize(2);
    setLocalFilters({});
    onReset();
  };

  const hasActiveFilters = 
    location.trim() !== '' ||
    selectedVibes.length > 0 ||
    selectedCuisine.length > 0 ||
    selectedVenueType.length > 0 ||
    partySize !== 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Filters</Text>
                <Text style={styles.subtitle}>Refine your search</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Location */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <Input
                  placeholder="City, neighborhood, or address"
                  value={location}
                  onChangeText={setLocation}
                  leftIcon="location-outline"
                />
              </View>

              {/* Party Size */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Party Size</Text>
                <View style={styles.chipContainer}>
                  {partySizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.chip,
                        partySize === size && styles.chipActive,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPartySize(size);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          partySize === size && styles.chipTextActive,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Vibes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vibe & Ambience</Text>
                <View style={styles.chipContainer}>
                  {vibeOptions.map((vibe) => (
                    <TouchableOpacity
                      key={vibe.value}
                      style={[
                        styles.chip,
                        selectedVibes.includes(vibe.value) && styles.chipActive,
                      ]}
                      onPress={() => handleVibeToggle(vibe.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedVibes.includes(vibe.value) && styles.chipTextActive,
                        ]}
                      >
                        {vibe.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cuisine */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cuisine</Text>
                <View style={styles.chipContainer}>
                  {cuisineOptions.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine.value}
                      style={[
                        styles.chip,
                        selectedCuisine.includes(cuisine.value) && styles.chipActive,
                      ]}
                      onPress={() => handleCuisineToggle(cuisine.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCuisine.includes(cuisine.value) && styles.chipTextActive,
                        ]}
                      >
                        {cuisine.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Venue Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Venue Type</Text>
                <View style={styles.chipContainer}>
                  {venueTypes.map((venue) => (
                    <TouchableOpacity
                      key={venue.value}
                      style={[
                        styles.chip,
                        selectedVenueType.includes(venue.value) && styles.chipActive,
                      ]}
                      onPress={() => handleVenueTypeToggle(venue.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedVenueType.includes(venue.value) && styles.chipTextActive,
                        ]}
                      >
                        {venue.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Reset"
                onPress={handleReset}
                variant="secondary"
                style={styles.resetButton}
                disabled={!hasActiveFilters}
              />
              <Button
                title="Apply Filters"
                onPress={handleApply}
                variant="secondary"
                style={styles.applyButton}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '90%',
    minHeight: '50%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  chipText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
