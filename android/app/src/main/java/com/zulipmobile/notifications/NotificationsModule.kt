package com.zulipmobile.notifications

import com.google.firebase.iid.FirebaseInstanceId
import com.google.firebase.iid.InstanceIdResult
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import java.lang.Exception

internal class NotificationsModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "Notifications"
    }

    /**
     * Grab the token and return it to the JavaScript caller.
     */
    @ReactMethod
    fun getToken(promise: Promise) {
        FirebaseInstanceId.getInstance().instanceId
            .addOnSuccessListener { instanceId: InstanceIdResult -> promise.resolve(instanceId.token) }
            .addOnFailureListener { e: Exception? -> promise.reject(e) }
    }

    @ReactMethod
    fun readInitialNotification(promise: Promise) {
        if (null == initialNotification) {
            promise.resolve(null)
        } else {
            promise.resolve(Arguments.fromBundle(initialNotification))
            initialNotification = null
        }
    }

    /**
     * Tell the JavaScript caller about the availability of Google Play Services.
     */
    // Ideally we wouldn't depend on Google Play Services for notifications;
    // that's #3838.
    @ReactMethod
    fun googlePlayServicesAvailability(promise: Promise) {
        val result = Arguments.createMap()
        val googleApiAvailability = GoogleApiAvailability.getInstance()

        // https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability#isGooglePlayServicesAvailable(android.content.Context)
        val connectionResult = ConnectionResult(
            googleApiAvailability.isGooglePlayServicesAvailable(reactApplicationContext))
        result.putInt("errorCode", connectionResult.errorCode)
        result.putString("errorMessage", connectionResult.errorMessage)
        result.putBoolean("hasResolution", connectionResult.hasResolution())
        result.putBoolean("isSuccess", connectionResult.isSuccess)

        // Keep return value in sync with the Flow type on the JS side.
        promise.resolve(result)
    }

    /**
     * Tell the JavaScript caller whether notifications are not blocked.
     */
    // Ideally we could subscribe to changes in this value, but there
    // doesn't seem to be an API for that. The caller can poll, e.g., by
    // re-checking when the user has returned to the app, which they might
    // do after changing the notification settings.
    @ReactMethod
    fun areNotificationsEnabled(promise: Promise) {
        val notificationManagerCompat = NotificationManagerCompat
            .from(reactApplicationContext)

        // https://developer.android.com/reference/androidx/core/app/NotificationManagerCompat#areNotificationsEnabled()
        promise.resolve(notificationManagerCompat.areNotificationsEnabled())
    }

    companion object {
        var initialNotification: Bundle? = null
        fun emitToken(reactContext: ReactContext?, token: String) {
            if (reactContext == null) {
                // Perhaps this is possible if InstanceIDListenerService gets invoked?
                return
            }
            Log.i(TAG, "Got token; emitting event")
            emit(reactContext, "remoteNotificationsRegistered", token)
        }
    }
}
