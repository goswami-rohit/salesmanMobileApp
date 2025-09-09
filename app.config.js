// app.config.js
require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    name: "SalesmanMobileApp",
    slug: "salesmanMobileApp",
    owner: "rohitgoswami",
    userInterfaceStyle: "automatic",
    extra: {
      APP_BASE_URL: process.env.APP_BASE_URL || '',
      VITE_RADAR_PUBLISHABLE_KEY: process.env.VITE_RADAR_PUBLISHABLE_KEY || '',
      DATABASE_URL: process.env.DATABASE_URL || '',
      RADAR_SECRET_KEY: process.env.RADAR_SECRET_KEY || '',
      LOCATIONIQ_KEY: process.env.LOCATIONIQ_KEY || '',
      QDRANT_URL: process.env.QDRANT_URL || '',
      QDRANT_API_KEY: process.env.QDRANT_API_KEY || '',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
      R2_BUCKET: process.env.R2_BUCKET || '',
      R2_ACCESS_KEY_ID: process.env || '',
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
      R2_ENDPOINT: process.env.R2_ENDPOINT || '',
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
      eas: { projectId: '7f95fd10-fc75-4697-9641-4196ead52d67' }
    },
    android: {
      package: "com.rohitgoswami.salesmanmobileapp", // REQUIRED: set your package name here
      permissions: ["CAMERA", "ACCESS_FINE_LOCATION"]
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
