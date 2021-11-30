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

/**
 * Like getReactInstanceManager, but just return what exists; avoid trying to create.
 *
 * When there isn't already an instance manager, if we call
 * getReactInstanceManager it'll try to create one... which asserts we're
 * on the UI thread, which isn't true if e.g. we got here from a Service.
 */
fun ReactNativeHost.tryGetReactInstanceManager(): ReactInstanceManager? =
    if (this.hasInstance()) this.reactInstanceManager else null

/**
 * A distillation of ReactContext.getLifecycleState() and related information.
 *
 * See ReactContext.getAppStatus().
 */
enum class ReactAppStatus {
    /**
     * The main activity has either never yet been in the foreground,
     * or never will again.  There might not be an active JS instance.
     */
    NOT_RUNNING,
    /**
     * The main activity has been in the foreground, is out of foreground
     * now, but might come back.  There must be an active JS instance.
     */
    BACKGROUND,
    /**
     * The main activity is in the foreground.
     * There must be an active JS instance.
     */
    FOREGROUND
}

val ReactContext.appStatus: ReactAppStatus
    get() {
        if (!hasActiveCatalystInstance())
            return ReactAppStatus.NOT_RUNNING

        // The RN lifecycleState:
        //  * starts as BEFORE_CREATE
        //  * responds to onResume, onPause, and onDestroy on the host Activity
        //    * Android upstream docs on those:
        //        https://developer.android.com/guide/components/activities/activity-lifecycle
        //    * RN wires those through ReactActivity -> ReactActivityDelegate ->
        //      ReactInstanceManager (as onHost{Resume,Pause,Destroy}) -> ReactContext
        //  * notably goes straight BEFORE_CREATE -> RESUMED when first starting
        //    (at least as of RN v0.59)
        return when (lifecycleState!!) {
            LifecycleState.BEFORE_CREATE -> ReactAppStatus.NOT_RUNNING
            LifecycleState.BEFORE_RESUME -> ReactAppStatus.BACKGROUND
            LifecycleState.RESUMED -> ReactAppStatus.FOREGROUND
        }
    }

internal fun notifyReact(application: ReactApplication, data: Bundle) {
    // TODO deduplicate this with handleSend in SharingHelper.kt.
    // Until then, keep in sync when changing.
    val host = application.reactNativeHost
    val reactContext = host.tryGetReactInstanceManager()?.currentReactContext
    val appStatus = reactContext?.appStatus
    Log.d(TAG, "notifyReact: app status is $appStatus")
    when (appStatus) {
        null, ReactAppStatus.NOT_RUNNING ->
            // Either there's no JS environment running, or we haven't yet reached
            // foreground.  Expect the app to check initialNotification on launch.
            NotificationsModule.initialNotification = data
        ReactAppStatus.BACKGROUND, ReactAppStatus.FOREGROUND ->
            // JS is running and has already reached foreground.  It won't check
            // initialNotification again, but it will see a notificationOpened event.
            emit(reactContext, "notificationOpened", Arguments.fromBundle(data))
    }
    when (appStatus) {
        null, ReactAppStatus.NOT_RUNNING, ReactAppStatus.BACKGROUND ->
            launchMainActivity(application as Context)
        ReactAppStatus.FOREGROUND -> Unit
    }
}

fun emit(reactContext: ReactContext, eventName: String, data: Any?) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, data)
}

fun launchMainActivity(context: Context) {
    Log.d(TAG, "NotifyReact: launching main activity")
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
