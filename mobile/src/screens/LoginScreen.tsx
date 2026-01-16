import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, typography, spacing, radius } from '../theme';
import { authService } from '../services/authService';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

const ADMIN_EMAIL = 'admin@dineasy.com';
const ADMIN_PASSWORD = 'admin123';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, role } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.loginWithEmail(email, password);
      
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigation will be handled by RoleSwitcher based on user state
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.signInWithGoogle();
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || 'Google sign in not configured');
      }
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
      const result = await authService.signInWithApple();
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || 'Apple sign in not configured');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.loginWithEmail(ADMIN_EMAIL, ADMIN_PASSWORD);
      
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Set admin role to diner by default (can switch)
        useAppStore.getState().setRole('diner');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Admin login failed');
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Admin login failed');
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="secondary"
              size="md"
              loading={loading}
              style={styles.loginButton}
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

            <View style={styles.adminSection}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ADMIN ACCESS</Text>
                <View style={styles.dividerLine} />
              </View>
              <Button
                title="Login as Admin"
                onPress={handleAdminLogin}
                variant="secondary"
                size="md"
                style={styles.adminButton}
              />
              <Text style={styles.adminHint}>
                Email: admin@dineasy.com{'\n'}Password: admin123
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Signup' as never)}
              style={styles.signupLink}
            >
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupLinkText}>Sign Up</Text>
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
  },
  form: {
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
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
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
  },
  signupLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  signupText: {
    ...typography.body,
    color: colors.text.muted,
  },
  signupLinkText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  adminSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  adminButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  adminHint: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    fontSize: 11,
  },
});
