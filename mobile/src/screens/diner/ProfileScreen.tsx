import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAppStore();

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await supabase.auth.signOut();
    setUser(null);
    navigation.navigate('Welcome' as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Profile</Text>

          <Card style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name || 'Not set'}</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || 'Not set'}</Text>
          </Card>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="lg"
            style={styles.button}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
  },
  button: {
    marginTop: spacing.lg,
  },
});
