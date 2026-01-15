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

export const RestaurantProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cuisine, setCuisine] = React.useState('');

  const handleComplete = () => {
    navigation.navigate('RestaurantHomeStatus' as never);
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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Add your restaurant details
          </Text>

          <Card style={styles.card}>
            <Input
              label="Address"
              placeholder="123 Main St, City, State"
              value={address}
              onChangeText={setAddress}
            />
            <Input
              label="Phone Number"
              placeholder="(555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Cuisine Type"
              placeholder="e.g., Italian, French, Japanese"
              value={cuisine}
              onChangeText={setCuisine}
            />
          </Card>

          <Button
            title="Complete Setup"
            onPress={handleComplete}
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
