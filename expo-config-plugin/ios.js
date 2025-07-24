// Expo Config Plugin for iOS
// Adds required permissions and capabilities for Twilio Voice

const {
  withEntitlementsPlist,
  withInfoPlist,
} = require('@expo/config-plugins');

module.exports = function withTwilioVoiceIOSConfig(config) {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.voip'] = true;
    config.modResults['com.apple.developer.pushkit.unrestricted-voip'] = true;
    config.modResults['com.apple.developer.background-modes'] = [
      ...(config.modResults['com.apple.developer.background-modes'] || []),
      'voip',
      'audio',
      'fetch',
      'remote-notification',
    ];
    return config;
  });
  config = withInfoPlist(config, (config) => {
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      'This app requires access to the microphone for voice calls.';
    config.modResults.NSVoipUsageDescription =
      config.modResults.NSVoipUsageDescription ||
      'This app uses VoIP for incoming and outgoing calls.';
    config.modResults.NSUserNotificationUsageDescription =
      config.modResults.NSUserNotificationUsageDescription ||
      'This app uses notifications for incoming calls.';
    return config;
  });
  return config;
};
