import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface VoiceWaveformProps {
  listening: boolean;
  barCount?: number;
  barWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  color?: string;
}

// Fallback version using standard React Native Animated API
export function VoiceWaveform({
  listening,
  barCount = 10,
  barWidth = 4,
  maxHeight = 40,
  minHeight = 5,
  color = colors.primary.main,
}: VoiceWaveformProps) {
  const [barHeights] = useState(
    Array.from({ length: barCount }).map(() => new RNAnimated.Value(minHeight))
  );

  useEffect(() => {
    if (listening) {
      barHeights.forEach((height, index) => {
        RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(height, {
              toValue: maxHeight * (0.5 + Math.random() * 0.5),
              duration: 200 + index * 20,
              useNativeDriver: false, // height doesn't support native driver
            }),
            RNAnimated.timing(height, {
              toValue: minHeight,
              duration: 200 + index * 20,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    } else {
      barHeights.forEach((height) => {
        RNAnimated.timing(height, {
          toValue: minHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [listening, barHeights, maxHeight, minHeight]);

  return (
    <View style={styles.container}>
      {barHeights.map((height, index) => (
        <RNAnimated.View
          key={index}
          style={[
            styles.bar,
            {
              width: barWidth,
              height,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    borderRadius: 2,
  },
});
