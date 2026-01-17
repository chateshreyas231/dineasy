import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { RestaurantOnboardingScreen } from '../screens/restaurant/RestaurantOnboardingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { CreateProfileScreen } from '../screens/CreateProfileScreen';
import { DinerTabs } from './DinerTabs';
import { RestaurantTabs } from './RestaurantTabs';
import { useProfileStore } from '../store/useProfileStore';
import { useSessionStore } from '../store/useSessionStore';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { userId } = useSessionStore();
  const { profile, loading, fetchProfile } = useProfileStore();
  const { setRole } = useAppStore();

  useEffect(() => {
    if (userId && !profile && !loading) {
      fetchProfile(userId);
    }
  }, [userId, profile, loading, fetchProfile]);

  useEffect(() => {
    if (profile?.role) {
      setRole(profile.role);
    }
  }, [profile?.role, setRole]);

  // Show loading while fetching profile
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Show CreateProfileScreen if profile is missing
  if (userId && !profile) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      </Stack.Navigator>
    );
  }

  // Route based on profile role
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!profile ? (
        // Fallback - shouldn't happen but handle gracefully
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : profile.role === 'diner' ? (
        <>
          <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
          <Stack.Screen name="DinerApp" component={DinerTabs} />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="RestaurantOnboarding" 
            component={RestaurantOnboardingScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="RestaurantApp" component={RestaurantTabs} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
