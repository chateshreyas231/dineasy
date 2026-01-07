import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'restaurant' | 'user';
  timestamp: Date;
}

export function MessagesScreen() {
  const requests = useAppStore((state) => state.requests);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Dineasy concierge. I'll help you find and book tables. What are you looking for?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I found some great options for you! Check the Results tab to see restaurants that match your preferences.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const getMessageStyle = (sender: string) => {
    if (sender === 'user') return styles.userMessage;
    if (sender === 'restaurant') return styles.restaurantMessage;
    return styles.aiMessage;
  };

  const getSenderName = (sender: string) => {
    if (sender === 'user') return 'You';
    if (sender === 'restaurant') return 'Restaurant';
    return 'Dineasy Concierge';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Your concierge thread</Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={(ref) => {
          if (ref) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageBubble, getMessageStyle(message.sender)]}
          >
            <Text style={styles.senderName}>{getSenderName(message.sender)}</Text>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          placeholderTextColor="#7F8C8D"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  aiMessage: {
    backgroundColor: '#E8F4F8',
    alignSelf: 'flex-start',
  },
  restaurantMessage: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#FF6B6B',
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

