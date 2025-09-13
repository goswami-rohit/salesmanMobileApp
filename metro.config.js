const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Remove the css-transformer config completely
module.exports = withNativeWind(config, {
  input: "./global.css",
});