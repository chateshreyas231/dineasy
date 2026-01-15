import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { RestaurantHomeStatusScreen } from '../screens/restaurant/RestaurantHomeStatusScreen';
import { RequestsInboxScreen } from '../screens/restaurant/RequestsInboxScreen';
import { RequestDetailScreen } from '../screens/restaurant/RequestDetailScreen';
import { HoldsScreen } from '../screens/restaurant/HoldsScreen';
import { InsightsScreen } from '../screens/restaurant/InsightsScreen';
import { RestaurantSettingsScreen } from '../screens/restaurant/RestaurantSettingsScreen';
import { TableMapScreen } from '../screens/restaurant/TableMapScreen';

const Tab = createBottomTabNavigator();
const RequestsStack = createNativeStackNavigator();

const RequestsStackNavigator = () => (
  <RequestsStack.Navigator screenOptions={{ headerShown: false }}>
    <RequestsStack.Screen name="RequestsInbox" component={RequestsInboxScreen} />
    <RequestsStack.Screen name="RequestDetail" component={RequestDetailScreen} />
  </RequestsStack.Navigator>
);

export const RestaurantTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.elegant,
        },
      }}
    >
      <Tab.Screen
        name="Status"
        component={RestaurantHomeStatusScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Table Map"
        component={TableMapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Holds"
        component={HoldsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={RestaurantSettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
