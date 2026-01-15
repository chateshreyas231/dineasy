import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface SiriOrbProps {
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
  colors?: {
    bg?: string;
    c1?: string;
    c2?: string;
    c3?: string;
  };
  animationDuration?: number;
}

// Colors matching the app theme 
const defaultColors = {
  bg: '#F8F9FA', // Light background from theme
  c1: '#FF6B92', // Vibrant pink from theme.primary.main
  c2: '#6B9FFF', // Medium blue from theme.accent.blue
  c3: '#B66DFF', // Soft purple from theme.accent.purple
};

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = 120,
  isListening = false,
  isThinking = false,
  colors,
  animationDuration = 20,
}) => {
  const finalColors = { ...defaultColors, ...colors };

  // Animation values for multiple rotating gradients
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;
  const rotate4 = useRef(new Animated.Value(0)).current;
  const rotate5 = useRef(new Animated.Value(0)).current;
  const rotate6 = useRef(new Animated.Value(0)).current;

  // Pulse animation based on state
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start all rotations at different speeds
    const rotations = [
      { anim: rotate1, speed: 2 },
      { anim: rotate2, speed: 2 },
      { anim: rotate3, speed: -3 },
      { anim: rotate4, speed: 2 },
      { anim: rotate5, speed: 1 },
      { anim: rotate6, speed: -2 },
    ];

    const anims = rotations.map(({ anim, speed }) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: (animationDuration * 1000) / Math.abs(speed),
          useNativeDriver: true,
        })
      )
    );

    anims.forEach((anim) => anim.start());

    // Pulse animation
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: isListening ? 1.15 : isThinking ? 1.1 : 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    return () => {
      anims.forEach((anim) => anim.stop());
      pulseAnim.stop();
    };
  }, [isListening, isThinking, animationDuration]);

  // Calculate responsive values based on size
  const blurAmount = size < 50 ? Math.max(size * 0.008, 1) : Math.max(size * 0.015, 4);
  const dotSize = size < 50 ? Math.max(size * 0.004, 0.05) : Math.max(size * 0.008, 0.1);
  const maskRadius = size < 30 ? 0 : size < 50 ? size * 0.05 : size < 100 ? size * 0.15 : size * 0.25;

  // Interpolate rotations
  const getRotation = (anim: Animated.Value, multiplier: number) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${360 * multiplier}deg`],
    });

  const r1 = getRotation(rotate1, 2);
  const r2 = getRotation(rotate2, 2);
  const r3 = getRotation(rotate3, -3);
  const r4 = getRotation(rotate4, 2);
  const r5 = getRotation(rotate5, 1);
  const r6 = getRotation(rotate6, -2);

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: 'transparent' }]}>
      {/* Base background */}
      <View
        style={[
          styles.baseLayer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: finalColors.bg,
          },
        ]}
      />

      {/* Multiple rotating gradient layers to simulate conic gradients */}
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            transform: [{ rotate: r1 }, { scale: pulseScale }],
            opacity: 0.9,
            left: -size * 0.25,
            top: -size * 0.25,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c3, 'transparent', 'transparent', finalColors.c3]}
          locations={[0, 0.2, 0.8, 1]}
          start={{ x: 0.25, y: 0.7 }}
          end={{ x: 0.75, y: 0.3 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            transform: [{ rotate: r2 }],
            opacity: 0.85,
            left: -size * 0.2,
            top: -size * 0.2,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c2, 'transparent', 'transparent', finalColors.c2]}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0.45, y: 0.75 }}
          end={{ x: 0.55, y: 0.25 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: (size * 1.6) / 2,
            transform: [{ rotate: r3 }],
            opacity: 0.8,
            left: -size * 0.3,
            top: -size * 0.3,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c1, 'transparent', 'transparent', finalColors.c1]}
          locations={[0, 0.4, 0.6, 1]}
          start={{ x: 0.8, y: 0.2 }}
          end={{ x: 0.2, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: (size * 1.3) / 2,
            transform: [{ rotate: r4 }],
            opacity: 0.85,
            left: -size * 0.15,
            top: -size * 0.15,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c2, 'transparent', 'transparent', finalColors.c2]}
          locations={[0, 0.1, 0.9, 1]}
          start={{ x: 0.15, y: 0.05 }}
          end={{ x: 0.85, y: 0.95 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            transform: [{ rotate: r5 }],
            opacity: 0.8,
            left: -size * 0.25,
            top: -size * 0.25,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c1, 'transparent', 'transparent', finalColors.c1]}
          locations={[0, 0.1, 0.9, 1]}
          start={{ x: 0.2, y: 0.8 }}
          end={{ x: 0.8, y: 0.2 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.gradientLayer,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            transform: [{ rotate: r6 }],
            opacity: 0.8,
            left: -size * 0.2,
            top: -size * 0.2,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.c3, 'transparent', 'transparent', finalColors.c3]}
          locations={[0, 0.2, 0.8, 1]}
          start={{ x: 0.85, y: 0.1 }}
          end={{ x: 0.15, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Center dot overlay */}
      <View
        style={[
          styles.centerDot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <LinearGradient
          colors={[finalColors.bg, 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: size / 2,
            },
          ]}
        />
      </View>

      {/* Mask overlay for center (simulated with another gradient) */}
      {maskRadius > 0 && (
        <View
          style={[
            styles.maskOverlay,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', finalColors.bg]}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: size / 2,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden', // Clip to circular bounds
  },
  baseLayer: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientLayer: {
    position: 'absolute',
    opacity: 0.7,
  },
  centerDot: {
    position: 'absolute',
    opacity: 0.9,
  },
  maskOverlay: {
    position: 'absolute',
    opacity: 0.6,
  },
});

export default SiriOrb;
