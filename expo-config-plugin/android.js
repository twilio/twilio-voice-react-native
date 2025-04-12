const { withGradleProperties, withAndroidManifest } = require('@expo/config-plugins');

const withTwilioVoice = (config) => {
  // Add Google Services plugin
  config = withGradleProperties(config, (config) => {
    config.modResults = {
      ...config.modResults,
      'android.useAndroidX': true,
      'android.enableJetifier': true,
    };
    return config;
  });

  // Add required permissions to AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add FCM service configuration
    const configResources = mainApplication['meta-data'] || [];
    configResources.push({
      $: {
        'android:name': 'twiliovoicereactnative_firebasemessagingservice_enabled',
        'android:value': 'true'
      }
    });
    mainApplication['meta-data'] = configResources;

    return config;
  });

  return config;
};

module.exports = withTwilioVoice; 