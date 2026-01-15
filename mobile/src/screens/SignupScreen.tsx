import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, typography, spacing, radius } from '../theme';
import { authService } from '../services/authService';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
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

    setLoading(true);
    setError('');

    try {
      const result = await authService.registerWithEmail(email, password, name);
      
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigation will be handled by RoleSwitcher
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Registration failed');
      }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              leftIcon="person-outline"
            />
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
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.signupButton}
            />

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
  signupButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
