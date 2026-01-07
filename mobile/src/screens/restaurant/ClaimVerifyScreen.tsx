import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';

export function ClaimVerifyScreen() {
  const navigation = useNavigation();
  const setRestaurantProfile = useAppStore((state) => state.setRestaurantProfile);
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');

  const handleSubmitInfo = () => {
    // In real app, send OTP here
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    // In real app, verify OTP here
    setRestaurantProfile({
      name: restaurantName,
      address,
      phone,
      verified: true,
      vibeTags: [],
      hours: '',
      cuisine: [],
      avgPrice: 2,
      maxHolds: 5,
      timeWindows: [],
    });
    navigation.navigate('RestaurantProfileSetup' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Claim / Verify Restaurant" />

        {step === 'info' ? (
          <>
            <Card style={styles.card}>
              <Input
                label="Restaurant Name"
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="Enter restaurant name"
              />
              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter full address"
                multiline
              />
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </Card>

            <Button
              title="Send Verification Code"
              onPress={handleSubmitInfo}
              variant="primary"
              fullWidth
            />
          </>
        ) : (
          <>
            <Card style={styles.card}>
              <Text style={styles.otpTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We sent a code to {phone}
              </Text>
              <Input
                label="Verification Code"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
              />
            </Card>

            <Button
              title="Verify & Continue"
              onPress={handleVerifyOTP}
              variant="primary"
              fullWidth
            />

            <Button
              title="Back"
              onPress={() => setStep('info')}
              variant="outline"
              fullWidth
              style={styles.backButton}
            />
          </>
        )}
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
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 12,
  },
});

