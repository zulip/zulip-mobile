@file:JvmName("NotifyReact")

package com.zulipmobile.notifications

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.zulipmobile.*

/**
 * Methods for telling React about a notification.
 *
 * This logic was largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */

/**
 * Recognize if an ACTION_VIEW intent came from tapping a notification; handle it if so
 *
 * Just if the intent is recognized,
 * sends a 'notificationOpened' event to the JavaScript layer
 * and returns true.
 * Else does nothing and returns false.
 *
 * Do not call if `intent.action` is not ACTION_VIEW.
 */
internal fun maybeHandleViewNotif(intent: Intent, maybeReactContext: ReactContext?): Boolean {
    assert(intent.action == Intent.ACTION_VIEW)

    val url = intent.data
    // Launch MainActivity on tapping a notification
    if (url?.scheme == "zulip" && url.authority == NOTIFICATION_URL_AUTHORITY) {
        val data = intent.getBundleExtra(EXTRA_NOTIFICATION_DATA) ?: return false
        logNotificationData("notif opened", data)
        notifyReact(maybeReactContext, data)
        return true
    }

    return false
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
