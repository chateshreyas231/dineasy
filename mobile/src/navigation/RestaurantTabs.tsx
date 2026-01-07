import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { RestaurantWelcomeScreen } from '../screens/restaurant/RestaurantWelcomeScreen';
import { ClaimVerifyScreen } from '../screens/restaurant/ClaimVerifyScreen';
import { RestaurantProfileSetupScreen } from '../screens/restaurant/RestaurantProfileSetupScreen';
import { RestaurantHomeStatusScreen } from '../screens/restaurant/RestaurantHomeStatusScreen';
import { RequestsInboxScreen } from '../screens/restaurant/RequestsInboxScreen';
import { RequestDetailScreen } from '../screens/restaurant/RequestDetailScreen';
import { HoldsScreen } from '../screens/restaurant/HoldsScreen';
import { InsightsScreen } from '../screens/restaurant/InsightsScreen';
import { RestaurantSettingsScreen } from '../screens/restaurant/RestaurantSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RestaurantOnboardingStack() {
  const restaurantProfile = useAppStore((state) => state.restaurantProfile);
  
  if (!restaurantProfile) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RestaurantWelcome" component={RestaurantWelcomeScreen} />
        <Stack.Screen name="ClaimVerify" component={ClaimVerifyScreen} />
        <Stack.Screen name="RestaurantProfileSetup" component={RestaurantProfileSetupScreen} />
      </Stack.Navigator>
    );
  }
  
  return null;
}

function RequestsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RequestsInbox"
        component={RequestsInboxScreen}
        options={{ title: 'Incoming Requests' }}
      />
      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{ title: 'Request Details' }}
      />
    </Stack.Navigator>
  );
}

export function RestaurantTabs() {
  const restaurantProfile = useAppStore((state) => state.restaurantProfile);
  
  // Show onboarding if not verified
  if (!restaurantProfile?.verified) {
    return <RestaurantOnboardingStack />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Status') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'Holds') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.muted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Status" component={RestaurantHomeStatusScreen} />
      <Tab.Screen name="Requests" component={RequestsStack} />
      <Tab.Screen name="Holds" component={HoldsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={RestaurantSettingsScreen} />
    </Tab.Navigator>
  );
}

