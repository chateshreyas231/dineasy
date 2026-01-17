import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { DinerHomeScreen } from '../screens/diner/DinerHomeScreen';
import { IntentBuilderScreen } from '../screens/diner/IntentBuilderScreen';
import { ResultsScreen } from '../screens/diner/ResultsScreen';
import { RestaurantDetailScreen } from '../screens/diner/RestaurantDetailScreen';
import { RequestTableScreen } from '../screens/diner/RequestTableScreen';
import { RequestStatusScreen } from '../screens/diner/RequestStatusScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { WatchlistScreen } from '../screens/diner/WatchlistScreen';
import { BookingsScreen } from '../screens/diner/BookingsScreen';
import { ProfileScreen } from '../screens/diner/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AIStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="DinerHome"
  >
    <HomeStack.Screen name="DinerHome" component={DinerHomeScreen} />
    <HomeStack.Screen name="IntentBuilder" component={IntentBuilderScreen} />
    <HomeStack.Screen name="Results" component={ResultsScreen} />
    <HomeStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <HomeStack.Screen name="RequestTable" component={RequestTableScreen} />
    <HomeStack.Screen name="RequestStatus" component={RequestStatusScreen} />
  </HomeStack.Navigator>
);

const AIStackNavigator = () => (
  <AIStack.Navigator screenOptions={{ headerShown: false }}>
    <AIStack.Screen name="AIAssistant" component={AIAssistantScreen} />
  </AIStack.Navigator>
);

export const DinerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
