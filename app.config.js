const appJson = require('./app.json');

module.exports = () => {
  const expo = appJson.expo;
  const iosMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY;
  const androidMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...expo,
    ios: {
      ...expo.ios,
      bundleIdentifier: 'com.avfka.plod',
      buildNumber: '1',
      ...(iosMapsKey ? { config: { googleMapsApiKey: iosMapsKey } } : {}),
    },
    android: {
      ...expo.android,
      package: 'com.avfka.plod',
      versionCode: 1,
      ...(androidMapsKey
        ? { config: { googleMaps: { apiKey: androidMapsKey } } }
        : {}),
    },
  };
};
