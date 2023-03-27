package com.zulipmobile.notifications;

import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.firebase.iid.FirebaseInstanceId;

import static com.zulipmobile.notifications.NotificationUiManager.TAG;

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

    /**
     * Tell the JavaScript caller about the availability of Google Play Services.
     */
    // Ideally we wouldn't depend on Google Play Services for notifications;
    // that's #3838.
    @ReactMethod
    public void googlePlayServicesAvailability(Promise promise) {
        final WritableMap result = Arguments.createMap();

        final GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();

        // https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability#isGooglePlayServicesAvailable(android.content.Context)
        final ConnectionResult connectionResult = new ConnectionResult(
                googleApiAvailability.isGooglePlayServicesAvailable(getReactApplicationContext()));

        result.putInt("errorCode", connectionResult.getErrorCode());
        result.putString("errorMessage", connectionResult.getErrorMessage());
        result.putBoolean("hasResolution", connectionResult.hasResolution());
        result.putBoolean("isSuccess", connectionResult.isSuccess());

        // Keep return value in sync with the Flow type on the JS side.
        promise.resolve(result);
    }

    /**
     * Tell the JavaScript caller whether notifications are not blocked.
     */
    // Ideally we could subscribe to changes in this value, but there
    // doesn't seem to be an API for that. The caller can poll, e.g., by
    // re-checking when the user has returned to the app, which they might
    // do after changing the notification settings.
    @ReactMethod
    public void areNotificationsEnabled(Promise promise) {
        final NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat
                .from(getReactApplicationContext());

        // https://developer.android.com/reference/androidx/core/app/NotificationManagerCompat#areNotificationsEnabled()
        promise.resolve(notificationManagerCompat.areNotificationsEnabled());
    }
}
