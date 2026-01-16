import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { colors, typography, spacing } from '../../../theme';
import { RestaurantOnboardingData } from '../RestaurantOnboardingScreen';

interface OnboardingStep1Props {
  data: RestaurantOnboardingData;
  updateData: (updates: Partial<RestaurantOnboardingData>) => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ data, updateData }) => {
  return (
    <View>
      <Text style={styles.description}>
        Let's start with your restaurant's basic information
      </Text>

      <Card style={styles.card}>
        <Input
          placeholder="Restaurant Name *"
          value={data.restaurantName}
          onChangeText={(text) => updateData({ restaurantName: text })}
          leftIcon="restaurant-outline"
        />
        <Input
          placeholder="Cuisine Type"
          value={data.cuisine}
          onChangeText={(text) => updateData({ cuisine: text })}
          leftIcon="fast-food-outline"
        />
        <Input
          placeholder="Phone Number *"
          value={data.phone}
          onChangeText={(text) => updateData({ phone: text })}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />
        <Input
          placeholder="Manager Name *"
          value={data.managerName}
          onChangeText={(text) => updateData({ managerName: text })}
          leftIcon="person-outline"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Address</Text>
        <Input
          placeholder="Street Address *"
          value={data.address}
          onChangeText={(text) => updateData({ address: text })}
          leftIcon="location-outline"
        />
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              placeholder="City"
              value={data.city}
              onChangeText={(text) => updateData({ city: text })}
              containerStyle={styles.halfInput}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              placeholder="State"
              value={data.state}
              onChangeText={(text) => updateData({ state: text })}
              containerStyle={styles.halfInput}
            />
          </View>
        </View>
        <Input
          placeholder="ZIP Code"
          value={data.zipCode}
          onChangeText={(text) => updateData({ zipCode: text })}
          keyboardType="numeric"
          leftIcon="map-outline"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Capacity (Optional)</Text>
        <Input
          placeholder="Total Capacity"
          value={data.capacity}
          onChangeText={(text) => updateData({ capacity: text })}
          keyboardType="numeric"
          leftIcon="people-outline"
        />
        <Input
          placeholder="Number of Tables"
          value={data.numberOfTables}
          onChangeText={(text) => updateData({ numberOfTables: text })}
          keyboardType="numeric"
          leftIcon="grid-outline"
        />
        <Text style={styles.helperText}>
          You can add detailed table information later in settings
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  halfInput: {
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
