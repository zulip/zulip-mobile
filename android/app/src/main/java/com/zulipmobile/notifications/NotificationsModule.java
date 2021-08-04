package com.zulipmobile.notifications;

import android.os.Bundle;
import androidx.annotation.Nullable;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.google.firebase.iid.FirebaseInstanceId;

import static com.zulipmobile.notifications.NotificationHelper.TAG;

class NotificationsModule extends ReactContextBaseJavaModule {

    static Bundle initialNotification = null;

    NotificationsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Notifications";
    }

    static void emitToken(@Nullable ReactContext reactContext, String token) {
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            return;
        }
        Log.i(TAG, "Got token; emitting event");
        NotifyReact.emit(reactContext, "remoteNotificationsRegistered", token);
    }

    /**
     * Grab the token and return it to the JavaScript caller.
     */
    @ReactMethod
    public void getToken(Promise promise) {
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnSuccessListener(instanceId -> promise.resolve(instanceId.getToken()))
                .addOnFailureListener(e -> promise.reject(e));
    }

    @ReactMethod
    public void readInitialNotification(Promise promise) {
        if (null == initialNotification) {
            promise.resolve(null);
        } else {
            promise.resolve(Arguments.fromBundle(initialNotification));
            initialNotification = null;
        }
    }
}
