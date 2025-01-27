package com.example.twiliovoicereactnative;

import android.app.Application;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.twiliovoicereactnative.TwilioVoiceReactNativePackage;
import com.twiliovoicereactnative.VoiceApplicationProxy;

public class MainApplication extends Application implements ReactApplication {
  private final VoiceApplicationProxy voiceApplicationProxy = new VoiceApplicationProxy(this);

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new PackageList(this).getPackages();
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    voiceApplicationProxy.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // Remove the following line if you don't want Flipper enabled
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  @Override
  public void onTerminate() {
    // Note: this method is not called when running on device, devies just kill the process.
    voiceApplicationProxy.onTerminate();
    super.onTerminate();
  }
  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.twiliovoicereactnativeExample.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException |
               InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
