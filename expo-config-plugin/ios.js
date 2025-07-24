const {
  withEntitlementsPlist,
  withInfoPlist,
} = require('@expo/config-plugins');

/**
 * Expo prebuild時にiOSネイティブプロジェクトへTwilio Voice用の権限（Entitlements）を追加するConfig Plugin
 *
 * - VoIP通話やPush通知に必要なCapabilityを自動で追加
 * - Expo Managed/Bare両方で有効
 * - XcodeのSigning & Capabilities > Entitlementsに反映される
 */
module.exports = function withTwilioVoiceIOS(config) {
  // Entitlements（VoIP通話用Capability）を追加
  config = withEntitlementsPlist(config, (config) => {
    // VoIP通話用の権限（Twilio Voice SDK必須）
    // iOSでの着信・発信・Push通知用
    config.modResults['com.apple.developer.pushkit.unrestricted-voip'] = true;
    config.modResults['com.apple.developer.voip'] = true;

    // Background Modes（Entitlements用）
    // XcodeのSigning & Capabilities > Background Modesで有効化される内容
    // バックグラウンドでの着信・通話機能用
    config.modResults['com.apple.developer.background-modes'] = [
      ...(config.modResults['com.apple.developer.background-modes'] || []),
      'voip',
      'audio',
      'fetch',
      'remote-notification',
    ];
    return config;
  });

  // Info.plistにBackground Modesや説明文を追加
  config = withInfoPlist(config, (config) => {
    // Background Modes（VoIP, Audio, Push通知）を追加
    // バックグラウンドでの着信・通話機能用
    const bgModes = config.modResults.UIBackgroundModes || [];
    const requiredModes = ['voip', 'audio', 'fetch', 'remote-notification'];
    config.modResults.UIBackgroundModes = Array.from(
      new Set([...bgModes, ...requiredModes])
    );

    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      '音声通話のためにマイクを使用します';

    config.modResults.NSVoipUsageDescription =
      config.modResults.NSVoipUsageDescription ||
      '音声通話のためにVoIP機能を使用します';

    config.modResults.NSLocalNotificationUsageDescription =
      config.modResults.NSLocalNotificationUsageDescription ||
      '通話着信通知のために通知を使用します';

    return config;
  });

  return config;
};
