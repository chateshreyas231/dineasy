import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface SiriOrbProps {
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
  colors?: {
    bg?: string;
    palette?: string[]; // unlimited colors
  };
  animationDuration?: number; // seconds
  background?: 'light' | 'dark';
  speedMultiplier?: number; // 1 = normal, 2 = 2x, etc.
  maxBlobs?: number; // optional performance cap (default 8)
}

const defaultColors = {
  bg: 'rgba(255,255,255,0.06)',
  palette: [
    '#A7DDF0',
    '#62C2E8',
    '#B9F6A5',
    '#62E6C6',
    '#FFC2D6',
    '#FFF2B8',
  ],
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/**
 * Smooth looping wave (no sharp endpoints).
 * This is a "rounded triangle wave" approximation using keyframes.
 */
const wave = (t: Animated.Value, amp: number) =>
  t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, amp, 0, -amp, 0],
  });

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = 120,
  isListening = false,
  isThinking = false,
  colors,
  animationDuration = 6,
  background = 'light',
  speedMultiplier,
  maxBlobs = 8,
}) => {
  const finalColors = { ...defaultColors, ...colors };
  const palette = (finalColors.palette?.length ? finalColors.palette : defaultColors.palette).slice(
    0,
    maxBlobs
  );

  // Two time streams to hide loop reset
  const tA = useRef(new Animated.Value(0)).current;
  const tB = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const speed = useMemo(() => {
    if (typeof speedMultiplier === 'number') return clamp(speedMultiplier, 0.6, 4);
    return isListening ? 2.2 : isThinking ? 1.6 : 1.2;
  }, [isListening, isThinking, speedMultiplier]);

  useEffect(() => {
    const dur = Math.max(650, (animationDuration * 1000) / speed);

    // A: 0 -> 1 (loop)
    tA.setValue(0);
    const loopA = Animated.loop(
      Animated.timing(tA, { toValue: 1, duration: dur, useNativeDriver: true })
    );

    // B: same loop but starts half-cycle ahead: 0.5 -> 1.5
    tB.setValue(0.5);
    const loopB = Animated.loop(
      Animated.timing(tB, { toValue: 1.5, duration: dur, useNativeDriver: true })
    );

    loopA.start();
    loopB.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: isListening ? 1.06 : isThinking ? 1.035 : 1.02,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      loopA.stop();
      loopB.stop();
      pulseLoop.stop();
    };
  }, [animationDuration, speed, isListening, isThinking, tA, tB, pulse]);

  const circle = size;

  // Big blobs so their edges never appear inside the circle
  const blobBase = circle * 2.25;
  const travelBase = circle * 0.28;

  // Crossfade so the reset is invisible
  const fadeA = tA.interpolate({
    inputRange: [0, 0.08, 0.92, 1],
    outputRange: [0, 1, 1, 0],
  });
  const fadeB = tB.interpolate({
    inputRange: [0.5, 0.58, 1.42, 1.5],
    outputRange: [0, 1, 1, 0],
  });

  const glowOpacity = background === 'dark' ? 0.55 : 0.0; // set to >0 on light if you want
  const rimOpacity = background === 'dark' ? 0.35 : 0.22;

  /**
   * Build per-blob parameters from palette length
   * More colors => smaller + lower opacity blobs so it stays clean.
   */
  const blobSpecs = useMemo(() => {
    const n = palette.length;

    return palette.map((color, i) => {
      const depth = i / Math.max(1, n - 1); // 0..1
      const scale = 1 - depth * 0.32;       // deepest blobs smaller
      const opacity = 0.9 - depth * 0.45;   // deepest blobs dimmer

      // vary travel a bit per blob (organic feel)
      const travel = travelBase * (0.95 - depth * 0.25);

      // vary rotation per blob
      const rotDeg = 260 + i * 90;

      // vary direction patterns
      const xAmp = travel * (i % 2 === 0 ? 1 : -0.9);
      const yAmp = travel * (i % 3 === 0 ? -0.8 : 0.75);

      return { color, scale, opacity, xAmp, yAmp, rotDeg };
    });
  }, [palette, travelBase]);

  return (
    <View style={[styles.wrap, { width: circle, height: circle }]}>
      {/* Outer glow */}
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: circle * 1.22,
            height: circle * 1.22,
            borderRadius: (circle * 1.22) / 2,
            opacity: glowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(51,214,255,0.55)',
            'rgba(106,92,255,0.55)',
            'rgba(255,61,127,0.45)',
          ]}
          start={{ x: 0.15, y: 0.2 }}
          end={{ x: 0.85, y: 0.85 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Glass bubble */}
      <Animated.View
        style={[
          styles.bubble,
          {
            width: circle,
            height: circle,
            borderRadius: circle / 2,
            //transform: [{ scale: pulse }],
            backgroundColor: finalColors.bg,
          },
        ]}
      >
        {/* Clip everything to circle */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: circle / 2, overflow: 'hidden' }]}>
          {/* ===== Dynamic blobs from palette (A + B crossfade) ===== */}
          {blobSpecs.map((spec, i) => {
            const blob = blobBase * spec.scale;

            const left = -((blob - circle) / 2);
            const top = -((blob - circle) / 2);

            const xA = wave(tA, spec.xAmp);
            const yA = wave(tA, spec.yAmp);
            const rA = tA.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${spec.rotDeg}deg`],
            });

            const xB = wave(tB, spec.xAmp);
            const yB = wave(tB, spec.yAmp);
            const rB = tB.interpolate({
              inputRange: [0.5, 1.5],
              outputRange: ['180deg', `${spec.rotDeg + 180}deg`],
            });

            // blend opacity and fade
            const opA = Animated.multiply(spec.opacity, fadeA);
            const opB = Animated.multiply(spec.opacity, fadeB);

            // pick neighbor color for richer blending
            const next = blobSpecs[(i + 1) % blobSpecs.length]?.color ?? spec.color;

            return (
              <React.Fragment key={`${spec.color}-${i}`}>
                {/* A */}
                <Animated.View
                  style={[
                    styles.blob,
                    {
                      width: blob,
                      height: blob,
                      borderRadius: blob / 2,
                      left,
                      top,
                      transform: [{ translateX: xA }, { translateY: yA }, { rotate: rA }],
                      opacity: opA,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[spec.color, next, 'rgba(255,255,255,0)']}
                    start={{ x: 0.18, y: 0.22 }}
                    end={{ x: 0.86, y: 0.86 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>

                {/* B */}
                <Animated.View
                  style={[
                    styles.blob,
                    {
                      width: blob,
                      height: blob,
                      borderRadius: blob / 2,
                      left,
                      top,
                      transform: [{ translateX: xB }, { translateY: yB }, { rotate: rB }],
                      opacity: opB,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[spec.color, next, 'rgba(255,255,255,0)']}
                    start={{ x: 0.18, y: 0.22 }}
                    end={{ x: 0.86, y: 0.86 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </React.Fragment>
            );
          })}

          {/* Edge vignette to hide any boundary near rim */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.85 }]}
          />

          {/* Soft inner fade (glass) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)']}
            start={{ x: 0.15, y: 0.15 }}
            end={{ x: 0.85, y: 0.85 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
          />

          {/* Gloss highlight (top-left) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.70)', 'rgba(255,255,255,0)']}
            start={{ x: 0.05, y: 0.05 }}
            end={{ x: 0.6, y: 0.6 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.65 }]}
          />
        </View>

        {/* Rim */}
        <View
          pointerEvents="none"
          style={[
            styles.rim,
            {
              borderRadius: circle / 2,
              opacity: rimOpacity,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#6A5CFF',
        shadowOpacity: 0.35,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 },
      },
      android: { elevation: 10 },
    }),
  },
  bubble: {
    position: 'absolute',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },
  blob: {
    position: 'absolute',
  },
  rim: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
});

export default SiriOrb;
