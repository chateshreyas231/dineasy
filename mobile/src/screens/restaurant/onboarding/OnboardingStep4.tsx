import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';
import { colors, typography, spacing, radius } from '../../../theme';
import { RestaurantOnboardingData } from '../RestaurantOnboardingScreen';

interface OnboardingStep4Props {
  data: RestaurantOnboardingData;
  onComplete: () => void;
}

const PLANS = {
  basic: { name: 'Basic', price: 29 },
  professional: { name: 'Professional', price: 79 },
  enterprise: { name: 'Enterprise', price: 199 },
};

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ data }) => {
  const selectedPlan = data.subscriptionPlan ? PLANS[data.subscriptionPlan] : null;

  return (
    <View>
      <Text style={styles.description}>
        Review your information and complete your restaurant setup
      </Text>

      {/* Restaurant Information */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={24} color={colors.primary.main} />
          <Text style={styles.sectionTitle}>Restaurant Information</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{data.restaurantName || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cuisine:</Text>
          <Text style={styles.infoValue}>{data.cuisine || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{data.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Manager:</Text>
          <Text style={styles.infoValue}>{data.managerName || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>
            {data.address
              ? `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`
              : 'Not provided'}
          </Text>
        </View>
        {data.capacity && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Capacity:</Text>
            <Text style={styles.infoValue}>{data.capacity} guests</Text>
          </View>
        )}
        {data.numberOfTables && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tables:</Text>
            <Text style={styles.infoValue}>{data.numberOfTables}</Text>
          </View>
        )}
      </Card>

      {/* Images & Specialities */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="images" size={24} color={colors.primary.main} />
          <Text style={styles.sectionTitle}>Images & Specialities</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Menu Images:</Text>
          <Text style={styles.infoValue}>
            {data.menuImages.length > 0 ? `${data.menuImages.length} images` : 'None'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ambience Images:</Text>
          <Text style={styles.infoValue}>
            {data.ambienceImages.length > 0 ? `${data.ambienceImages.length} images` : 'None'}
          </Text>
        </View>
        {data.specialities.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Specialities:</Text>
            <Text style={styles.infoValue}>{data.specialities.join(', ')}</Text>
          </View>
        )}
        {data.offers.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Offers:</Text>
            <Text style={styles.infoValue}>{data.offers.join(', ')}</Text>
          </View>
        )}
      </Card>

      {/* Subscription Plan */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card" size={24} color={colors.primary.main} />
          <Text style={styles.sectionTitle}>Subscription Plan</Text>
        </View>
        {selectedPlan ? (
          <View style={styles.planSummary}>
            <Text style={styles.planName}>{selectedPlan.name}</Text>
            <Text style={styles.planPrice}>${selectedPlan.price}/month</Text>
          </View>
        ) : (
          <Text style={styles.noPlanText}>No plan selected</Text>
        )}
      </Card>

      <Card style={styles.noteCard}>
        <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
        <Text style={styles.noteText}>
          You can update any of this information later in your restaurant settings.
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
  },
  planName: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  planPrice: {
    ...typography.h3,
    color: colors.primary.main,
    fontWeight: '700',
  },
  noPlanText: {
    ...typography.body,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.success + '10',
    borderColor: colors.status.success + '30',
    borderWidth: 1,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
});
