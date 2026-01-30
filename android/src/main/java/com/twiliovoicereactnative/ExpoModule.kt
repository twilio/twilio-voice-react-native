package com.twiliovoicereactnative

import android.util.Log

import com.facebook.react.bridge.ReactApplicationContext
import com.twilio.voice.AudioCodec
import com.twilio.voice.OpusCodec
import com.twilio.voice.PcmuCodec
import com.twilio.voice.PreflightOptions
import com.twilio.voice.IceOptions
import com.twilio.voice.IceServer
import com.twilio.voice.IceTransportPolicy

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import java.util.ArrayList
import java.util.HashSet


class ExpoModule : Module() {
  private class PromiseAdapter(private val promise: Promise) : ModuleProxy.UniversalPromise {
    override fun resolve(value: Any?) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseResolution(value)
      )
    }

    override fun rejectWithCode(code: Int, message: String) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithCode(code, message)
      )
    }

    override fun rejectWithName(name: String, message: String) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithName(name, message)
      )
    }
  }

  private val NAME: String = "TwilioVoiceExpoModule"

  private lateinit var moduleProxy: ModuleProxy

  override fun definition() = ModuleDefinition {
    Name(NAME)

    OnCreate {
      Log.d(NAME, String.format("context %s", this@ExpoModule.appContext.reactContext))

      val reactApplicationContext = this@ExpoModule.appContext.reactContext as ReactApplicationContext?
      if (reactApplicationContext != null) {
        this@ExpoModule.moduleProxy = ModuleProxy(reactApplicationContext)
      }
    }

    /**
     * Call API
     */

    AsyncFunction("call_disconnect") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.disconnect(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_getState") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.getState(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_getStats") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.getStats(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_hold") {
      uuid: String,
      hold: Boolean,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.hold(uuid, hold, PromiseAdapter(promise))
    }

    AsyncFunction("call_isMuted") {
        uuid: String,
        promise: Promise ->

      this@ExpoModule.moduleProxy.call.isMuted(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_isOnHold") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.isOnHold(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("call_mute") {
      uuid: String,
      mute: Boolean,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.mute(uuid, mute, PromiseAdapter(promise))
    }

    AsyncFunction("call_postFeedback") {
      uuid: String,
      score: String,
      issue: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.postFeedback(uuid, score, issue, PromiseAdapter(promise))
    }

    AsyncFunction("call_sendDigits") {
      uuid: String,
      digits: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.sendDigits(uuid, digits, PromiseAdapter(promise))
    }

    AsyncFunction("call_sendMessage") {
      uuid: String,
      content: String,
      contentType: String,
      messageType: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.call.sendMessage(
        uuid,
        content,
        contentType,
        messageType,
        PromiseAdapter(promise)
      )
    }

    /**
     * CallInvite API
     */

    AsyncFunction("callInvite_accept") {
      uuid: String,
      options: Map<String, Any>,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.accept(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("callInvite_reject") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.reject(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("callInvite_sendMessage") {
      uuid: String,
      content: String,
      contentType: String,
      messageType: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.callInvite.sendMessage(
        uuid,
        content,
        contentType,
        messageType,
        PromiseAdapter(promise)
      )
    }

    /**
     * PreflightTest API
     */

    AsyncFunction("preflightTest_getCallSid") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getCallSid(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getEndTime") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getEndTime(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getLatestSample") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getLatestSample(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getReport") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getReport(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getStartTime") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getStartTime(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_getState") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.getState(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("preflightTest_stop") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.preflightTest.stop(uuid, PromiseAdapter(promise))
    }

    /**
     * Voice API
     */

    AsyncFunction("voice_connect_android") {
        accessToken: String,
        twimlParams: Map<String, String>,
        notificationDisplayName: String?,
        promise: Promise ->

      this@ExpoModule.moduleProxy.voice.connect(
        accessToken,
        twimlParams,
        notificationDisplayName,
        PromiseAdapter(promise)
      )
    }

    AsyncFunction("voice_getAudioDevices") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getAudioDevices(PromiseAdapter(promise))
    }


    AsyncFunction("voice_getCalls") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getCalls(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getCallInvites") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getCallInvites(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getDeviceToken") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getDeviceToken(PromiseAdapter(promise))
    }

    AsyncFunction("voice_getVersion") {
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.getVersion(PromiseAdapter(promise))
    }

    AsyncFunction("voice_handleEvent") {
      eventData: Map<String, String>,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.handleEvent(eventData, PromiseAdapter(promise))
    }

    AsyncFunction("voice_register") {
        accessToken: String,
        promise: Promise ->

      this@ExpoModule.moduleProxy.voice.register(accessToken, PromiseAdapter(promise))
    }

    AsyncFunction("voice_runPreflight") {
      accessToken: String,
      jsPreflightOptions: Map<String, Any>,
      promise: Promise ->

      val preflightOptionsBuilder = PreflightOptions.Builder(accessToken)

      val iceOptionsBuilder = IceOptions.Builder()

      val iceServers = HashSet<IceServer>()

      val jsIceServers = jsPreflightOptions[CommonConstants.CallOptionsKeyIceServers] as ArrayList<*>?

      jsIceServers?.forEach {
        jsIceServer: Any ->

        if (jsIceServer !is LinkedHashMap<*, *>) {
          return@forEach
        }

        val iceServerUrl = jsIceServer[CommonConstants.IceServerKeyServerUrl] as String?
        val iceServerPassword = jsIceServer[CommonConstants.IceServerKeyPassword] as String?
        val iceServerUsername = jsIceServer[CommonConstants.IceServerKeyUsername] as String?

        if (iceServerUrl != null && iceServerPassword != null && iceServerUsername != null) {
          iceServers.add(IceServer(iceServerUrl, iceServerUsername, iceServerPassword))
        } else if (iceServerUrl != null) {
          iceServers.add(IceServer(iceServerUrl))
        }
      }

      val jsIceTransportPolicy = jsPreflightOptions[CommonConstants.CallOptionsKeyIceTransportPolicy]

      val iceTransportPolicy = when (jsIceTransportPolicy) {
        CommonConstants.IceTransportPolicyValueAll -> IceTransportPolicy.ALL
        CommonConstants.IceTransportPolicyValueRelay -> IceTransportPolicy.RELAY
        else -> null
      }

      if (iceServers.isNotEmpty()) {
        iceOptionsBuilder.iceServers(iceServers)
      }

      if (iceTransportPolicy != null) {
        iceOptionsBuilder.iceTransportPolicy(iceTransportPolicy)
      }

      if (iceServers.isNotEmpty() || iceTransportPolicy != null) {
        preflightOptionsBuilder.iceOptions(iceOptionsBuilder.build())
      }

      val preferredAudioCodecs = ArrayList<AudioCodec>()

      val jsPreferredAudioCodecs = jsPreflightOptions[CommonConstants.CallOptionsKeyPreferredAudioCodecs] as ArrayList<*>?

      jsPreferredAudioCodecs?.forEach {
        jsPreferredAudioCodec: Any ->

        if (jsPreferredAudioCodec !is LinkedHashMap<*, *>) {
          return@forEach
        }

        val jsPreferredAudioCodecType = jsPreferredAudioCodec[CommonConstants.AudioCodecKeyType] as String?

        if (jsPreferredAudioCodecType == CommonConstants.AudioCodecTypeValuePCMU) {
          preferredAudioCodecs.add(PcmuCodec())
        }

        if (jsPreferredAudioCodecType == CommonConstants.AudioCodecTypeValueOpus) {
          val jsAudioCodecBitrate = jsPreferredAudioCodec[CommonConstants.AudioCodecOpusKeyMaxAverageBitrate] as Double?

          val audioCodec = if (jsAudioCodecBitrate == null) {
            OpusCodec()
          } else {
            OpusCodec(jsAudioCodecBitrate.toInt())
          }

          preferredAudioCodecs.add(audioCodec)
        }
      }

      if (preferredAudioCodecs.isNotEmpty()) {
        preflightOptionsBuilder.preferAudioCodecs(preferredAudioCodecs)
      }

      val preflightOptions = preflightOptionsBuilder.build()

      this@ExpoModule.moduleProxy.voice.runPreflight(preflightOptions, PromiseAdapter(promise))
    }

    AsyncFunction("voice_selectAudioDevice") {
      uuid: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.selectAudioDevice(uuid, PromiseAdapter(promise))
    }

    AsyncFunction("voice_setIncomingCallContactHandleTemplate") {
      template: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.setIncomingCallContactHandleTemplate(
        template,
        PromiseAdapter(promise)
      )
    }

    AsyncFunction("voice_setExpoVersion") {
      expoVersion: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.setExpoVersion(
        expoVersion,
        PromiseAdapter(promise)
      )
    }

    AsyncFunction("voice_unregister") {
      token: String,
      promise: Promise ->

      this@ExpoModule.moduleProxy.voice.unregister(token, PromiseAdapter(promise))
    }
  }
}
