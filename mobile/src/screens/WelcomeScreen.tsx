import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { AIOrb } from '../components/AIOrb';
import { AnimatedView } from '../components/AnimatedView';
import { colors } from '../theme/colors';

export function WelcomeScreen() {
  const setRole = useAppStore((state) => state.setRole);

  return (
    <LinearGradient
      colors={colors.gradients.background as any}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AnimatedView animation="spring" delay={200}>
            <View style={styles.logoContainer}>
              <AIOrb size={140} />
            </View>
          </AnimatedView>
          
          <AnimatedView animation="slideUp" delay={400}>
            <Text style={styles.title}>Dineasy</Text>
            <Text style={styles.subtitle}>Your AI-Powered Dining Assistant</Text>
            <Text style={styles.tagline}>Intelligent • Conversational • Agentic</Text>
          </AnimatedView>

          <AnimatedView animation="slideUp" delay={600}>
            <View style={styles.buttonContainer}>
              <Button
                title="Continue as Diner"
                onPress={() => setRole('diner')}
                variant="primary"
                fullWidth
              />
              <Button
                title="Continue as Restaurant"
                onPress={() => setRole('restaurant')}
                variant="secondary"
                fullWidth
              />
            </View>
          </AnimatedView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  tagline: {
    fontSize: 14,
    color: colors.primary.light,
    marginBottom: 48,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
});
