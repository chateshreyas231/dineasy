import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { ToggleRow } from '../../components/ToggleRow';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, typography, spacing, gradients, shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useProfileStore } from '../../store/useProfileStore';
import * as Haptics from 'expo-haptics';

export const RestaurantSettingsScreen: React.FC = () => {
  const { setUser, setRole, user } = useAppStore();
  const { signOut, userId } = useSessionStore();
  const { profile, loading, fetchProfile, updateProfile, updateExtra } = useProfileStore();
  const [notifications, setNotifications] = React.useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId && !profile) {
      fetchProfile(userId);
    }
  }, [userId, profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    setUser(null);
    setRole(null);
    // Navigation will be handled automatically by App.tsx when session becomes null
  };

  const handleSave = async () => {
    if (!profile) {
      Alert.alert('Error', 'Profile not loaded');
      return;
    }

    setSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update basic profile fields
      await updateProfile({
        full_name: fullName || null,
        phone: phone || null,
      });

      // Refresh profile to get latest data
      if (userId) {
        await fetchProfile(userId);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.soft as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.soft}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Settings</Text>

          {/* Profile Information */}
          <Card variant="glass3d" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              {!isEditing && (
                <Button
                  title="Edit"
                  onPress={() => setIsEditing(true)}
                  variant="secondary"
                  size="sm"
                  style={styles.editButton}
                />
              )}
            </View>

            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              editable={isEditing}
              style={!isEditing && styles.inputDisabled}
            />

            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={isEditing}
              style={!isEditing && styles.inputDisabled}
            />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{profile?.role || 'Not set'}</Text>
            </View>

            {isEditing && (
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="secondary"
                  size="md"
                  style={styles.cancelButton}
                />
                <Button
                  title={saving ? 'Saving...' : 'Save'}
                  onPress={handleSave}
                  variant="secondary"
                  size="md"
                  style={styles.saveButton}
                  disabled={saving}
                />
              </View>
            )}
          </Card>

          {/* Notifications */}
          <Card variant="glass3d" style={styles.card}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <ToggleRow
              label="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
          </Card>

          {/* Account Information */}
          <Card variant="glass" style={styles.card}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Profile ID</Text>
              <Text style={styles.valueSmall}>{profile?.id || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created</Text>
              <Text style={styles.valueSmall}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Updated</Text>
              <Text style={styles.valueSmall}>
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </Card>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="lg"
            style={styles.logoutButton}
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
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
  },
  valueSmall: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  editButton: {
    minWidth: 60,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
