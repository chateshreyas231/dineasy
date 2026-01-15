import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RoleSwitcher } from './src/navigation/RoleSwitcher';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <RoleSwitcher />
    </GestureHandlerRootView>
  );
}
