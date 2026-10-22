// Metro bundler config for the FITME Android app.
// Extends Expo's defaults and ignores the separate marketing website in ./fitme-website,
// so its own node_modules and files never end up in the app bundle.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [...[].concat(config.resolver.blockList ?? []), /[\\/]fitme-website[\\/].*/];

module.exports = config;
