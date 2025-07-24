package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice
import java.util.UUID

class ExpoModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TwilioVoiceExpoModule")

        Function("voice_connect") { accessToken: String ->
            val context = appContext.reactContext ?: return@Function
            val connectOptions = ConnectOptions.Builder(accessToken).build()
            val uuid = UUID.randomUUID()
            // CallListenerProxyやCallRecordDatabaseの実装は既存コードに合わせて調整してください
            // Voice.connect(connectOptions, callListenerProxy)
            // ...
            // returnなど必要に応じて
        }
    }
}
