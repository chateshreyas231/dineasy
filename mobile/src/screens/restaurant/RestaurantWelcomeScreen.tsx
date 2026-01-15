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
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';

export const RestaurantWelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

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
          <Text style={styles.title}>Welcome to Dineasy</Text>
          <Text style={styles.subtitle}>
            Manage your restaurant reservations with ease
          </Text>

          <View style={styles.features}>
            <Text style={styles.feature}>✓ Request Management</Text>
            <Text style={styles.feature}>✓ Real-time Availability</Text>
            <Text style={styles.feature}>✓ Analytics & Insights</Text>
          </View>

          <Button
            title="Get Started"
            onPress={() => navigation.navigate('ClaimVerify' as never)}
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
    justifyContent: 'center',
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  features: {
    marginBottom: spacing.xl,
  },
  feature: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
});
