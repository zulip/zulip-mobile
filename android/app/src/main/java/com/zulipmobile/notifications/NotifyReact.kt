@file:JvmName("NotifyReact")

package com.zulipmobile.notifications

import android.os.Bundle
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.zulipmobile.emitEvent

/**
 * Methods for telling React about a notification.
 *
 * This logic was largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */

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

internal fun notifyReact(reactContext: ReactContext?, data: Bundle) {
    // TODO deduplicate this with handleSend in SharingHelper.kt; see
    // https://github.com/zulip/zulip-mobile/pull/5146#discussion_r764437055
    // Until then, keep in sync when changing.
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
            reactContext.emitEvent("notificationOpened", Arguments.fromBundle(data))
    }
}
