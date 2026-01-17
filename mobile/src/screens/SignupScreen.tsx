import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useProfileStore } from '../store/useProfileStore';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, setRole, role } = useAppStore();
  const { fetchProfile } = useProfileStore();
  
  // Basic auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Restaurant-specific fields (minimal - just what's needed for account creation)
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRestaurant = role === 'restaurant';

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Restaurant-specific validation (minimal - just name and phone)
    if (isRestaurant) {
      if (!restaurantName || !phone) {
        setError('Please provide restaurant name and phone number');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Call Supabase signUp directly to get full response including user data
      // Note: Supabase needs to be configured to send OTP codes in email templates
      // The email template should include the OTP code (typically 6 digits)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Don't use redirect, use OTP code instead
        },
      });

      if (signUpError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Check if we have a user in the response
      const user = signUpData?.user;
      const session = signUpData?.session;

      // If no session, email confirmation is required
      if (!session) {
        // Navigate to email verification screen
        setLoading(false);
        navigation.navigate('EmailVerification' as never, {
          email,
          password,
          name,
          restaurantName: isRestaurant ? restaurantName : undefined,
          phone: isRestaurant ? phone : undefined,
        } as never);
        return;
      }

      // If we have a session but no user, something went wrong
      if (!user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      // Insert profile after successful signup (use insert since it's a new user)
      const userRole = isRestaurant ? 'restaurant' : 'diner';
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: userRole,
          full_name: name,
          phone: isRestaurant ? phone : null,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.error('Error details:', JSON.stringify(profileError, null, 2));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(`Failed to create profile: ${profileError.message || profileError.code || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      console.log('Profile created successfully:', profileData);

      // Insert minimal restaurant record if restaurant role
      // Additional details will be collected during onboarding
      if (isRestaurant) {
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            owner_user_id: user.id,
            name: restaurantName,
            phone: phone,
            // Address, city, lat, lng, cuisine, price_level will be added during onboarding
          });

        if (restaurantError) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('Failed to create restaurant');
          setLoading(false);
          return;
        }
      }

      // Fetch profile to update profile store (RootNavigator uses profile store)
      await fetchProfile(user.id);

      // Set user in store (triggers navigation via App.tsx routing)
      setUser({
        id: user.id,
        email: user.email!,
        name,
        role: userRole,
      });
      
      // Also update role in app store to ensure consistency
      setRole(userRole);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Google sign in requires OAuth setup - keeping placeholder for now
      setError('Google sign in not configured');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Apple sign in requires Apple Developer setup - keeping placeholder for now
      setError('Apple sign in not configured');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
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
            <Text style={styles.title}>
              {isRestaurant ? 'Restaurant Sign Up' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isRestaurant ? 'Register your restaurant' : 'Sign up to get started'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Basic Account Information */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {isRestaurant ? 'Account Information' : 'Account Details'}
              </Text>
              
              <View style={styles.inputWrapper}>
                <Input
                  placeholder={isRestaurant ? 'Manager Name' : 'Full Name'}
                  value={name}
                  onChangeText={setName}
                  leftIcon="person-outline"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                />
              </View>
            </Card>

            {/* Restaurant-Specific Fields - Minimal info only */}
            {isRestaurant && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Restaurant Information</Text>
                <Text style={styles.helperText}>
                  We'll collect additional details in the next step
                </Text>
                
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Restaurant Name *"
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                    leftIcon="restaurant-outline"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Phone Number *"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                  />
                </View>
              </Card>
            )}

            <Button
              title={isRestaurant ? 'Create Restaurant Account' : 'Sign Up'}
              onPress={handleSignup}
              variant="secondary"
              size="lg"
              loading={loading}
              style={styles.signupButton}
            />

            {role !== 'restaurant' && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="secondary"
                  size="lg"
                  style={styles.socialButton}
                />

                {Platform.OS === 'ios' && (
                  <Button
                    title="Continue with Apple"
                    onPress={handleAppleSignIn}
                    variant="secondary"
                    size="lg"
                    style={styles.socialButton}
                  />
                )}
              </>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
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
  sectionCard: {
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  halfInput: {
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  signupButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.medium,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginHorizontal: spacing.md,
  },
  socialButton: {
    marginBottom: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  loginLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    ...typography.body,
    color: colors.text.muted,
  },
  loginLinkText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});
