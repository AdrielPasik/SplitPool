// metro.config.js
// Ajuste para SDK 54: usar 'expo/metro-config' en lugar de '@expo/metro-config'
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    buffer: require.resolve('buffer'),
    process: require.resolve('process'),
    util: require.resolve('util'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
  };
  return config;
})();