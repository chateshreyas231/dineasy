import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { RestaurantOnboardingScreen } from '../screens/restaurant/RestaurantOnboardingScreen';
import { DinerTabs } from './DinerTabs';
import { RestaurantTabs } from './RestaurantTabs';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const RoleSwitcher: React.FC = () => {
  const { role, user, setUser } = useAppStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.checkAuth();
        if (!isAuthenticated) {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !role ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : role === 'diner' ? (
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
    </NavigationContainer>
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
