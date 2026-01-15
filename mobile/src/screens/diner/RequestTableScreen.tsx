import React, { useState } from 'react';
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
import { colors, typography, spacing } from '../../theme';
import { Restaurant, TableRequest } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import * as Haptics from 'expo-haptics';

export const RequestTableScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addRequest, user } = useAppStore();
  const restaurant = (route.params as any)?.restaurant as Restaurant;

  const [partySize, setPartySize] = useState(2);
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!dateTime || !restaurant) {
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create table request
      const request: TableRequest = {
        id: Date.now().toString(),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        dateTime: new Date(dateTime),
        partySize,
        status: 'pending',
        notes: notes || undefined,
      };

      addRequest(request);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to status screen
      navigation.navigate('RequestStatus' as never, { request } as never);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Request Table</Text>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <Card style={styles.card}>
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
    backgroundColor: '#F8F9FA',
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
