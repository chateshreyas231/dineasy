import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { ToggleRow } from '../../components/ToggleRow';
import { Button } from '../../components/Button';
import { SectionHeader } from '../../components/SectionHeader';

export function RestaurantSettingsScreen() {
  const restaurantProfile = useAppStore((state) => state.restaurantProfile);
  const setRole = useAppStore((state) => state.setRole);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(false);
  const [emailEnabled, setEmailEnabled] = React.useState(true);

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Settings" />

        {restaurantProfile && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Restaurant Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{restaurantProfile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{restaurantProfile.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{restaurantProfile.phone}</Text>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <ToggleRow
            label="Push Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            description="Get notified about new requests"
          />
          <ToggleRow
            label="SMS Notifications"
            value={smsEnabled}
            onValueChange={setSmsEnabled}
            description="Receive text messages for urgent requests"
          />
          <ToggleRow
            label="Email Notifications"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            description="Daily summary emails"
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Staff Accounts</Text>
          <Text style={styles.comingSoon}>Coming soon</Text>
          <Text style={styles.comingSoonText}>
            Add staff members to help manage requests
          </Text>
        </Card>

        <Button title="Logout" onPress={handleLogout} variant="outline" fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  comingSoon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

