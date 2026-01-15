import React, { ReactNode } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedViewProps {
  children: ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  delay = 0,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
