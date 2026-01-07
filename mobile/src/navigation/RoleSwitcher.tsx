import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { DinerTabs } from './DinerTabs';
import { RestaurantTabs } from './RestaurantTabs';

const Stack = createNativeStackNavigator();

export function RoleSwitcher() {
  const role = useAppStore((state) => state.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === null ? (
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : role === 'diner' ? (
        <Stack.Screen name="DinerApp" component={DinerTabs} />
      ) : (
        <Stack.Screen name="RestaurantApp" component={RestaurantTabs} />
      )}
    </Stack.Navigator>
  );
}

