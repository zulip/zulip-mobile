@file:JvmName("FCMPushNotifications")

package com.zulipmobile.notifications

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.service.notification.StatusBarNotification
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

/** The channel ID we use for our one notification channel, which we use for all notifications. */
private val CHANNEL_ID = "default"

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

fun createNotificationChannel(context: Context) {
    val audioAttr: AudioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
    if (Build.VERSION.SDK_INT >= 26) {
        val name = context.getString(R.string.notification_channel_name)

        @SuppressLint("WrongConstant")
        // Android Studio's linter demands NotificationManager.IMPORTANCE_* and rejects any other
        // value, hence using "SupressLint".
        val channel =
            NotificationChannel(CHANNEL_ID, name, NotificationManagerCompat.IMPORTANCE_HIGH).apply {
                enableLights(true)
                enableVibration(true)
                setSound(getNotificationSoundUri(), audioAttr)
            }
        NotificationManagerCompat.from(context).createNotificationChannel(channel)
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

    val statusBarNotifications = getActiveNotifications(context) ?: return
    // Find any conversations we can cancel the notification for.
    // The API doesn't lend itself to removing individual messages as
    // they're read, so we wait until we're ready to remove the whole
    // conversation's notification.
    // See: https://github.com/zulip/zulip-mobile/pull/4842#pullrequestreview-725817909
    for (statusBarNotification in statusBarNotifications) {
        // Each statusBarNotification represents one Zulip conversation.
        val notification = statusBarNotification.notification
        val lastMessageId = notification.extras.getInt("lastZulipMessageId")
        if (fcmMessage.messageIds.contains(lastMessageId)) {
            // The latest Zulip message in this conversation was read.
            // That's our cue to cancel the notification for the conversation.
            NotificationManagerCompat.from(context).cancel(statusBarNotification.tag, statusBarNotification.id)
        }
    }
    var counter = 0
    for (statusBarNotification in statusBarNotifications) {
        if (statusBarNotification.notification.group == groupKey) {
            counter++
        }
    }
    if (counter == 2) {
        // counter will be 2 only when summary notification and last notification are
        // present; in this case, we remove summary notification.
        NotificationManagerCompat.from(context).cancel(groupKey, NOTIFICATION_ID)
        // TODO: What if several conversations get read at once?  Does this leave a ghost group?
        //   (Yep, it does: #5119.)
    }
}

/** A PendingIntent for opening this message's conversation in the app. */
private fun createViewPendingIntent(fcmMessage: MessageFcmMessage, context: Context): PendingIntent {
    val uri = Uri.fromParts("zulip", "msgid:${fcmMessage.zulipMessageId}", "")
    val viewIntent = Intent(Intent.ACTION_VIEW, uri, context, NotificationIntentService::class.java)
    viewIntent.putExtra(EXTRA_NOTIFICATION_DATA, fcmMessage.dataForOpen())
    return PendingIntent.getService(context, 0, viewIntent, 0)
}

/**
 * @param context
 * @param conversationKey Unique Key identifying a conversation, the current
 * implementation assumes that each notification corresponds to 1 and only 1
 * conversation.
 *
 * A conversation can be any of: Topic in Stream, GroupPM or PM for a
 * specific user in a specific realm.
 */
private fun getActiveNotification(context: Context, conversationKey: String): Notification? {
    // activeNotifications are not available in NotificationCompatManager
    // Hence we have to use instance of NotificationManager.
    val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?

    val activeStatusBarNotifications = notificationManager?.activeNotifications
    if (activeStatusBarNotifications != null) {
        for (statusBarNotification in activeStatusBarNotifications) {
            if (statusBarNotification.tag == conversationKey) {
                return statusBarNotification.notification
            }
        }
    }
    return null
}


private fun getActiveNotifications(context: Context): Array<StatusBarNotification>? =
    (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?)?.activeNotifications

private fun createSummaryNotification(
    context: Context,
    fcmMessage: MessageFcmMessage,
    groupKey: String
): NotificationCompat.Builder {
    val realmUri = fcmMessage.identity.realmUri.toString()
    return NotificationCompat.Builder(context, CHANNEL_ID).apply {
        color = context.getColor(R.color.brandColor)
        setSmallIcon(if (BuildConfig.DEBUG) R.mipmap.ic_launcher else R.drawable.zulip_notification)
        setStyle(NotificationCompat.InboxStyle()
            .setSummaryText(realmUri)
        )
        setGroup(groupKey)
        setGroupSummary(true)
        setAutoCancel(true)
    }
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

/** Handle a MessageFcmMessage, adding or extending notifications in the UI. */
private fun updateNotification(
    context: Context, fcmMessage: MessageFcmMessage) {
    // We have an FCM message telling us about a Zulip message.  We'll add
    // a message (in the Android NotificationCompat.MessagingStyle.Message sense)
    // to the notification for that Zulip message's conversation.  We create
    // the notification, and its notification group, if they don't already exist.

    val selfUser = Person.Builder().setName(context.getString(R.string.selfUser)).build()
    val sender = Person.Builder()
        .setName(fcmMessage.sender.fullName)
        .setIcon(IconCompat.createWithBitmap(fetchBitmap(fcmMessage.sender.avatarURL)))
        .build()

    val title = when (fcmMessage.recipient) {
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
    }
    val isGroupConversation = when (fcmMessage.recipient) {
        is Recipient.Stream -> true
        is Recipient.GroupPm -> true
        is Recipient.Pm -> false
    }
    val groupKey = extractGroupKey(fcmMessage.identity)
    val conversationKey = extractConversationKey(fcmMessage)
    val notification = getActiveNotification(context, conversationKey)

    // The MessagingStyle contains details including the list of shown
    // messages in the conversation.  If there's already a notification
    // for this conversation, we get its MessagingStyle so we can extend it.
    val messagingStyle = notification?.let {
        NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(it)
    } ?: NotificationCompat.MessagingStyle(selfUser)
    messagingStyle
        .setConversationTitle(title)
        .setGroupConversation(isGroupConversation)
        .addMessage(fcmMessage.content, fcmMessage.timeMs, sender)

    val messageCount = messagingStyle.messages.size

    val builder = NotificationCompat.Builder(context, CHANNEL_ID).apply {
        color = context.getColor(R.color.brandColor)
        setSmallIcon(if (BuildConfig.DEBUG) R.mipmap.ic_launcher else R.drawable.zulip_notification)
        setAutoCancel(true)
        setStyle(messagingStyle)
        setGroup(groupKey)
        setSound(getNotificationSoundUri())
        setContentIntent(createViewPendingIntent(fcmMessage, context))
        setNumber(messageCount)
        extras = Bundle().apply {
            putInt("lastZulipMessageId", fcmMessage.zulipMessageId)
        }
    }

    val summaryNotification = createSummaryNotification(context, fcmMessage, groupKey)

    NotificationManagerCompat.from(context).apply {
        // This posts the notifications.  If there is an existing notification
        // with the same tag and ID as one of these calls to `notify`, this will
        // replace it with the updated notification we've just constructed.
        notify(groupKey, NOTIFICATION_ID, summaryNotification.build())
        notify(conversationKey, NOTIFICATION_ID, builder.build())
    }
}

private fun getNotificationSoundUri(): Uri {
    // Note: Provide default notification sound until we found a good sound
    // return Uri.parse("${ContentResolver.SCHEME_ANDROID_RESOURCE}://${context.packageName}/${R.raw.zulip}")
    return Settings.System.DEFAULT_NOTIFICATION_URI
}

internal fun onOpened(application: ReactApplication, data: Bundle) {
    logNotificationData("notif opened", data)
    notifyReact(application, data)
    try {
        ShortcutBadger.removeCount(application as Context)
    } catch (e: Exception) {
        ZLog.e(TAG, e)
    }
}
