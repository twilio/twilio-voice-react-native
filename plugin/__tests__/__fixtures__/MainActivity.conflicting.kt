package com.example.app

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    super.onCreate(null)
  }

  // Added by some other library's config plugin, e.g. a deep-link or push SDK.
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    SomeOtherSdk.handleIntent(intent)
  }

  override fun getMainComponentName(): String = "main"
}
