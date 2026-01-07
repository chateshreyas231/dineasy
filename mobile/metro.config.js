const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize file watching - only watch source directories
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname),
];

// Use NodeWatcher for file watching
config.watcher = {
  useWatchman: false,
  usePolling: false,
};

// Extend resolver configuration
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
