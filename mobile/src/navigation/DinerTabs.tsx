import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { SplashScreen } from '../screens/diner/SplashScreen';
import { PermissionsScreen } from '../screens/diner/PermissionsScreen';
import { PreferencesScreen } from '../screens/diner/PreferencesScreen';
import { DinerHomeScreen } from '../screens/diner/DinerHomeScreen';
import { IntentBuilderScreen } from '../screens/diner/IntentBuilderScreen';
import { ResultsScreen } from '../screens/diner/ResultsScreen';
import { RestaurantDetailScreen } from '../screens/diner/RestaurantDetailScreen';
import { RequestTableScreen } from '../screens/diner/RequestTableScreen';
import { RequestStatusScreen } from '../screens/diner/RequestStatusScreen';
import { WatchlistScreen } from '../screens/diner/WatchlistScreen';
import { TonightPlanScreen } from '../screens/diner/TonightPlanScreen';
import { MessagesScreen } from '../screens/diner/MessagesScreen';
import { ProfileScreen } from '../screens/diner/ProfileScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DinerHome"
        component={DinerHomeScreen}
        options={{ title: 'Find Your Table' }}
      />
      <Stack.Screen
        name="IntentBuilder"
        component={IntentBuilderScreen}
        options={{ title: 'Build Your Intent' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Restaurants' }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurant Details' }}
      />
      <Stack.Screen
        name="RequestTable"
        component={RequestTableScreen}
        options={{ title: 'Request Table' }}
      />
      <Stack.Screen
        name="RequestStatus"
        component={RequestStatusScreen}
        options={{ title: 'Request Status' }}
      />
    </Stack.Navigator>
  );
}

export function DinerTabs() {
  const preferences = useAppStore((state) => state.preferences);
  
  // Show onboarding if preferences not set
  if (!preferences) {
    return <OnboardingStack />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Plan') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.muted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen 
        name="AI" 
        component={AIAssistantScreen}
        options={{ title: 'AI Assistant' }}
      />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Plan" component={TonightPlanScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

