const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// point input to your css file
module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
