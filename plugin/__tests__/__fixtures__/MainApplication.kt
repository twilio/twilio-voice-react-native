package com.example.app

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import expo.modules.ApplicationLifecycleDispatcher

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }
}
