const { withGradleProperties } = require('expo/config-plugins');

// Several Tuya SDK modules share the same Android namespace, which AGP 9
// rejects by default. See PLAN.md §5.2.
const PROPERTIES = {
  'android.uniquePackageNames': 'false',
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
