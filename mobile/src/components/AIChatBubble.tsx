import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radius, spacing } from '../theme';

interface AIChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

export const AIChatBubble: React.FC<AIChatBubbleProps> = ({
  message,
  role,
  timestamp,
}) => {
  const isUser = role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {isUser ? (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color={colors.text.primary} />
          </View>
        ) : (
          <LinearGradient
            colors={['#FF6B92', '#B66DFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={16} color={colors.text.inverse} />
          </LinearGradient>
        )}
      </View>

      {/* Bubble */}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message}
        </Text>
        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
        {!isUser && (
          <View style={styles.actionBar}>
            <TouchableOpacity>
              <Ionicons name="copy-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="thumbs-up-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="thumbs-down-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="volume-high-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="refresh-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  userBubble: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  assistantBubble: {
    backgroundColor: colors.background.chatAI,
  },
  text: {
    ...typography.body,
  },
  userText: {
    color: colors.text.primary,
  },
  assistantText: {
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.text.muted,
  },
  assistantTimestamp: {
    color: colors.text.muted,
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
  },
});
