import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

export const AppSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../DINEASY.gif')}
        style={styles.gif}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary || '#FAF8F5',
  },
  gif: {
    width: '80%',
    height: '80%',
    maxWidth: 400,
    maxHeight: 400,
  },
});
