import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme';

interface VoiceWaveformProps {
  isActive?: boolean;
  barCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive = false,
  barCount = 5,
}) => {
  const animations = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      const anims = animations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300 + index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300 + index * 100,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.parallel(anims).start();
    } else {
      animations.forEach((anim) => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.25, 1], // 8/32 = 0.25, 32/32 = 1
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
  },
  bar: {
    width: 3,
    height: 32,
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
});
