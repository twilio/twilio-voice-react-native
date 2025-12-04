package com.twiliovoicereactnative

import android.app.Application
import expo.modules.core.interfaces.ApplicationLifecycleListener

class ExpoApplicationLifecycleListener : ApplicationLifecycleListener{
    private var voiceApplicationProxy: VoiceApplicationProxy? = null

    override fun onCreate(application: Application?) {
        if (application != null) {
            voiceApplicationProxy = VoiceApplicationProxy(application)
        }

        voiceApplicationProxy?.onCreate()

        super.onCreate(application)
    }
}
