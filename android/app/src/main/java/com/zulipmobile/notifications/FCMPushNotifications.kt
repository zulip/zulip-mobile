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
import android.text.TextUtils
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.Person
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.ReactApplication
import me.leolin.shortcutbadger.ShortcutBadger

import com.zulipmobile.BuildConfig
import com.zulipmobile.R
import com.zulipmobile.ZLog

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

internal fun onReceived(context: Context, conversations: ConversationMap, mapData: Map<String, String>) {
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
        addConversationToMap(fcmMessage, conversations)
        updateNotification(context, conversations, fcmMessage)
    } else if (fcmMessage is RemoveFcmMessage) {
        removeMessagesFromMap(conversations, fcmMessage)
        if (conversations.isEmpty()) {
            NotificationManagerCompat.from(context).cancelAll()
        }
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

// TODO: Add a Text saying n messages in m conversations. (this will
// only be visible in API < 24)
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
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage) {
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

private fun getNotificationBuilder(
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage): NotificationCompat.Builder {
    val builder = NotificationCompat.Builder(context, CHANNEL_ID)

    val viewPendingIntent = createViewPendingIntent(fcmMessage, context)
    builder.setContentIntent(viewPendingIntent)
    builder.setAutoCancel(true)

    val totalMessagesCount = extractTotalMessagesCount(conversations)

    if (BuildConfig.DEBUG) {
        builder.setSmallIcon(R.mipmap.ic_launcher)
    } else {
        builder.setSmallIcon(R.drawable.zulip_notification)
    }

    builder.color = context.getColor(R.color.brandColor)

    val nameList = extractNames(conversations)

    if (conversations.size == 1 && nameList.size == 1) {
        //Only one 1 notification therefore no using of big view styles
        if (totalMessagesCount > 1) {
            builder.setContentTitle("${fcmMessage.sender.fullName} ($totalMessagesCount)")
        } else {
            builder.setContentTitle(fcmMessage.sender.fullName)
        }
        builder.setContentText(fcmMessage.content)
        if (fcmMessage.recipient is Recipient.Stream) {
            val (stream, topic) = fcmMessage.recipient
            val displayTopic = "$stream > $topic"
            builder.setSubText("Message on $displayTopic")
        }
        fetchBitmap(sizedURL(context, fcmMessage.sender.avatarURL, 64f))
            ?.let { builder.setLargeIcon(it) }
        builder.setStyle(NotificationCompat.BigTextStyle().bigText(fcmMessage.content))
    } else {
        val numConversations = context.resources.getQuantityString(
            R.plurals.numConversations, conversations.size, conversations.size)
        builder.setContentTitle("$totalMessagesCount messages in $numConversations")
        builder.setContentText("Messages from ${TextUtils.join(",", nameList)}")
        val inboxStyle = NotificationCompat.InboxStyle(builder)
        inboxStyle.setSummaryText(numConversations)
        buildNotificationContent(conversations, inboxStyle)
        builder.setStyle(inboxStyle)
    }

    try {
        ShortcutBadger.applyCount(context, totalMessagesCount)
    } catch (e: Exception) {
        ZLog.e(TAG, e)
    }

    builder.setWhen(fcmMessage.timeMs)
    builder.setShowWhen(true)

    val vPattern = longArrayOf(0, 100, 200, 100)
    // NB the DEFAULT_VIBRATE flag below causes this to have no effect.
    // TODO: choose a vibration pattern we like, and unset DEFAULT_VIBRATE.
    builder.setVibrate(vPattern)

    builder.setDefaults(NotificationCompat.DEFAULT_VIBRATE or NotificationCompat.DEFAULT_LIGHTS)

    builder.addAction(createDismissAction(context))

    val soundUri = getNotificationSoundUri()
    builder.setSound(soundUri)
    return builder
}

internal fun onOpened(application: ReactApplication, conversations: ConversationMap, data: Bundle) {
    logNotificationData("notif opened", data)
    notifyReact(application, data)
    NotificationManagerCompat.from(application as Context).cancelAll()
    clearConversations(conversations)
    try {
        ShortcutBadger.removeCount(application as Context)
    } catch (e: Exception) {
        ZLog.e(TAG, e)
    }

}

internal fun onClear(context: Context, conversations: ConversationMap) {
    clearConversations(conversations)
    NotificationManagerCompat.from(context).cancelAll()
}
