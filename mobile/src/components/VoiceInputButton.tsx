import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { VoiceWaveform } from './VoiceWaveform';

interface VoiceInputButtonProps {
  isListening?: boolean;
  onPress: () => void;
  size?: number;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening = false,
  onPress,
  size = 64,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.container, { width: size, height: size }]}
    >
      <LinearGradient
        colors={['#FF6B92', '#B66DFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        {isListening ? (
          <VoiceWaveform isActive={true} />
        ) : (
          <Ionicons name="mic" size={size * 0.4} color={colors.text.inverse} />
        )}
      </LinearGradient>
      {isListening && (
        <View
          style={[
            styles.pulseRing,
            { width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65 },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: 'rgba(139, 111, 71, 0.2)',
    zIndex: -1,
  },
});
