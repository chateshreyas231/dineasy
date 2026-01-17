import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, typography, spacing, gradients, shadows } from '../../theme';
import { supabase } from '../../lib/supabase';
import { createRequest } from '../../data/requests';
import * as Haptics from 'expo-haptics';

export const RequestTableScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant_id = (route.params as any)?.restaurant_id as string;
  const [restaurantName, setRestaurantName] = useState<string>('');

  const [partySize, setPartySize] = useState(2);
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant_id) {
      // Fetch restaurant name from Supabase
      supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurant_id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setRestaurantName(data.name);
          } else if (error) {
            console.error('Error fetching restaurant:', error);
          }
        });
    }
  }, [restaurant_id]);

  const handleSubmit = async () => {
    if (!dateTime || !restaurant_id) {
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Convert dateTime to ISO string format
      const datetime = new Date(dateTime).toISOString();
      
      // Create table request
      const request = await createRequest({
        restaurant_id,
        datetime,
        party_size: partySize,
        notes: notes || null,
      });

      if (!request) {
        throw new Error('Failed to create request');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to status screen with requestId
      navigation.navigate('RequestStatus' as never, { requestId: request.id } as never);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant_id) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.soft as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Request Table</Text>
          {restaurantName ? (
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          ) : null}

          <Card variant="glass3d" style={styles.card}>
            <Input
              label="Date & Time"
              placeholder="e.g., Tomorrow 7:00 PM"
              value={dateTime}
              onChangeText={setDateTime}
            />
            <Input
              label="Party Size"
              placeholder="Number of guests"
              value={partySize.toString()}
              onChangeText={(text) => setPartySize(parseInt(text) || 2)}
              keyboardType="numeric"
            />
            <Input
              label="Special Requests (Optional)"
              placeholder="Any dietary restrictions or preferences..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </Card>

          <Button
            title="Submit Request"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!dateTime || loading}
            style={styles.button}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  restaurantName: {
    ...typography.h3,
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
