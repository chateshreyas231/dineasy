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
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';

export const PermissionsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.navigate('Preferences' as never);
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Enable Permissions</Text>
          <Text style={styles.subtitle}>
            We need a few permissions to provide the best experience
          </Text>

          <Card style={styles.card}>
            <View style={styles.permission}>
              <Ionicons name="location" size={32} color={colors.primary.main} />
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Location</Text>
                <Text style={styles.permissionDescription}>
                  Find restaurants near you
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.permission}>
              <Ionicons name="notifications" size={32} color={colors.primary.main} />
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Notifications</Text>
                <Text style={styles.permissionDescription}>
                  Get updates on your reservations
                </Text>
              </View>
            </View>
          </Card>

          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  permission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  button: {
    marginTop: spacing.lg,
  },
});
