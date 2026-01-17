import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useSessionStore } from './src/store/useSessionStore';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppSplashScreen } from './src/components/AppSplashScreen';

export default function App() {
  const { session, loading, init } = useSessionStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppSplashScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        {session ? <RootNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

