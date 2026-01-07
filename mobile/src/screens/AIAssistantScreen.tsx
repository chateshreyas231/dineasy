import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { AIOrb } from '../components/AIOrb';
import { AIChatBubble } from '../components/AIChatBubble';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { VoiceWaveform } from '../components/VoiceWaveform';

export function AIAssistantScreen() {
  const { aiMessages, addAIMessage, isListening, setIsListening, isThinking, setIsThinking } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [aiMessages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addAIMessage({ text: text.trim(), isUser: true });
    setInputText('');

    // Show thinking state
    setIsThinking(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      setIsThinking(false);
      const response = generateAIResponse(text);
      addAIMessage({ text: response, isUser: false });
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Process voice input here
    } else {
      setIsListening(true);
      // Start voice recognition here
      setTimeout(() => {
        setIsListening(false);
        // Simulate voice input
        const voiceText = "Find me a restaurant for dinner tonight";
        handleSendMessage(voiceText);
      }, 3000);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('dinner') || lowerMessage.includes('eat')) {
      return "I'd be happy to help you find the perfect restaurant! What type of cuisine are you in the mood for? I can also check availability and make reservations for you.";
    }
    if (lowerMessage.includes('reservation') || lowerMessage.includes('table') || lowerMessage.includes('book')) {
      return "I can help you make a reservation! Let me check available restaurants near you. What time and party size are you looking for?";
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return "Based on your preferences, I'd recommend checking out some Italian or Japanese restaurants nearby. Would you like me to show you options with available tables?";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your AI dining assistant. I can help you find restaurants, make reservations, and plan your perfect dining experience. What would you like to do today?";
    }
    
    return "I understand you're looking for dining options. Let me help you find the perfect restaurant! What are you in the mood for?";
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Your intelligent dining companion</Text>
        </View>

        {/* AI Orb - Show when not chatting or thinking */}
        {aiMessages.length === 0 && !isThinking && (
          <View style={styles.orbContainer}>
            <AIOrb size={180} listening={isListening} thinking={isThinking} />
            <Text style={styles.orbStatus}>
              {isListening ? 'Listening...' : 'Ready to help'}
            </Text>
          </View>
        )}

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {aiMessages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome to AI Assistant</Text>
              <Text style={styles.welcomeText}>
                I can help you find restaurants, make reservations, and plan your dining experience.
                {'\n\n'}
                Try saying: "Find me a restaurant for dinner" or "Make a reservation for 2 people"
              </Text>
            </View>
          )}

          {aiMessages.map((message) => (
            <AIChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))}

          {isThinking && (
            <View style={styles.thinkingContainer}>
              <View style={styles.thinkingBubble}>
                <View style={styles.thinkingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              onSubmitEditing={() => handleSendMessage(inputText)}
            />
            {isListening ? (
              <TouchableOpacity onPress={handleVoiceInput} style={styles.voiceButton}>
                <VoiceWaveform listening={true} maxHeight={24} barCount={3} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleVoiceInput} style={styles.voiceButton}>
                <Ionicons name="mic" size={24} color={colors.primary.main} />
              </TouchableOpacity>
            )}
            {inputText.trim() && (
              <TouchableOpacity
                onPress={() => handleSendMessage(inputText)}
                style={styles.sendButton}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  orbStatus: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  welcomeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  thinkingContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  thinkingBubble: {
    backgroundColor: colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.card,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

