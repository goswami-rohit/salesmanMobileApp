const { withAndroidManifest, withInfoPlist, withPlugins } = require('expo/config-plugins');

function withRadarAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    // no-op for now — android permissions are handled via app config android.permissions
    return config;
  });
}

function withRadarInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.RadarPublishableKey = process.env.VITE_RADAR_PUBLISHABLE_KEY || '';
    return config;
  });
}

module.exports = function withRadar(config) {
  return withPlugins(config, [withRadarAndroidManifest, withRadarInfoPlist]);
};
