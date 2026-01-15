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
const BrowseStack = createNativeStackNavigator();

const BrowseStackNavigator = () => (
  <BrowseStack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="AIAssistant"
  >
    <BrowseStack.Screen name="BrowseHome" component={DinerHomeScreen} />
    <BrowseStack.Screen name="AIAssistant" component={AIAssistantScreen} />
    <BrowseStack.Screen name="IntentBuilder" component={IntentBuilderScreen} />
    <BrowseStack.Screen name="Results" component={ResultsScreen} />
    <BrowseStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <BrowseStack.Screen name="RequestTable" component={RequestTableScreen} />
    <BrowseStack.Screen name="RequestStatus" component={RequestStatusScreen} />
  </BrowseStack.Navigator>
);

export const DinerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.elegant,
          borderTopWidth: 1,
        },
      }}
      initialRouteName="Browse"
    >
      <Tab.Screen
        name="Browse"
        component={BrowseStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'BrowseHome';
          return {
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
            tabBarStyle: routeName === 'AIAssistant' ? { display: 'none' } : {
              backgroundColor: colors.background.card,
              borderTopColor: colors.border.elegant,
              borderTopWidth: 1,
            },
          };
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
        name="Bookings"
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
