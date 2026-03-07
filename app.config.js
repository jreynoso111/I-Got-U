const baseConfig = require('./app.json');

function readEnv(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

module.exports = ({ config }) => {
  const expo = baseConfig.expo ?? {};
  const bundleIdentifier = readEnv('APP_BUNDLE_IDENTIFIER', expo.ios?.bundleIdentifier);
  const androidPackage = readEnv('APP_ANDROID_PACKAGE', expo.android?.package || bundleIdentifier);
  const scheme = readEnv('APP_SCHEME', 'ioutrack');
  const appName = readEnv('APP_NAME', 'IOUTrack');
  const appSlug = readEnv('APP_SLUG', 'ioutrack');
  const appEnv = readEnv('APP_ENV', 'development');
  const googleOAuthEnabled = String(process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH || '').toLowerCase() === 'true';

  return {
    ...config,
    ...expo,
    name: appName,
    slug: appSlug,
    scheme,
    ios: {
      ...expo.ios,
      bundleIdentifier,
    },
    android: {
      ...expo.android,
      package: androidPackage,
    },
    extra: {
      ...(expo.extra ?? {}),
      appEnv,
      googleOAuthEnabled,
      revenueCat: {
        iosApiKey: readEnv('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', ''),
        androidApiKey: readEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY', ''),
        entitlementId: readEnv('EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID', 'ioutrack pro,IOUTrack Pro,ioutrack_pro,premium'),
        offeringId: readEnv('EXPO_PUBLIC_REVENUECAT_OFFERING_ID', ''),
      },
    },
  };
};
