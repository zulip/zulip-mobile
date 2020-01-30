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

    @Override
    public void initialize() {
        // Invoking `emitToken` here is a bit belt-and-suspenders: the FCM framework
        // already invokes it (via `onRefreshToken`) at app startup.  But that can be
        // before React is ready.  With some more care we could hang on to it and emit
        // the event a bit later, but instead we just redundantly emit here when we
        // know things have started up.
        emitToken(getReactApplicationContext());
    }

    static void emitToken(@Nullable ReactContext reactContext) {
        final String token = FirebaseInstanceId.getInstance().getToken();
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            // If so, the next time the app is launched, this method will be invoked again
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
