package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.twilio.voice.*
import java.util.*

class ExpoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TwilioVoiceExpo")

    Function("voice_connect") { accessToken: String ->
      val context = appContext.reactContext ?: return@Function null

      val connectOptions = ConnectOptions.Builder(accessToken)
        .enableIceOptions(true)
        .build()

      val uuid = UUID.randomUUID()
      val callListenerProxy = CallListenerProxy(uuid, context)

      val call = Voice.connect(connectOptions, callListenerProxy)
      
      val callRecord = CallRecord(
        uuid = uuid,
        call = call,
        to = "Outgoing Call",
        customParameters = HashMap(),
        direction = CallRecord.Direction.OUTGOING,
        displayName = "Outgoing Call"
      )

      VoiceApplicationProxy.getCallRecordDatabase().add(callRecord)
      
      return@Function uuid.toString()
    }

    Function("voice_disconnect") { callUuid: String ->
      val uuid = UUID.fromString(callUuid)
      val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
      callRecord?.call?.disconnect()
    }
  }
} 