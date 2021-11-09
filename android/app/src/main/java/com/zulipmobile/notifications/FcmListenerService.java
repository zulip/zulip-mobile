package com.zulipmobile.notifications;

import android.content.Context;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import com.zulipmobile.MainApplication;

public class FcmListenerService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage message) {
        final Context applicationContext = getApplicationContext();
        if (!(applicationContext instanceof MainApplication)) {
            return;
        }
        NotificationUiManager.onReceived(this, message.getData());
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        final ReactContext reactContext =
                ((ReactApplication) getApplication())
                        .getReactNativeHost()
                        .getReactInstanceManager()
                        .getCurrentReactContext();
        NotificationsModule.emitToken(reactContext, token);
    }
}
