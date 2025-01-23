package com.example.twiliovoicereactnative;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactPackage;
import com.twiliovoicereactnative.VoiceApplicationProxy;

import java.util.List;

public class MainReactNativeHost extends VoiceApplicationProxy.VoiceReactNativeHost {
  public MainReactNativeHost(Application application) {
    super(application);
  }
  @Override
  public boolean getUseDeveloperSupport() {
    return BuildConfig.DEBUG;
  }
  @Override
  protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    // Packages that cannot be autolinked yet can be added manually here
    // packages.add(new MyReactNativePackage());
    return packages;
  }
  @Override
  protected String getJSMainModuleName() {
    return "index";
  }
}
