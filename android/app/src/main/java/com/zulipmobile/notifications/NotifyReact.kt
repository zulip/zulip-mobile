@file:JvmName("NotifyReact")

package com.zulipmobile.notifications

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.zulipmobile.MainActivity

/**
 * Methods for telling React about a notification.
 *
 * This logic was largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */

internal fun notifyReact(application: ReactApplication, data: Bundle) {
    NotificationsModule.initialNotification = data

    if (!emitIfResumed(application, "notificationOpened", Arguments.fromBundle(data))) {
        // The app will check initialNotification on launch.
        Log.d(TAG, "notifyReact: launching main activity")
        launchMainActivity(application as Context)
    }
}

/**
 * Like getReactInstanceManager, but just return what exists; avoid trying to create.
 *
 * When there isn't already an instance manager, if we call
 * getReactInstanceManager it'll try to create one... which asserts we're
 * on the UI thread, which isn't true if e.g. we got here from a Service.
 */
private fun ReactNativeHost.tryGetReactInstanceManager(): ReactInstanceManager? =
    if (this.hasInstance()) this.reactInstanceManager else null

private fun emitIfResumed(application: ReactApplication, eventName: String, data: Any?): Boolean {
    val host = application.reactNativeHost
    val reactContext = host.tryGetReactInstanceManager()?.currentReactContext
    if (reactContext == null
        || !reactContext.hasActiveCatalystInstance()
        || reactContext.lifecycleState != LifecycleState.RESUMED) {
        return false
    }
    emit(reactContext, eventName, data)
    return true
}

internal fun emit(reactContext: ReactContext, eventName: String, data: Any?) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, data)
}

private fun launchMainActivity(context: Context) {
    val intent = Intent(context, MainActivity::class.java)
    // See these sections in the Android docs:
    //   https://developer.android.com/guide/components/activities/tasks-and-back-stack#TaskLaunchModes
    //   https://developer.android.com/reference/android/content/Intent#FLAG_ACTIVITY_CLEAR_TOP
    //
    // * The flag FLAG_ACTIVITY_NEW_TASK is redundant in that it produces the
    //   same effect as setting `android:launchMode="singleTask"` on the
    //   activity, which we've done; but Context#startActivity requires it for
    //   clarity's sake, a requirement overridden in Activity#startActivity,
    //   because the behavior without it only makes sense when starting from
    //   an Activity.  Our `context` is a service, so it's required.
    //
    // * The flag FLAG_ACTIVITY_CLEAR_TOP is mentioned as being what the
    //   notification manager does; so use that.  It has no effect as long
    //   as we only have one activity; but if we add more, it will destroy
    //   all the activities on top of the target one.
    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    context.startActivity(intent)
}
