package com.twiliovoicereactnative

import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class ExpoPackage : Package {
    override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener?>? {
        return listOf(ExpoActivityLifecycleListener())
    }

    override fun createApplicationLifecycleListeners(context: Context?): List<ApplicationLifecycleListener?>? {
        return listOf(ExpoApplicationLifecycleListener())
    }
}
