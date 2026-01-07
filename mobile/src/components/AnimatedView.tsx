import React, { useEffect, useState } from 'react';
import { ViewStyle, Animated as RNAnimated } from 'react-native';

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'spring';
}

// Using standard React Native Animated API for Expo Go compatibility
export function AnimatedView({
  children,
  style,
  delay = 0,
  duration = 500,
  animation = 'fade',
}: AnimatedViewProps) {
  const [opacity] = useState(new RNAnimated.Value(0));
  const [translateY] = useState(
    new RNAnimated.Value(animation === 'slideUp' ? 50 : animation === 'slideDown' ? -50 : 0)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const animations: RNAnimated.CompositeAnimation[] = [
        RNAnimated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];

      if (animation === 'slideUp' || animation === 'slideDown') {
        animations.push(
          RNAnimated.spring(translateY, {
            toValue: 0,
            damping: 15,
            stiffness: 100,
            useNativeDriver: true,
          })
        );
      }

      RNAnimated.parallel(animations).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, animation, opacity, translateY]);

  const animatedStyle: any = {
    opacity,
  };

  if (animation === 'slideUp' || animation === 'slideDown') {
    animatedStyle.transform = [{ translateY }];
  } else if (animation === 'spring') {
    animatedStyle.transform = [{ scale: opacity }];
  }

  return (
    <RNAnimated.View style={[animatedStyle, style]}>
      {children}
    </RNAnimated.View>
  );
}
