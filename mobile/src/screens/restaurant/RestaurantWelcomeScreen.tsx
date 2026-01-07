import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export function RestaurantWelcomeScreen() {
  const navigation = useNavigation();
  const restaurantProfile = useAppStore((state) => state.restaurantProfile);

  if (restaurantProfile?.verified) {
    // Already verified, navigate to main app
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.title}>Manage Dineasy Requests</Text>
        <Text style={styles.subtitle}>
          Connect with diners and manage table requests in real-time
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardText}>
            Claim your restaurant to start receiving table requests from diners in your area.
          </Text>
        </Card>

        <Button
          title="Claim / Verify Restaurant"
          onPress={() => navigation.navigate('ClaimVerify' as never)}
          variant="primary"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

