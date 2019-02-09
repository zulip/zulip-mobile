package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.*;
import com.google.firebase.iid.FirebaseInstanceId;

import static com.zulipmobile.notifications.NotificationHelper.TAG;

public class NotificationsModule extends ReactContextBaseJavaModule {

    static Bundle initialNotification = null;

    NotificationsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Notifications";
    }

    @Override
    public void initialize() {
        emitToken((ReactApplication) getCurrentActivity().getApplication());
    }

    static void emitToken(ReactApplication application) {
        final String token = FirebaseInstanceId.getInstance().getToken();

        final ReactContext reactContext =
                application
                        .getReactNativeHost()
                        .getReactInstanceManager()
                        .getCurrentReactContext();
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            // If so, the next time the app is launched, this service will be invoked again
            // by our NotificationsModule#initialize, by which point there certainly is
            // a React context; so we'll learn the new token then.
            Log.w(TAG, "Got token before React context initialized");
            return;
        }
        Log.i(TAG, "Got token; emitting event");
        NotifyReact.emit(reactContext, "remoteNotificationsRegistered", token);

    }

    @ReactMethod
    public void getInitialNotification(Promise promise) {
        if (null == initialNotification) {
            promise.resolve(null);
        } else {
            promise.resolve(Arguments.fromBundle(initialNotification));
        }
    }
}
