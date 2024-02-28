package com.twiliovoicereactnative;


import android.app.Notification;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.NonNull;
import androidx.core.app.ServiceCompat;

import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.Voice;

public class VoiceService extends Service {
  public class VoiceServiceAPI extends Binder {
    public Call connect(@NonNull ConnectOptions cxnOptions,
                        @NonNull Call.Listener listener) {
      return Voice.connect(VoiceService.this, cxnOptions, listener);
    }
    public Call accept(@NonNull CallInvite callInvite,
                       @NonNull AcceptOptions acceptOptions,
                       @NonNull Call.Listener listener) {
      return callInvite.accept(VoiceService.this, acceptOptions, listener);
    }
    public void reject(@NonNull CallInvite callInvite) {
      callInvite.reject(VoiceService.this);
    }

    public void foreground(int id, Notification notification) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        VoiceService.this.startForeground(id, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
      } else {
        VoiceService.this.startForeground(id, notification);
      }
    }

    public void background() {
      ServiceCompat.stopForeground(VoiceService.this, ServiceCompat.STOP_FOREGROUND_REMOVE);
    }
  }

  @Override
  public IBinder onBind(Intent intent) {
    return new VoiceServiceAPI();
  }
}
