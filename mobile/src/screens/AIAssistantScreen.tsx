/**
 * AI Assistant Screen - Siri-style voice-only interface
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { AIOrb } from '../components/AIOrb';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { aiAgentService } from '../services/aiAgentService';

const quickReplyRadius = radius.full;
const confirmButtonRadius = radius.xl;
const navButtonRadius = radius.full;

export const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, aiMessages, isThinking, addAIMessage, setThinking } =
    useAppStore();

  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const [monitoringOffer, setMonitoringOffer] = useState<any>(null);
  const [statusLine, setStatusLine] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (aiMessages.length === 0) {
      addAIMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hey${user ? ` ${user.name}` : ''}! How can I help you today?`,
        timestamp: new Date(),
      });
    }
  }, []);


  const lastUserText = useMemo(() => {
    return [...aiMessages].reverse().find((m) => m.role === 'user')?.content ?? '';
  }, [aiMessages]);

  const lastAssistantText = useMemo(() => {
    return [...aiMessages].reverse().find((m) => m.role === 'assistant')?.content ?? '';
  }, [aiMessages]);

  const runAgentTurn = async (text: string) => {
    const t = text.trim();
    if (!t || isProcessing) return;

    setIsProcessing(true);
    setThinking(true);

    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: t,
      timestamp: new Date(),
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const reply = await aiAgentService.handleUserMessage(t);

      setQuickReplies(reply.quickReplies || []);
      setPendingPlan(reply.pendingPlan || null);
      setMonitoringOffer(reply.monitoringOffer || null);
      setStatusLine(reply.statusLine || '');

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply.assistantText,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Agent error:', error);
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong. Try again.',
        timestamp: new Date(),
      });
    } finally {
      setThinking(false);
      setIsProcessing(false);
    }
  };


  const handleConfirmBooking = async () => {
    if (!pendingPlan || !user || isProcessing) return;

    setIsProcessing(true);
    setThinking(true);
    setStatusLine('booking…');

    try {
      const result = await aiAgentService.confirmBooking({
        name: user.name,
        email: user.email,
        phone: '',
      });

      setThinking(false);
      setIsProcessing(false);
      setStatusLine('');

      if (result.success) {
        addAIMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: `Booked ✅ ${result.restaurant?.name}. ${result.redirectUrl ? 'Open the link to finish if needed.' : 'Reservation confirmed!'}`,
          timestamp: new Date(),
        });
        setPendingPlan(null);
        setQuickReplies([]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        addAIMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: `Booking failed. Want to try another option?`,
          timestamp: new Date(),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      setThinking(false);
      setIsProcessing(false);
      setStatusLine('');
      addAIMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Booking error. Please try again.`,
        timestamp: new Date(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNavigateToTabs = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to DinerApp (tab navigator) and then to BrowseHome
    (navigation as any).navigate('DinerApp', { screen: 'Browse', params: { screen: 'BrowseHome' } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F6F7FB']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Navigation Button - Bottom Right Dot */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNavigateToTabs}
          activeOpacity={0.7}
        >
          <View style={styles.navDot} />
        </TouchableOpacity>

        {/* BIG TEXT AREA - Top 60% */}
        <View style={styles.bigTextArea}>
          {!!lastUserText && (
            <Text style={styles.userBigText}>{lastUserText}</Text>
          )}

          {!!statusLine && (
            <Text style={styles.statusLine}>{statusLine}</Text>
          )}

          <Text style={styles.assistantBigText}>
            {lastAssistantText || "Hey! How can I help you today?"}
          </Text>
        </View>

        {/* ORB + CONTROLS - Bottom 40% */}
        <View style={styles.bottomArea}>
          <AIOrb 
            size={120} 
            isListening={false} 
            isThinking={isThinking || isProcessing} 
          />

          {/* QUICK REPLIES */}
          {quickReplies.length > 0 && (
            <View style={styles.quickRepliesWrap}>
              {quickReplies.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => runAgentTurn(r)}
                  style={styles.quickReplyChip}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                >
                  <Text style={styles.quickReplyText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CONFIRM BOOKING CTA */}
          {pendingPlan && (
            <TouchableOpacity
              onPress={handleConfirmBooking}
              activeOpacity={0.85}
              disabled={isProcessing}
              style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
            >
              <Text style={styles.confirmButtonText}>Confirm booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  safeArea: {
    flex: 1,
  },
  navButton: {
    position: 'absolute',
    bottom: 20,
    right: spacing.lg,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  navDot: {
    width: 18,
    height: 18,
    borderRadius: navButtonRadius,
    backgroundColor: colors.text.muted,
  },
  bigTextArea: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  userBigText: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statusLine: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  assistantBigText: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    color: colors.text.primary,
  },
  bottomArea: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  quickRepliesWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxHeight: 120,
  },
  quickReplyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: quickReplyRadius,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quickReplyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: confirmButtonRadius,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '800',
  },
});
