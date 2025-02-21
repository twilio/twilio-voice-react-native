import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice

import expo.modules.kotlin.Promise
import expo.modules.kotlin.jni.JavaScriptObject
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import java.util.UUID

class ExpoModule : Module() {
  private val log SDKLog(this.javaClass)

  override fun definition() = ModuleDefinition {
    Name("TwilioVoiceReactNative")

    Function("voice_connect") {
      accessToken: String ->

      val context = appContext.reactContext
      if (context == null) {
        return@Function
      }

      val connectOptions = ConnectOptions.Builder(accessToken).build()
      val uuid = UUID.randomUUID()
      val callListenerProxy = CallListenerProxy(uuid, context)
      val callRecord = CallRecordDatabase.CallRecord(
        uuid,
        VoiceApplicationProxy.getVoiceServicesApi().connect(
          connectOptions,
          callListenerProxy
        ),
        "Recipient",
        HashMap(),
        CallRecordDatabase.CallRecord.Direction.OUTGOING,
        notificationDisplayName
      )
      VoiceApplicationProxy.getCallRecordDatabase().add(callRecord)
    }
  }
}
