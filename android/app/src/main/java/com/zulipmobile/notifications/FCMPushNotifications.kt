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

private val CHANNEL_ID = "default"
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

private fun logNotificationData(msg: String, data: Bundle) {
    data.keySet() // Has the side effect of making `data.toString` more informative.
    Log.v(TAG, "$msg: $data")
}

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

fun removeNotification(context: Context, fcmMessage: RemoveFcmMessage) {
    val statusBarNotifications = getActiveNotifications(context) ?: return
    val groupKey = extractGroupKey(fcmMessage.identity)
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
    }
}

private fun createViewPendingIntent(fcmMessage: MessageFcmMessage, context: Context): PendingIntent {
    val uri = Uri.fromParts("zulip", "msgid:${fcmMessage.zulipMessageId}", "")
    val viewIntent = Intent(Intent.ACTION_VIEW, uri, context, NotificationIntentService::class.java)
    viewIntent.putExtra(EXTRA_NOTIFICATION_DATA, fcmMessage.dataForOpen())
    return PendingIntent.getService(context, 0, viewIntent, 0)
}

private fun createDismissAction(context: Context): NotificationCompat.Action {
    val dismissIntent = Intent(context, NotificationIntentService::class.java)
    dismissIntent.action = ACTION_CLEAR
    val piDismiss = PendingIntent.getService(context, 0, dismissIntent, 0)
    return NotificationCompat.Action(
        android.R.drawable.ic_menu_close_clear_cancel,
        "Clear",
        piDismiss
    )
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
        if (BuildConfig.DEBUG) {
            setSmallIcon(R.mipmap.ic_launcher)
        } else {
            setSmallIcon(R.drawable.zulip_notification)
        }
        setStyle(NotificationCompat.InboxStyle()
            .setSummaryText(realmUri)
        )
        setGroup(groupKey)
        setGroupSummary(true)
        setAutoCancel(true)
    }
}

private fun extractGroupKey(identity: Identity): String {
    return "${identity.realmUri.toString()}|${identity.userId}"
}

private fun extractConversationKey(fcmMessage: MessageFcmMessage): String {
    val groupKey = extractGroupKey(fcmMessage.identity)
    val conversation = when (fcmMessage.recipient) {
        is Recipient.Stream -> "stream:${fcmMessage.recipient.stream}\u0000${fcmMessage.recipient.topic}"
        is Recipient.GroupPm -> "groupPM:${fcmMessage.recipient.pmUsers.toString()}"
        is Recipient.Pm -> "private:${fcmMessage.sender.id}"
    }
    return "$groupKey|$conversation"
}

private fun updateNotification(
    context: Context, fcmMessage: MessageFcmMessage) {
    val selfUser = Person.Builder().setName(context.getString(R.string.selfUser)).build()
    val sender = Person.Builder()
        .setName(fcmMessage.sender.fullName)
        .setIcon(IconCompat.createWithBitmap(fetchBitmap(fcmMessage.sender.avatarURL)))
        .build()

    val title = when (fcmMessage.recipient) {
        is Recipient.Stream -> "#${fcmMessage.recipient.stream} > ${fcmMessage.recipient.topic}"
        // TODO use proper title for GroupPM, we will need
        // to have a way to get names of PM users here.
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

    val messagingStyle = notification?.let {
        NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(it)
    } ?: NotificationCompat.MessagingStyle(selfUser)
    messagingStyle
        .setConversationTitle(title)
        .setGroupConversation(isGroupConversation)
        .addMessage(fcmMessage.content, fcmMessage.timeMs, sender)

    val messageCount = messagingStyle.messages.size

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
    builder.apply {
        color = context.getColor(R.color.brandColor)
        if (BuildConfig.DEBUG) {
            setSmallIcon(R.mipmap.ic_launcher)
        } else {
            setSmallIcon(R.drawable.zulip_notification)
        }
        setAutoCancel(true)
        setStyle(messagingStyle)
        setGroup(groupKey)
        setSound(getNotificationSoundUri())
        setContentIntent(createViewPendingIntent(fcmMessage, context))
        setNumber(messageCount)

        val extraData = Bundle()
        extraData.putInt("lastZulipMessageId", fcmMessage.zulipMessageId)
        extras = extraData
    }

    val summaryNotification = createSummaryNotification(context, fcmMessage, groupKey)

    NotificationManagerCompat.from(context).apply {
        // We use `tag` param only, to uniquely identify notifications,
        // and hence `id` param is provided as an arbitrary constant.
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
