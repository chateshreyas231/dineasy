module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporarily disabled - reanimated requires worklets which needs native build
      // Uncomment after building development client or when using compatible Expo version
      // 'react-native-reanimated/plugin',
    ],
  };
};
