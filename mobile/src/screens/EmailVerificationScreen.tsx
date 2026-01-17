import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, typography, spacing, radius } from '../theme';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { useProfileStore } from '../store/useProfileStore';

type EmailVerificationRouteParams = {
  email: string;
  password: string;
  name: string;
  restaurantName?: string;
  phone?: string;
};

type RouteParams = {
  EmailVerification: EmailVerificationRouteParams;
};

const CODE_LENGTH = 6;

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EmailVerification'>>();
  const { email, password, name, restaurantName, phone } = route.params;
  const { setUser, setRole } = useAppStore();
  const { fetchProfile } = useProfileStore();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Determine if this is a restaurant signup based on route params (more reliable than store role)
  const isRestaurant = !!restaurantName;

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste - split the pasted value across inputs
      const digits = digit.slice(0, CODE_LENGTH).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = d;
        }
      });
      setCode(newCode);
      
      // Focus the last filled input or the last input
      const lastFilledIndex = Math.min(index + digits.length - 1, CODE_LENGTH - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      
      // Auto-verify if all digits are filled
      if (newCode.every(d => d !== '')) {
        handleVerify(newCode.join(''));
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when last digit is entered
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    setError('');
    Keyboard.dismiss();

    try {
      // Verify the OTP code with Supabase
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: 'signup',
      });

      if (verifyError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(verifyError.message || 'Invalid verification code');
        setLoading(false);
        return;
      }

      if (!verifyData.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Verification failed. Please try again.');
        setLoading(false);
        return;
      }

      // Create profile after successful verification (use upsert to handle existing profiles)
      const userRole = isRestaurant ? 'restaurant' : 'diner';
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: verifyData.user.id,
          role: userRole,
          full_name: name,
          phone: isRestaurant ? phone : null,
        })
        .select()
        .single();

      if (profileError) {
        // If profile already exists (duplicate key), just fetch it
        if (profileError.code === '23505') {
          console.log('Profile already exists, fetching existing profile');
          await fetchProfile(verifyData.user.id);
          // Continue with the flow - don't return early
        } else {
          console.error('Profile creation error:', profileError);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(`Failed to create profile: ${profileError.message}`);
          setLoading(false);
          return;
        }
      }

      // Create restaurant record if restaurant role
      if (isRestaurant && restaurantName && phone) {
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            owner_user_id: verifyData.user.id,
            name: restaurantName,
            phone: phone,
            // Address, city, lat, lng, cuisine, price_level will be added during onboarding
          });

        if (restaurantError) {
          console.error('Restaurant creation error:', restaurantError);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('Failed to create restaurant');
          setLoading(false);
          return;
        }
      }

      // Fetch profile to update profile store (RootNavigator uses profile store)
      await fetchProfile(verifyData.user.id);

      // Set user in store (triggers navigation via App.tsx routing)
      setUser({
        id: verifyData.user.id,
        email: verifyData.user.email!,
        name,
        role: userRole,
      });
      
      // Also update role in app store to ensure consistency
      setRole(userRole);

      // Session is automatically created by Supabase and handled via session store subscription
      // This will trigger navigation in App.tsx to RootNavigator, which shows onboarding for restaurants
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigation will happen automatically via session store subscription in App.tsx
      setLoading(false);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      // Resend the OTP code
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(resendError.message || 'Failed to resend code');
        setResendLoading(false);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Code Resent',
        'A new verification code has been sent to your email.',
        [{ text: 'OK' }]
      );
      
      // Clear the code inputs
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Card style={styles.codeCard}>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeInput,
                    digit ? styles.codeInputFilled : null,
                    error ? styles.codeInputError : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>
          </Card>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendLoading || loading}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendText,
                  (resendLoading || loading) && styles.resendTextDisabled,
                ]}
              >
                {resendLoading ? 'Sending...' : "Didn't receive code? Resend"}
              </Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={() => handleVerify()}
              variant="secondary"
              size="lg"
              loading={loading}
              disabled={code.some(d => !d) || loading}
              style={styles.verifyButton}
            />
          </View>
        </View>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    color: colors.text.primary,
    fontWeight: '600',
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
  codeCard: {
    marginBottom: spacing.xl,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  codeInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  codeInputFilled: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  codeInputError: {
    borderColor: colors.status.error,
  },
  actions: {
    gap: spacing.md,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resendText: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.text.muted,
  },
  verifyButton: {
    marginTop: spacing.sm,
  },
});
