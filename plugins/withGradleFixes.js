const { withGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  // Several Tuya SDK modules share the same Android namespace, which AGP 9
  // rejects by default. See PLAN.md §5.2.
  'android.uniquePackageNames': 'false',
  // R8 fails on the Tuya SDK without its ProGuard keep rules (pending in PULIDO.md).
  'android.enableMinifyInReleaseBuilds': 'false',
  // The Tuya SDK only ships ARM native libraries.
  reactNativeArchitectures: 'armeabi-v7a,arm64-v8a',
};

module.exports = function withGradleFixes(config) {
  return withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(PROPERTIES)) {
      const existing = config.modResults.find(
        (item) => item.type === 'property' && item.key === key
      );
      if (existing) {
        existing.value = value;
      } else {
        config.modResults.push({ type: 'property', key, value });
      }
    }
    return config;
  });
};
