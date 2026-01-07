import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export function PermissionsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Location Permission</Text>
        <Text style={styles.subtitle}>Why we need it</Text>

        <Card style={styles.card}>
          <Text style={styles.description}>
            We use your location to find restaurants near you and show accurate distances.
            Your location is only used when you're actively searching for restaurants.
          </Text>
        </Card>

        <View style={styles.benefits}>
          <Text style={styles.benefitTitle}>Benefits:</Text>
          <Text style={styles.benefit}>• Find restaurants within walking distance</Text>
          <Text style={styles.benefit}>• Get accurate wait time estimates</Text>
          <Text style={styles.benefit}>• Discover hidden gems in your neighborhood</Text>
        </View>

        <Button
          title="Allow Location Access"
          onPress={() => {
            // In real app, request permission here
            // For now, just navigate forward
            navigation.navigate('Preferences' as never);
          }}
          variant="primary"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  benefits: {
    marginBottom: 32,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  benefit: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
});

