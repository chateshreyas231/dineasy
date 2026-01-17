import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, typography, spacing, gradients, shadows, radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useProfileStore } from '../../store/useProfileStore';
import * as Haptics from 'expo-haptics';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAppStore();
  const { signOut, userId } = useSessionStore();
  const { profile, loading, fetchProfile, updateExtra, updateProfile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal', 'Pescatarian', 'Dairy-Free'];

  useEffect(() => {
    if (userId && !profile) {
      fetchProfile(userId);
    }
  }, [userId, profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setDietary(profile.extra?.dietary || []);
    }
  }, [profile]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    setUser(null);
    // Navigation will be handled automatically by App.tsx when session becomes null
  };

  const handleSetVegetarian = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateExtra({ dietary: ['vegetarian'] });
      setDietary(['vegetarian']);
      Alert.alert('Success', 'Dietary preference updated to vegetarian');
    } catch (error) {
      console.error('Error setting vegetarian:', error);
      Alert.alert('Error', 'Failed to update dietary preference');
    }
  };

  const toggleDietary = (option: string) => {
    const lowerOption = option.toLowerCase();
    if (dietary.includes(lowerOption)) {
      setDietary(dietary.filter((d) => d !== lowerOption));
    } else {
      setDietary([...dietary, lowerOption]);
    }
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
      try {
        await updateProfile({
          full_name: fullName || null,
          phone: phone || null,
        });
        console.log('Profile basic fields updated successfully');
      } catch (error) {
        console.error('Error updating basic profile fields:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile fields';
        Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
        setSaving(false);
        return;
      }

      // Update dietary preferences in extra
      try {
        await updateExtra({ dietary });
        console.log('Dietary preferences updated successfully');
      } catch (error) {
        console.error('Error updating dietary preferences:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update dietary preferences';
        Alert.alert('Error', `Failed to update dietary preferences: ${errorMessage}`);
        setSaving(false);
        return;
      }

      // Update local state from the updated profile in the store
      // updateProfile and updateExtra already update the profile state, so we can use it directly
      const updatedProfile = useProfileStore.getState().profile;
      if (updatedProfile) {
        setFullName(updatedProfile.full_name || '');
        setPhone(updatedProfile.phone || '');
        setDietary(updatedProfile.extra?.dietary || []);
      }
      
      setIsEditing(false);
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
      setDietary(profile.extra?.dietary || []);
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
        colors={gradients.soft as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>PROFILE</Text>
            {!isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditing(true);
                }}
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={18} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.iconButton, saving && styles.iconButtonDisabled]}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  ) : (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Temporary Set Vegetarian Button */}
          {/* <Card variant="glass3d" style={styles.card}>
            <Button
              title="Set vegetarian (Temporary)"
              onPress={handleSetVegetarian}
              variant="secondary"
              size="md"
              style={styles.tempButton}
            />
          </Card> */}

          {/* Basic Information */}
          <Card variant="glass3d" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
            </View>

            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              editable={isEditing}
            />

            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={isEditing}
            />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{profile?.role || 'Not set'}</Text>
            </View>
          </Card>

          {/* Dietary Preferences */}
          <Card variant="glass3d" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>DIETARY PREFERENCES</Text>
            </View>

            <View style={styles.dietarySelector}>
              {dietaryOptions.map((option) => {
                const isSelected = dietary.includes(option.toLowerCase());
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dietaryButton,
                      isSelected && styles.dietaryButtonActive,
                    ]}
                    onPress={isEditing ? () => toggleDietary(option) : undefined}
                    activeOpacity={0.7}
                    disabled={!isEditing}
                  >
                    <Text
                      style={[
                        styles.dietaryButtonText,
                        isSelected && styles.dietaryButtonTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {dietary.length === 0 && !isEditing && (
              <Text style={styles.emptyText}>No dietary preferences set</Text>
            )}
          </Card>


          {/* Profile Metadata */}
          <Card variant="glass" style={styles.card}>
            <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  card: {
    marginBottom: spacing.md,
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
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    marginTop: spacing.lg,
  },
  tempButton: {
    marginBottom: spacing.sm,
  },
  dietarySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dietaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dietaryButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  dietaryButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dietaryButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
