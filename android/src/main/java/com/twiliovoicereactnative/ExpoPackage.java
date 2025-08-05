package com.twiliovoicereactnative;

import android.content.Context;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

import java.util.Collections;
import java.util.List;

public class ExpoPackage implements Package {
  @Override
  public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    return Collections.singletonList(new ExpoActivityLifecycleListeners());
  }

  @Override
  public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
    return Collections.singletonList(new ExpoApplicationLifecycleListeners());
  }
}
