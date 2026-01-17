import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { RestaurantHomeStatusScreen } from '../screens/restaurant/RestaurantHomeStatusScreen';
import { RequestsInbox } from '../screens/restaurant/RequestsInbox';
import { RequestDetails } from '../screens/restaurant/RequestDetails';
import { InsightsScreen } from '../screens/restaurant/InsightsScreen';
import { RestaurantSettingsScreen } from '../screens/restaurant/RestaurantSettingsScreen';

const Tab = createBottomTabNavigator();
const InboxStack = createNativeStackNavigator();

const InboxStackNavigator = () => (
  <InboxStack.Navigator screenOptions={{ headerShown: false }}>
    <InboxStack.Screen name="RequestsInbox" component={RequestsInbox} />
    <InboxStack.Screen name="RequestDetails" component={RequestDetails} />
  </InboxStack.Navigator>
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
          borderTopWidth: 1,
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={RestaurantHomeStatusScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
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
