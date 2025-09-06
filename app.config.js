// app.config.js
require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    name: "SalesmanMobileApp",
    slug: "salesmanMobileApp",
    owner: "rohitgoswami",
    extra: {
      VITE_RADAR_PUBLISHABLE_KEY: process.env.VITE_RADAR_PUBLISHABLE_KEY || '',
      eas: { projectId: '7f95fd10-fc75-4697-9641-4196ead52d67' }
    },
    android: {
      package: "com.rohitgoswami.salesmanmobileapp", // REQUIRED: set your package name here
    },
    ios: {
      bundleIdentifier: "com.rohitgoswami.salesmanmobileapp", // & REQUIRED set your package name here
      buildNumber: "1",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "App uses location to detect visits and geofences.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "App uses background location to detect visits and geofence transitions.",
        NSCameraUsageDescription: "App needs camera access to take check-in photos."
      }
    },
    plugins: [],
  };
};
