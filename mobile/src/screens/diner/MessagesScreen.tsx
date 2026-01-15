import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing } from '../../theme';

export const MessagesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="chatbubbles-outline"
          title="No Messages"
          message="Your conversations with restaurants will appear here"
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fallback color
  },
  safeArea: {
    flex: 1,
  },
});
