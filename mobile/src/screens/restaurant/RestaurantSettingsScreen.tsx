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
import { ToggleRow } from '../../components/ToggleRow';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/authService';
import * as Haptics from 'expo-haptics';

export const RestaurantSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, setRole } = useAppStore();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authService.logout();
    setUser(null);
    setRole(null);
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
          <Text style={styles.title}>Settings</Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <ToggleRow
              label="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Button
              title="Edit Profile"
              onPress={() => {}}
              variant="secondary"
              size="md"
              style={styles.button}
            />
          </Card>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="lg"
            style={styles.logoutButton}
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
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
});
