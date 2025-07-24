// Expo Config Plugin for Android
// Adds Google Services plugin and FCM config for Twilio Voice

const {
  withAppBuildGradle,
  withProjectBuildGradle,
  withAndroidManifest,
} = require('@expo/config-plugins');

module.exports = function withTwilioVoiceAndroidConfig(config) {
  config = withProjectBuildGradle(config, (config) => {
    if (
      !config.modResults.contents.includes('com.google.gms:google-services')
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies {/,
        'dependencies {\n        classpath "com.google.gms:google-services:4.3.15"'
      );
    }
    return config;
  });
  config = withAppBuildGradle(config, (config) => {
    if (
      !config.modResults.contents.includes(
        'apply plugin: "com.google.gms.google-services"'
      )
    ) {
      config.modResults.contents +=
        '\napply plugin: "com.google.gms.google-services"\n';
    }
    if (
      !config.modResults.contents.includes('apply plugin: "kotlin-android"')
    ) {
      config.modResults.contents += '\napply plugin: "kotlin-android"\n';
    }
    return config;
  });
  config = withAndroidManifest(config, (config) => {
    // ここで必要に応じてFCMリスナーの有効/無効化やパーミッション追加も可能
    return config;
  });
  return config;
};
