package com.twiliovoicereactnative

import android.app.Activity
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

import android.Manifest
import android.content.Intent
import android.widget.Toast
import android.os.Build

class ExpoActivityLifecycleListener : ReactActivityLifecycleListener {
    private var voiceActivityProxy: VoiceActivityProxy? = null

    override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
        if (activity != null) {
            voiceActivityProxy = VoiceActivityProxy(
                activity
            ) { permission ->
                if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
                    Toast.makeText(
                        activity,
                        "Microphone permissions needed. Please allow in your application settings.",
                        Toast.LENGTH_LONG
                    ).show()
                } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
                    Manifest.permission.BLUETOOTH_CONNECT.equals(permission)
                ) {
                    Toast.makeText(
                        activity,
                        "Bluetooth permissions needed. Please allow in your application settings.",
                        Toast.LENGTH_LONG
                    ).show()
                } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
                    Manifest.permission.POST_NOTIFICATIONS.equals(permission)
                ) {
                    Toast.makeText(
                        activity,
                        "Notification permissions needed. Please allow in your application settings.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }

        voiceActivityProxy?.onCreate(savedInstanceState)

        return super.onCreate(activity, savedInstanceState)
    }

    override fun onNewIntent(intent: Intent?): Boolean {
        voiceActivityProxy?.onNewIntent(intent)

        return super.onNewIntent(intent)
    }

    override fun onDestroy(activity: Activity?) {
        voiceActivityProxy?.onDestroy()

        return super.onDestroy(activity)
    }
}
