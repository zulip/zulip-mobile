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
        // This can be considered dead code.
        //
        // 3730be4c8 introduced a bug where the JavaScript didn't act
        // on the event containing the token, either as it was emitted
        // here or by the FCM framework (via `onRefreshToken`) on
        // startup. We should give control to the JavaScript by
        // exposing a method to return the token, for the JavaScript
        // to call at its convenience.
        emitToken(getReactApplicationContext());
    }

    static void emitToken(@Nullable ReactContext reactContext) {
        final String token = FirebaseInstanceId.getInstance().getToken();
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            // If so, the next time the app is launched, this method will be invoked again
            // by our NotificationsModule#initialize, by which point there certainly is
            // a React context; so we'll learn the new token then.
            // (But see the comment on `initialize` for a problem we
            // should fix soon, where the `emitToken` there is ignored
            // by the JavaScript.)
            Log.w(TAG, "Got token before React context initialized");
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
        promise.resolve(FirebaseInstanceId.getInstance().getToken());
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
