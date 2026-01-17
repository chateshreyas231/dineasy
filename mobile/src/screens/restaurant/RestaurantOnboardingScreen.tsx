import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, radius } from '../../theme';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { OnboardingStep1 } from './onboarding/OnboardingStep1';
import { OnboardingStep2 } from './onboarding/OnboardingStep2';
import { OnboardingStep3 } from './onboarding/OnboardingStep3';
import { OnboardingStep4 } from './onboarding/OnboardingStep4';

const TOTAL_STEPS = 4;

export interface RestaurantOnboardingData {
  // Step 1: Basic Information
  restaurantName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  managerName: string;
  cuisine: string;
  capacity: string;
  numberOfTables: string;
  
  // Step 2: Images & Specialities
  menuImages: string[];
  ambienceImages: string[];
  specialities: string[];
  offers: string[];
  
  // Step 3: Subscription
  subscriptionPlan: 'basic' | 'professional' | 'enterprise' | null;
  
  // Step 4: Review
}

export const RestaurantOnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<RestaurantOnboardingData>({
    restaurantName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    managerName: '',
    cuisine: '',
    capacity: '',
    numberOfTables: '',
    menuImages: [],
    ambienceImages: [],
    specialities: [],
    offers: [],
    subscriptionPlan: null,
  });

  // Fetch existing restaurant data to pre-populate the form
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch restaurant data
        const { data: restaurant, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching restaurant:', error);
        }

        // Pre-populate with existing data if available
        if (restaurant) {
          setOnboardingData((prev) => ({
            ...prev,
            restaurantName: restaurant.name || '',
            phone: restaurant.phone || '',
            // Note: address, city, etc. may be in settings JSON or separate columns
            // Adjust based on your actual database schema
            ...(restaurant.settings && typeof restaurant.settings === 'object' ? {
              address: restaurant.settings.address || '',
              city: restaurant.settings.city || '',
              state: restaurant.settings.state || '',
              zipCode: restaurant.settings.zipCode || '',
              managerName: restaurant.settings.managerName || '',
              cuisine: restaurant.settings.cuisine || '',
              capacity: restaurant.settings.capacity?.toString() || '',
              numberOfTables: restaurant.settings.numberOfTables?.toString() || '',
            } : {}),
          }));
        }

        // Also fetch profile to get manager name if available
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setOnboardingData((prev) => {
            // Only set if not already set from restaurant settings
            if (!prev.managerName) {
              return {
                ...prev,
                managerName: profile.full_name || '',
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error loading restaurant data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to restaurant home, onboarding can be completed later
    navigation.navigate('RestaurantApp' as never);
  };

  const handleSkipStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // First, fetch the restaurant to get its ID
      const { data: restaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching restaurant:', fetchError);
      }

      if (restaurant?.id) {
        // Update restaurant record with all onboarding data
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            name: onboardingData.restaurantName,
            phone: onboardingData.phone,
            settings: {
              address: onboardingData.address,
              city: onboardingData.city,
              state: onboardingData.state,
              zipCode: onboardingData.zipCode,
              managerName: onboardingData.managerName,
              cuisine: onboardingData.cuisine,
              capacity: onboardingData.capacity ? parseInt(onboardingData.capacity) : null,
              numberOfTables: onboardingData.numberOfTables ? parseInt(onboardingData.numberOfTables) : null,
              menuImages: onboardingData.menuImages,
              ambienceImages: onboardingData.ambienceImages,
              specialities: onboardingData.specialities,
              offers: onboardingData.offers,
              subscriptionPlan: onboardingData.subscriptionPlan,
            },
          })
          .eq('id', restaurant.id);

        if (updateError) {
          console.error('Error updating restaurant:', updateError);
          // Still navigate even if update fails - user can update later
        }
      } else {
        console.warn('Restaurant not found, skipping update');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to restaurant home
      navigation.navigate('RestaurantApp' as never);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      // Still navigate on error - user can complete later
      navigation.navigate('RestaurantApp' as never);
    }
  };

  const updateData = (updates: Partial<RestaurantOnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            data={onboardingData}
            updateData={updateData}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            data={onboardingData}
            updateData={updateData}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            data={onboardingData}
            updateData={updateData}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            data={onboardingData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Restaurant Information';
      case 2:
        return 'Images & Specialities';
      case 3:
        return 'Choose Your Plan';
      case 4:
        return 'Review & Complete';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading your restaurant data...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bar & Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>
              Step {currentStep} of {TOTAL_STEPS}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>
          
          <Text style={styles.stepTitle}>{getStepTitle()}</Text>
        </View>

        {/* Step Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          {currentStep > 1 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="secondary"
              size="md"
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Next'}
            onPress={handleNext}
            variant="secondary"
            size="md"
            style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
          />
        </View>
        
        {/* Skip Step Button - Show for all steps except the last one */}
        {currentStep < TOTAL_STEPS && (
          <View style={styles.skipStepContainer}>
            <TouchableOpacity onPress={handleSkipStep} style={styles.skipStepButton}>
              <Text style={styles.skipStepText}>Skip this step</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
  stepIndicator: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  backButton: {
    flex: 0.45,
  },
  nextButton: {
    flex: 0.55,
  },
  nextButtonFull: {
    flex: 1,
    marginLeft: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.muted,
  },
  skipStepContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  skipStepButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipStepText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontWeight: '500',
  },
});
