import React from 'react';
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
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';

export const ClaimVerifyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [restaurantName, setRestaurantName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleContinue = () => {
    navigation.navigate('RestaurantProfileSetup' as never);
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Claim Your Restaurant</Text>
          <Text style={styles.subtitle}>
            Verify your business to get started
          </Text>

          <Card style={styles.card}>
            <Input
              label="Restaurant Name"
              placeholder="Enter restaurant name"
              value={restaurantName}
              onChangeText={setRestaurantName}
            />
            <Input
              label="Business Email"
              placeholder="your@restaurant.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
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
    </LinearGradient>
  );
};

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
  button: {
    marginTop: spacing.md,
  },
});
