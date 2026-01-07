import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface AIOrbProps {
  size?: number;
  listening?: boolean;
  thinking?: boolean;
  style?: any;
}

// Fallback version using standard React Native Animated API
// This avoids worklets issues with Expo Go
export function AIOrb({ size = 200, listening = false, thinking = false, style }: AIOrbProps) {
  const [scale] = useState(new RNAnimated.Value(1));
  const [rotation] = useState(new RNAnimated.Value(0));
  const [pulse] = useState(new RNAnimated.Value(0));
  const [glow] = useState(new RNAnimated.Value(0.5));

  useEffect(() => {
    // Continuous rotation
    RNAnimated.loop(
      RNAnimated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (listening) {
      // Active listening animation - faster pulse
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(scale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          RNAnimated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(glow, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false, // opacity doesn't support native driver
          }),
          RNAnimated.timing(glow, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else if (thinking) {
      // Thinking animation - slower, more subtle
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(scale, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          RNAnimated.timing(scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      RNAnimated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(glow, {
        toValue: 0.5,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [listening, thinking, scale, rotation, pulse, glow]);

  const rotationInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // Use scale instead of width/height for native driver compatibility
  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const innerScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.5],
  });

  const innerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  // Define colors as constants
  const primaryColor = colors.primary.main;
  const accentPink = colors.accent.pink;
  const accentViolet = colors.accent.violet;
  const primaryLight = colors.primary.light;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Outer glow */}
      <RNAnimated.View
        style={[
          styles.glow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[primaryColor, accentPink, primaryColor]}
          style={styles.glowGradient}
        />
      </RNAnimated.View>

      {/* Main orb */}
      <RNAnimated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }, { rotate: rotationInterpolate }],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={[primaryColor, accentPink, accentViolet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
        
        {/* Inner glow */}
        <RNAnimated.View
          style={[
            styles.innerGlow,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size / 2,
              opacity: innerOpacity,
              transform: [{ scale: innerScale }],
            },
          ]}
        >
          <LinearGradient
            colors={[accentPink, primaryLight]}
            style={styles.innerGlowGradient}
          />
        </RNAnimated.View>

        {/* Mesh pattern overlay */}
        <View style={styles.meshOverlay}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.meshLine,
                {
                  transform: [{ rotate: `${i * 45}deg` }],
                },
              ]}
            />
          ))}
        </View>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.primary.main,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  orb: {
    position: 'relative',
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  innerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  innerGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  meshOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  meshLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.accent.pink,
    left: '50%',
    top: 0,
    opacity: 0.4,
  },
});
