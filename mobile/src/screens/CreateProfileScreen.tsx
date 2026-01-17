import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { colors, typography, spacing, radius } from '../theme';
import { useProfileStore } from '../store/useProfileStore';
import { useSessionStore } from '../store/useSessionStore';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';

export const CreateProfileScreen: React.FC = () => {
  const { userId } = useSessionStore();
  const { fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProfile = async () => {
    if (!userId) {
      setError('No user ID available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upsert profile with default role 'diner' (use upsert to handle existing profiles)
      const { data, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'diner',
          name: null,
          phone: null,
          extra: {},
          push_token: null,
        })
        .select()
        .single();

      if (createError) {
        // If profile already exists (duplicate key), just fetch it
        if (createError.code === '23505') {
          console.log('Profile already exists, fetching existing profile');
          await fetchProfile(userId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        }
        throw createError;
      }

      // Fetch the newly created profile
      await fetchProfile(userId);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Profile</Text>
            <Text style={styles.subtitle}>
              We need to set up your profile to get started
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.content}>
            <Text style={styles.description}>
              Your profile will be created with the default role of "diner". You can change this later in settings.
            </Text>

            <Button
              title={loading ? 'Creating...' : 'Create Profile'}
              onPress={handleCreateProfile}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.button}
            />
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
  content: {
    width: '100%',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});
