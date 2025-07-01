package com.example.twiliovoicereactnative

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.PersistableBundle
import android.widget.Toast
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.twiliovoicereactnative.VoiceActivityProxy

class MainActivity : ReactActivity() {
  private val voiceActivityProxy: VoiceActivityProxy = VoiceActivityProxy(
    this
  ) { permission ->
    if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
      Toast.makeText(
        this@MainActivity,
        "Microphone permissions needed. Please allow in your application settings.",
        Toast.LENGTH_LONG
      ).show()
    } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
      Manifest.permission.BLUETOOTH_CONNECT.equals(permission)
    ) {
      Toast.makeText(
        this@MainActivity,
        "Bluetooth permissions needed. Please allow in your application settings.",
        Toast.LENGTH_LONG
      ).show()
    } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
      Manifest.permission.POST_NOTIFICATIONS.equals(permission)
    ) {
      Toast.makeText(
        this@MainActivity,
        "Notification permissions needed. Please allow in your application settings.",
        Toast.LENGTH_LONG
      ).show()
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "TwilioVoiceExampleNewArch"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    voiceActivityProxy.onCreate(savedInstanceState)
  }

  override fun onDestroy() {
    super.onDestroy()
    voiceActivityProxy.onDestroy()
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    voiceActivityProxy.onNewIntent(intent)
  }
}
