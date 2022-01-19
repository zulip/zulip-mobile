@file:JvmName("NotificationChannelManager")

package com.zulipmobile.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.zulipmobile.R

/** The channel ID we use for our one notification channel, which we use for all notifications. */
// Previous value: "default"
val CHANNEL_ID = "messages-1"

/** The vibration pattern we set. */
// We try to set a vibration pattern that, with the phone in one's pocket,
// is both distinctly present and distinctly different from the default.
// Discussion: https://chat.zulip.org/#narrow/stream/48-mobile/topic/notification.20vibration.20pattern/near/1284530
val kVibrationPattern = longArrayOf(0, 125, 100, 450);

fun getNotificationSoundUri(): Uri {
    // TODO(#3150): Find an appropriate Zulip-specific sound to use.
    //   (The one the Zulip web app uses is a bad fit for a mobile notification:
    //     https://github.com/zulip/zulip-mobile/pull/3233#issuecomment-450245374
    //   .)  Until then, we use the system default notification sound.
    return Settings.System.DEFAULT_NOTIFICATION_URI
}

fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT < 26) {
        // Notification channels don't exist before SDK 26, aka Android 8 Oreo.
        return
    }

    // TODO: It'd be nice to use NotificationChannelCompat here: we get a nice builder class,
    //   plus should then be able to drop the Build.VERSION condition.
    //   Needs upgrading androidx.core to 1.5.0:
    //     https://developer.android.com/jetpack/androidx/releases/core#1.5.0-alpha02

    // NOTE when changing anything here: the changes will not take effect
    // for existing installs of the app!  That's because we'll have already
    // created the channel with the old settings, and they're in the user's
    // hands from there.  Our choices are:
    //
    //  * Leave the old settings in place for existing installs, so the
    //    changes only apply to new installs.
    //
    //  * Change `CHANNEL_ID`, so that we abandon the old channel and use
    //    a new one.  Existing installs will get the new settings.
    //
    //    This also means that if the user has changed any of the notification
    //    settings for the channel -- like "override Do Not Disturb", or "use
    //    a different sound", or "don't pop on screen" -- their changes get
    //    reset.  So this has to be done sparingly.
    val manager = context.notificationManager
    manager.createNotificationChannel(NotificationChannel(
        CHANNEL_ID,
        context.getString(R.string.notification_channel_name),
        NotificationManager.IMPORTANCE_HIGH
    ).apply {
        // TODO: Is this the default value anyway for IMPORTANCE_HIGH?
        //   If so, perhaps just take it out.
        enableLights(true)

        vibrationPattern = kVibrationPattern

        // TODO: Is this just setting these values to their defaults?
        //   Perhaps we can just take it out.
        setSound(getNotificationSoundUri(),
            AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build())
    })

    // Delete any obsolete previous channels.
    for (channel in manager.notificationChannels) {
        if (channel.id != CHANNEL_ID) {
            manager.deleteNotificationChannel(channel.id)
        }
    }
}
