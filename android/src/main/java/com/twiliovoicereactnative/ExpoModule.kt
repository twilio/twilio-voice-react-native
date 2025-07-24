package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.util.Log

// Expo経由でTwilio Voiceの主要機能をJSから呼び出せるようにするモジュール
class ExpoModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TwilioVoiceExpo")

        // Twilio Voiceのregister（デバイストークン登録）
        Function("register") { token: String ->
            // VoiceApplicationProxyはTwilio公式SDKのラッパー
            VoiceApplicationProxy.getVoiceServiceApi().register(token)
        }

        // Twilio Voiceのconnect（発信）
        Function("connect") { token: String, params: Map<String, Any>, promise: Promise ->
            try {
                // connectの戻り値はCallインスタンス。IDを返すことでJS側で管理しやすくする
                val call = VoiceApplicationProxy.getVoiceServiceApi().connect(token, params)
                promise.resolve(call.id) // call.idは一意の通話ID
            } catch (e: Exception) {
                Log.e("ExpoModule", "connect error", e)
                promise.reject("CONNECT_ERROR", e)
            }
        }

        // 利用可能なオーディオデバイス一覧取得
        Function("getAudioDevices") { promise: Promise ->
            try {
                val devices = VoiceApplicationProxy.getVoiceServiceApi().getAudioDevices()
                promise.resolve(devices)
            } catch (e: Exception) {
                Log.e("ExpoModule", "getAudioDevices error", e)
                promise.reject("AUDIO_DEVICES_ERROR", e)
            }
        }

        // 通話のミュート切り替え
        Function("mute") { callId: String, mute: Boolean ->
            CallRecordDatabase.getCall(callId)?.mute(mute)
        }

        // 通話の切断
        Function("disconnect") { callId: String ->
            CallRecordDatabase.getCall(callId)?.disconnect()
        }

        // DTMF送信
        Function("sendDigits") { callId: String, digits: String ->
            CallRecordDatabase.getCall(callId)?.sendDigits(digits)
        }

        // 必要に応じてイベント送信やCallInvite操作も追加
        // 例: 着信(CallInvite)のaccept/reject
        Function("acceptCallInvite") { callInviteId: String, promise: Promise ->
            try {
                val call = CallInviteDatabase.getCallInvite(callInviteId)?.accept()
                promise.resolve(call?.id)
            } catch (e: Exception) {
                Log.e("ExpoModule", "acceptCallInvite error", e)
                promise.reject("ACCEPT_INVITE_ERROR", e)
            }
        }
        Function("rejectCallInvite") { callInviteId: String ->
            CallInviteDatabase.getCallInvite(callInviteId)?.reject()
        }
        // Twilio Voice SDKのイベントをJS側にemitする
        Events(
            "onCallConnected",    // 通話が接続された
            "onCallDisconnected", // 通話が切断された
            "onCallRinging",      // 着信中
            "onCallInvite",       // CallInvite（着信通知）
            "onError"             // エラー発生
        )

        // Voice SDKのイベントリスナー登録
        init {
            // Call接続
            VoiceApplicationProxy.getVoiceServiceApi().setOnCallConnectedListener { callId ->
                sendEvent("onCallConnected", mapOf("callId" to callId))
            }
            // Call切断
            VoiceApplicationProxy.getVoiceServiceApi().setOnCallDisconnectedListener { callId, error ->
                sendEvent("onCallDisconnected", mapOf("callId" to callId, "error" to error?.message))
            }
            // Call着信
            VoiceApplicationProxy.getVoiceServiceApi().setOnCallRingingListener { callId ->
                sendEvent("onCallRinging", mapOf("callId" to callId))
            }
            // CallInvite（着信通知）
            VoiceApplicationProxy.getVoiceServiceApi().setOnCallInviteListener { callInviteId, from ->
                sendEvent("onCallInvite", mapOf("callInviteId" to callInviteId, "from" to from))
            }
            // エラー
            VoiceApplicationProxy.getVoiceServiceApi().setOnErrorListener { error ->
                sendEvent("onError", mapOf("error" to error.message))
            }
        }
    }
}
