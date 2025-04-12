const { withInfoPlist } = require('@expo/config-plugins');

const withTwilioVoice = (config) => {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Add background modes
    if (!infoPlist.UIBackgroundModes) {
      infoPlist.UIBackgroundModes = [];
    }
    if (!infoPlist.UIBackgroundModes.includes('audio')) {
      infoPlist.UIBackgroundModes.push('audio');
    }
    if (!infoPlist.UIBackgroundModes.includes('voip')) {
      infoPlist.UIBackgroundModes.push('voip');
    }

    // Add required permissions
    infoPlist.NSMicrophoneUsageDescription = 
      infoPlist.NSMicrophoneUsageDescription || 
      'This app needs access to the microphone to make voice calls';

    return config;
  });
};

module.exports = withTwilioVoice; 