module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated plugin removed - using standard Animated API for Expo Go compatibility
    // plugins: ['react-native-reanimated/plugin'],
  };
};

