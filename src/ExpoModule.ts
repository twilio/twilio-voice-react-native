import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

/**
 * Twilio Voice ExpoModuleラッパー
 *
 * - Twilio Voice SDKの主要APIをExpo Modules API経由で提供
 * - Expo Managed/Bare両方で動作
 * - 通話開始/切断/ミュート/DTMF/デバイス取得/イベント購読/PushRegistry初期化などを網羅
 * - 公式要件・運用要件・審査要件に準拠
 * - 追加APIやイベントはTwilio公式SDKの拡張に合わせて随時拡張可能
 */

// ネイティブモジュール名（expo-modules-core経由）
const TwilioVoiceExpo = requireNativeModule('TwilioVoiceExpo');

// =============================
// 1. 通話・着信関連API
// =============================

/**
 * Push通知用トークン登録
 * - Twilio Voiceの着信Push通知（APNs/FCM）に必須
 * - サーバー側でTwilio Voiceと連携する際に利用
 */
export const register = (token: string) => TwilioVoiceExpo.register(token);

/**
 * 通話開始（connect）
 * - Twilio Voiceのアウトバウンド通話開始
 * - params: 通話先情報やカスタムパラメータ
 * - 戻り値: ネイティブ側でcallId等を返す設計を想定
 */
export const connect = async (token: string, params: any) => {
  return await TwilioVoiceExpo.connect(token, params);
};

/**
 * 通話切断
 * - callIdで指定した通話を切断
 */
export const disconnect = (callId: string) =>
  TwilioVoiceExpo.disconnect(callId);

/**
 * ミュート制御
 * - 通話中のマイクミュート/解除
 */
export const mute = (callId: string, mute: boolean) =>
  TwilioVoiceExpo.mute(callId, mute);

/**
 * DTMF送信
 * - 通話中にDTMF（プッシュボタン信号）を送信
 */
export const sendDigits = (callId: string, digits: string) =>
  TwilioVoiceExpo.sendDigits(callId, digits);

/**
 * 着信招待の受諾/拒否
 * - Twilio Voiceの着信招待（CallInvite）をaccept/reject
 * - 通話開始前の着信通知に対応
 */
export const acceptCallInvite = (inviteId: string) =>
  TwilioVoiceExpo.acceptCallInvite(inviteId);
export const rejectCallInvite = (inviteId: string) =>
  TwilioVoiceExpo.rejectCallInvite(inviteId);

/**
 * 通話状態取得
 * - 通話中/切断/着信待ち等の状態を取得
 * - Twilio公式APIに準拠
 */
export const getCallState = async (callId: string) => {
  if (TwilioVoiceExpo.getCallState) {
    return await TwilioVoiceExpo.getCallState(callId);
  }
  return null;
};

/**
 * スピーカーフォン制御
 * - 通話中のスピーカーフォンON/OFF
 * - ハンズフリー通話やBluetooth連携時に利用
 */
export const setSpeakerphone = (callId: string, enabled: boolean) => {
  if (TwilioVoiceExpo.setSpeakerphone) {
    TwilioVoiceExpo.setSpeakerphone(callId, enabled);
  }
};

// =============================
// 2. デバイス・PushRegistry関連API
// =============================

/**
 * オーディオデバイス一覧取得
 * - 端末のマイク/スピーカー/ヘッドセット等の情報を取得
 * - 通話デバイス切替UI等で利用
 */
export const getAudioDevices = async () => {
  return await TwilioVoiceExpo.getAudioDevices();
};

/**
 * iOS PushRegistry初期化
 * - iOSのみ
 * - VoIP Push通知の受信に必須
 * - App起動時や初回ログイン時に呼び出し
 */
export const initializePushRegistry = async () => {
  if (Platform.OS === 'ios' && TwilioVoiceExpo.initializePushRegistry) {
    await TwilioVoiceExpo.initializePushRegistry();
  }
};

// =============================
// 3. Twilio Voiceイベント購読
// =============================

/**
 * Twilio Voice SDKのイベント購読
 * - 通話状態/着信/切断/エラー等のイベントを購読
 * - handler: イベント発生時のコールバック
 * - イベント名はTwilio公式SDKの仕様に準拠
 */
export const addListener = (event: string, handler: (...args: any[]) => void) =>
  TwilioVoiceExpo.addListener(event, handler);
