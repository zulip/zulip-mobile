@file:JvmName("NotificationUiManager")

package com.zulipmobile.notifications

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.ReactApplication
import com.zulipmobile.BuildConfig
import com.zulipmobile.R
import com.zulipmobile.ZLog
import me.leolin.shortcutbadger.ShortcutBadger
import java.io.IOException
import java.io.InputStream
import java.net.URL

// This file maintains the notifications in the UI, using data from FCM messages.
//
// We map Zulip conversations to the Android notifications model like so:
//  * Each Zulip account/identity that has notifications gets a separate
//    notification group:
//      https://developer.android.com/training/notify-user/group
//  * Each Zulip conversation (a PM thread, or a stream + topic) goes to
//    one notification, a "messaging-style" notification:
//      https://developer.android.com/training/notify-user/expanded#message-style
//  * Each Zulip message that causes a notification (so by default, each PM
//    or @-mention; but the user's preferences live on the server, so as far
//    as we're concerned here, it's whatever the server sends us) becomes a
//    message in its conversation's notification.
//
// Further, the Android framework identifies each notification by both a
// string "tag" and a numeric "ID", both of which we choose.  We construct
// the tags to be unique, and use an arbitrary constant for the IDs.
//
// The main entry point is `onReceived`, which is called when we receive
// an FCM message.

/** An Android logging tag for our notifications code. */
// (This doesn't particularly belong in this file, but it belongs somewhere
// in the notifications package.)
@JvmField
val TAG = "ZulipNotif"

/** The channel ID we use for our one notification channel, which we use for all notifications. */
// Previous value: "default"
private val CHANNEL_ID = "messages-1"

/**
 * The constant numeric "ID" we use for all notifications, along with unique tags.
 *
 * Because we construct a unique string "tag" for each distinct notification,
 * and Android notifications are identified by the pair (tag, ID), it's simplest
 * to leave these numeric IDs all the same.
 */
private val NOTIFICATION_ID = 435

@JvmField
val ACTION_CLEAR = "ACTION_CLEAR"

@JvmField
val EXTRA_NOTIFICATION_DATA = "data"

private val Context.notificationManager: NotificationManager
    // This `getSystemService` method can return null if the class is not a supported
    // system service.  But NotificationManager was added in API 1, long before the
    // oldest Android version we support, so just assert here that it's non-null.
    get() = this.getSystemService(NotificationManager::class.java)!!

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

        // Try to set a vibration pattern that, with the phone in one's pocket,
        // is both distinctly present and distinctly different from the default.
        // Discussion: https://chat.zulip.org/#narrow/stream/48-mobile/topic/notification.20vibration.20pattern/near/1284530
        vibrationPattern = longArrayOf(0, 125, 100, 450)

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

/** Write the given data to the device log, for debugging. */
private fun logNotificationData(msg: String, data: Bundle) {
    data.keySet() // Has the side effect of making `data.toString` more informative.
    Log.v(TAG, "$msg: $data")
}

/** Handle an FCM message, updating the set of notifications in the UI. */
internal fun onReceived(context: Context, mapData: Map<String, String>) {
    // TODO refactor to not need this; reflects a juxtaposition of FCM with old GCM interfaces.
    val data = Bundle()
    for ((key, value) in mapData) {
        data.putString(key, value)
    }
    logNotificationData("notif received", data)

    val fcmMessage: FcmMessage
    try {
        fcmMessage = FcmMessage.fromFcmData(mapData)
    } catch (e: FcmMessageParseException) {
        ZLog.w(TAG, e)
        return
    }

    if (fcmMessage is MessageFcmMessage) {
        updateNotification(context, fcmMessage)
    } else if (fcmMessage is RemoveFcmMessage) {
        removeNotification(context, fcmMessage)
    }
}

/** Handle a RemoveFcmMessage, removing notifications from the UI as appropriate. */
private fun removeNotification(context: Context, fcmMessage: RemoveFcmMessage) {
    // We have an FCM message telling us that some Zulip messages were read
    // and should no longer appear as notifications.  We'll remove their
    // conversations' notifications, if appropriate, and then the whole
    // notification group if it's now empty.

    // There may be a lot of messages mentioned here, across a lot of
    // conversations.  But they'll all be for one identity, so they'll
    // fall under one notification group.
    val groupKey = extractGroupKey(fcmMessage.identity)

    // Find any conversations we can cancel the notification for.
    // The API doesn't lend itself to removing individual messages as
    // they're read, so we wait until we're ready to remove the whole
    // conversation's notification.
    // See: https://github.com/zulip/zulip-mobile/pull/4842#pullrequestreview-725817909
    var haveRemaining = false
    for (statusBarNotification in context.notificationManager.activeNotifications) {
        // The StatusBarNotification object describes an active notification in the UI.
        // Its relationship to the Notification and to our metadata is a bit confusing:
        //  * The `.tag`, `.id`, and `.notification` are the same values as we passed to
        //    `NotificationManager#notify`.  So these are good to match on and inspect.
        //  * The `.groupKey` and `.key` sound tempting.  But while the `.groupKey` contains
        //    the `.notification.group`, and the `.key` contains the `.id` and `.tag`, they
        //    also have more stuff added on (and their structure doesn't seem to be documented.)
        //    So don't try to match those.
        val notification = statusBarNotification.notification

        // Don't act on notifications that are for other Zulip accounts/identities.
        if (notification.group != groupKey) continue;

        // Don't act on the summary notification for the group.
        if (statusBarNotification.tag == groupKey) continue;

        val lastMessageId = notification.extras.getInt("lastZulipMessageId")
        if (fcmMessage.messageIds.contains(lastMessageId)) {
            // The latest Zulip message in this conversation was read.
            // That's our cue to cancel the notification for the conversation.
            NotificationManagerCompat.from(context).cancel(statusBarNotification.tag, statusBarNotification.id)
        } else {
            // This notification is for another conversation that's still unread.
            // We won't cancel the summary notification.
            haveRemaining = true
        }
    }

    if (!haveRemaining) {
        // The notification group is now empty; it had no notifications we didn't
        // just cancel, except the summary notification.  Cancel that one too.
        NotificationManagerCompat.from(context).cancel(groupKey, NOTIFICATION_ID)
    }
}

/**
 * Get the active notification with this tag, if any.
 *
 * In general Android allows multiple notifications with the same tag,
 * only requiring the (tag, id) pair to be unique.  We use the fact that
 * our notifications have unique tags.
 */
private fun getActiveNotificationByTag(context: Context, notificationTag: String): Notification? {
    val activeStatusBarNotifications = context.notificationManager.activeNotifications
    for (statusBarNotification in activeStatusBarNotifications) {
        if (statusBarNotification.tag == notificationTag) {
            return statusBarNotification.notification
        }
    }
    return null
}

/** The unique tag we use for the group of notifications addressed to this Zulip account. */
private fun extractGroupKey(identity: Identity): String {
    // The realm URL can't contain a `|`, because `|` is not a URL code point:
    //   https://url.spec.whatwg.org/#url-code-points
    return "${identity.realmUri.toString()}|${identity.userId}"
}

/**
 * The unique tag we use for the notification for this Zulip message's conversation.
 *
 * This will match between different messages in the same conversation, but will
 * otherwise be distinct, even across other Zulip accounts.  It also won't collide
 * with any `extractGroupKey` result.
 */
private fun extractConversationKey(fcmMessage: MessageFcmMessage): String {
    val groupKey = extractGroupKey(fcmMessage.identity)
    val conversation = when (fcmMessage.recipient) {
        // TODO(#3918): Use the stream ID here instead of the stream name,
        //   so things stay together if the stream is renamed.
        // So long as this does use the stream name, we use `\u0000` as the delimiter because
        // it's the one character not allowed in Zulip stream names.
        // (See `check_stream_name` in zulip.git:zerver/lib/streams.py.)
        is Recipient.Stream -> "stream:${fcmMessage.recipient.stream}\u0000${fcmMessage.recipient.topic}"
        is Recipient.GroupPm -> "groupPM:${fcmMessage.recipient.pmUsers.toString()}"
        is Recipient.Pm -> "private:${fcmMessage.sender.id}"
    }
    return "$groupKey|$conversation"
}

/** A unique tag for this Zulip message. */
private fun extractMessageKey(fcmMessage: MessageFcmMessage): String {
    val messageKey = "${extractGroupKey(fcmMessage.identity)}|${fcmMessage.zulipMessageId}"
    return messageKey
}

/** Fetch an image from the given URL.  (We use this for sender avatars.) */
fun fetchBitmap(url: URL): Bitmap? {
    return try {
        val connection = url.openConnection()
        connection.useCaches = true
        (connection.content as? InputStream)
            ?.let { BitmapFactory.decodeStream(it) }
    } catch (e: IOException) {
        ZLog.e(TAG, e)
        null
    }
}

/** Handle a MessageFcmMessage, adding or extending notifications in the UI. */
private fun updateNotification(
    context: Context, fcmMessage: MessageFcmMessage) {
    // We have an FCM message telling us about a Zulip message.  We'll add
    // a message (in the Android NotificationCompat.MessagingStyle.Message sense)
    // to the notification for that Zulip message's conversation.  We create
    // the notification, and its notification group, if they don't already exist.

    val groupKey = extractGroupKey(fcmMessage.identity)
    val conversationKey = extractConversationKey(fcmMessage)
    val oldNotification = getActiveNotificationByTag(context, conversationKey)

    // The MessagingStyle contains details including the list of shown
    // messages in the conversation.
    val messagingStyle =
        if (oldNotification != null) {
            // If there's already a notification for this conversation, we get its
            // MessagingStyle so we can extend it.  (This won't be null, because we
            // always use a MessagingStyle.)
            NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(oldNotification)!!
        } else {
            // If not, make a fresh one.
            val selfUser = Person.Builder().setName(context.getString(R.string.selfUser)).build()
            NotificationCompat.MessagingStyle(selfUser)
                .setGroupConversation(when (fcmMessage.recipient) {
                    is Recipient.Stream, is Recipient.GroupPm -> true
                    is Recipient.Pm -> false
                })
        }

    // The title typically won't change between messages in a conversation, but we
    // update it anyway.  This means a PM sender's display name gets updated if it's
    // changed, which is a rare edge case but probably good.  The main effect is that
    // group-PM threads (pending #5116) get titled with the latest sender, rather than
    // the first.
    messagingStyle.setConversationTitle(when (fcmMessage.recipient) {
        is Recipient.Stream -> "#${fcmMessage.recipient.stream} > ${fcmMessage.recipient.topic}"
        // TODO(#5116): use proper title for GroupPM, for which we will need
        //   to have a way to get names of PM users here.
        is Recipient.GroupPm -> context.resources.getQuantityString(
            R.plurals.group_pm,
            fcmMessage.recipient.pmUsers.size - 2,
            fcmMessage.sender.fullName,
            fcmMessage.recipient.pmUsers.size - 2
        )
        is Recipient.Pm -> fcmMessage.sender.fullName
    })

    val sender = Person.Builder().apply {
        setName(fcmMessage.sender.fullName)
        fetchBitmap(fcmMessage.sender.avatarURL)?.let {
            setIcon(IconCompat.createWithBitmap(it))
        }
    }.build()
    messagingStyle.addMessage(fcmMessage.content, fcmMessage.timeMs, sender)

    // See comment at `setContentIntent` below.
    @SuppressLint("LaunchActivityFromNotification")
    val notification = NotificationCompat.Builder(context, CHANNEL_ID).apply {
        setGroup(groupKey)

        // TODO(Build.VERSION.SDK_INT>=26): This is ignored on newer Android, in favor of
        //   what we set on the channel (above).
        setSound(getNotificationSoundUri())

        // TODO Perhaps set color and icon based on conversation?
        //   E.g., stream-subscription color, and hash icon or lock icon.
        color = context.getColor(R.color.brandColor)
        setSmallIcon(if (BuildConfig.DEBUG) R.mipmap.ic_launcher else R.drawable.zulip_notification)

        setStyle(messagingStyle)

        setNumber(messagingStyle.messages.size)

        extras = Bundle().apply {
            // We use this for deciding when a RemoveFcmMessage should clear this notification.
            putInt("lastZulipMessageId", fcmMessage.zulipMessageId)
        }

        // The linter warns us here (suppressed by the `SuppressLint` above) that our
        // current setup where tapping the notification starts NotificationIntentService,
        // which then goes on to start or interact with our actual Activity, won't be allowed
        // when targeting Android 12+.  Details:
        //   https://developer.android.com/about/versions/12/behavior-changes-12#notification-trampolines
        // TODO(#5101): Replace NotificationIntentService with directly starting an Activity.
        //   Preferably MainActivity itself, if we can arrange the right behavior regardless
        //   of whether it's currently in the foreground, the background, or not running.
        //   Otherwise, a shim analogous to ShareToZulipActivity should work.
        setContentIntent(
            PendingIntent.getService(context, 0,
                Intent(Intent.ACTION_VIEW,
                    // We don't use a URL for this intent; rather we get the information
                    // from the "extra" we add to it.  But, empirically, if the URL is the
                    // same from one notification to the next, then opening the second one
                    // just takes us back to where the first one led, ignoring its different extras.
                    // So we make sure the URL is different every time.
                    Uri.fromParts("zulip", extractMessageKey(fcmMessage), ""),
                    context, NotificationIntentService::class.java
                ).putExtra(EXTRA_NOTIFICATION_DATA, fcmMessage.dataForOpen()),
                PendingIntent.FLAG_IMMUTABLE))
        setAutoCancel(true)
    }.build()

    val summaryNotification = NotificationCompat.Builder(context, CHANNEL_ID).apply {
        setGroup(groupKey)
        setGroupSummary(true)

        color = context.getColor(R.color.brandColor)
        setSmallIcon(if (BuildConfig.DEBUG) R.mipmap.ic_launcher else R.drawable.zulip_notification)

        // For the summary we use an "inbox-style" notification, as recommended here:
        //   https://developer.android.com/training/notify-user/group#set_a_group_summary
        setStyle(NotificationCompat.InboxStyle()
            // TODO(#5115): Use the org's friendly name instead of its URL.
            .setSummaryText(fcmMessage.identity.realmUri.toString())
            // TODO: Use addLine and setBigContentTitle to add some summary info when collapsed?
            //   (See example in the linked doc.)
        )

        // TODO Does this do something useful?  There isn't a way to open these summary notifs.
        setAutoCancel(true)
    }.build()

    NotificationManagerCompat.from(context).apply {
        // This posts the notifications.  If there is an existing notification
        // with the same tag and ID as one of these calls to `notify`, this will
        // replace it with the updated notification we've just constructed.
        notify(groupKey, NOTIFICATION_ID, summaryNotification)
        notify(conversationKey, NOTIFICATION_ID, notification)
    }
}

private fun getNotificationSoundUri(): Uri {
    // TODO(#3150): Find an appropriate Zulip-specific sound to use.
    //   (The one the Zulip web app uses is a bad fit for a mobile notification:
    //     https://github.com/zulip/zulip-mobile/pull/3233#issuecomment-450245374
    //   .)  Until then, we use the system default notification sound.
    return Settings.System.DEFAULT_NOTIFICATION_URI
}

internal fun onOpened(application: ReactApplication, data: Bundle) {
    logNotificationData("notif opened", data)
    notifyReact(application, data)
    try {
        // TODO: Does this (still) do anything useful?  We call `setNumber` on the
        //   notification builder, which is supposed to provide a badge count:
        //     https://developer.android.com/reference/androidx/core/app/NotificationCompat.Builder#setNumber(int)
        //   and then `setAutoCancel`, so the notification gets cancelled on open.
        ShortcutBadger.removeCount(application as Context)
    } catch (e: Exception) {
        ZLog.e(TAG, e)
    }
}
