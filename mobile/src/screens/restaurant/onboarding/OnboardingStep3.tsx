import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';
import { colors, typography, spacing, radius } from '../../../theme';
import { RestaurantOnboardingData } from '../RestaurantOnboardingScreen';
import * as Haptics from 'expo-haptics';

interface OnboardingStep3Props {
  data: RestaurantOnboardingData;
  updateData: (updates: Partial<RestaurantOnboardingData>) => void;
}

interface SubscriptionPlan {
  id: 'basic' | 'professional' | 'enterprise';
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    period: 'month',
    features: [
      'Up to 50 table requests/month',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      '1 restaurant location',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    period: 'month',
    features: [
      'Unlimited table requests',
      'Advanced analytics & insights',
      'Priority support',
      'Mobile app access',
      'Up to 3 restaurant locations',
      'Custom branding',
      'API access',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: 'month',
    features: [
      'Unlimited everything',
      'Real-time analytics dashboard',
      'Dedicated account manager',
      'White-label solution',
      'Unlimited locations',
      'Custom integrations',
      'Advanced API access',
      'SLA guarantee',
    ],
  },
];

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ data, updateData }) => {
  const handleSelectPlan = (planId: 'basic' | 'professional' | 'enterprise') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateData({ subscriptionPlan: planId });
  };

  return (
    <View>
      <Text style={styles.description}>
        Choose the plan that best fits your restaurant's needs. You can change or cancel anytime.
      </Text>

      <View style={styles.plansContainer}>
        {PLANS.map((plan) => {
          const isSelected = data.subscriptionPlan === plan.id;
          const isPopular = plan.popular;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                isPopular && styles.planCardPopular,
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${plan.price}</Text>
                  <Text style={styles.period}>/{plan.period}</Text>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={isSelected ? colors.primary.main : colors.text.muted}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.status.info} />
        <Text style={styles.noteText}>
          All plans include a 14-day free trial. No credit card required to start.
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
  plansContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.background.card,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.glow + '20',
  },
  planCardPopular: {
    borderColor: colors.accent.purple,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.accent.purple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  popularText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 10,
  },
  planHeader: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  planName: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...typography.h1,
    color: colors.primary.main,
    fontWeight: '700',
  },
  period: {
    ...typography.body,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.xs,
  },
  selectedText: {
    ...typography.bodySmall,
    color: colors.primary.main,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.info + '10',
    borderColor: colors.status.info + '30',
    borderWidth: 1,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
});
