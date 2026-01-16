import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { AIOrb } from '../components/AIOrb';
import { colors, typography, spacing } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setRole, user } = useAppStore();

  const handleRoleSelect = (role: 'diner' | 'restaurant') => {
    setRole(role);
    // If user is logged in, navigate to app
    // Otherwise, show login screen
    if (user) {
      // Navigation handled by RoleSwitcher
    } else {
      navigation.navigate('Login' as never);
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
          <View style={styles.content}>
            <View style={styles.orbContainer}>
              <AIOrb size={140} />
            </View>

            <Text style={styles.title}>Dineasy</Text>
            <Text style={styles.subtitle}>
              Curated • Personalized • Effortless
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="I'm a Diner"
                onPress={() => handleRoleSelect('diner')}
                variant="secondary"
                size="md"
                style={styles.buttonStyle}
              />
              <Button
                title="I'm a Restaurant"
                onPress={() => handleRoleSelect('restaurant')}
                variant="secondary"
                size="md"
                style={styles.buttonStyle}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fallback color
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    width: '100%', // Ensure full width
  },
  content: {
    alignItems: 'center',
    width: '100%', // Ensure full width
  },
  orbContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160, // Ensure container has space
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: 48, // spacing['2xl']
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
    paddingHorizontal: 0, // Ensure no extra padding
    alignItems: 'stretch', // Ensure buttons fill container width
  },
  buttonStyle: {
    width: '100%',
    maxWidth: '100%', // Prevent expansion beyond container
    maxHeight: 70, // Limit button height
  },
});
