import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.navigate('Permissions' as never);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>Dineasy</Text>
        <Text style={styles.tagline}>Extraordinary Dining Experiences</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    ...typography.display,
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.h3,
    color: colors.text.muted,
  },
});
