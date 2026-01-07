import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface AIChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

export function AIChatBubble({ message, isUser = false, timestamp }: AIChatBubbleProps) {
  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message}</Text>
        </LinearGradient>
        {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.aiContainer}>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{message}</Text>
      </View>
      {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  aiContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  aiBubble: {
    backgroundColor: colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxWidth: '80%',
  },
  aiText: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 16,
  },
});

