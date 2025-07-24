package com.twiliovoicereactnative;

import android.content.Context;
import expo.modules.core.interfaces.ApplicationLifecycleListener;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import java.util.Collections;
import java.util.List;

// Expo Modules API用: ライフサイクルリスナーをExpoに登録するパッケージクラス
public class ExpoPackage implements Package {
    @Override
    public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
        return Collections.singletonList(new ExpoActivityLifecycleListener());
    }

    @Override
    public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
        return Collections.singletonList(new ExpoApplicationLifecycleListener());
    }
}
