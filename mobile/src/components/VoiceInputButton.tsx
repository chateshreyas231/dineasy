import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { VoiceWaveform } from './VoiceWaveform';

interface VoiceInputButtonProps {
  onPress: () => void;
  listening: boolean;
  size?: number;
}

// Fallback version using standard React Native Animated API
export function VoiceInputButton({ onPress, listening, size = 60 }: VoiceInputButtonProps) {
  const [scale] = useState(new RNAnimated.Value(1));
  const [opacity] = useState(new RNAnimated.Value(0.7));

  useEffect(() => {
    if (listening) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(scale, {
            toValue: 1.1,
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
          RNAnimated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          RNAnimated.timing(opacity, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      RNAnimated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(opacity, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [listening, scale, opacity]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.buttonContainer, { width: size, height: size, borderRadius: size / 2 }]}
      activeOpacity={0.8}
    >
      <RNAnimated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.glow,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </RNAnimated.View>
      {listening ? (
        <VoiceWaveform listening={listening} barCount={5} maxHeight={size * 0.6} minHeight={size * 0.1} color="#FFFFFF" />
      ) : (
        <Ionicons name="mic" size={size * 0.5} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    borderRadius: 1000,
  },
});
