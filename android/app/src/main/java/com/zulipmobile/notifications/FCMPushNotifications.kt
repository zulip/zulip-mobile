@file:JvmName("FCMPushNotifications")

package com.zulipmobile.notifications

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
import com.facebook.react.ReactApplication
import me.leolin.shortcutbadger.ShortcutBadger

import com.zulipmobile.BuildConfig
import com.zulipmobile.R

private val CHANNEL_ID = "default"
private val NOTIFICATION_ID = 435

@JvmField
val ACTION_CLEAR = "ACTION_CLEAR"

@JvmField
val EXTRA_NOTIFICATION_DATA = "data"

private fun getNotificationManager(context: Context): NotificationManager {
    return context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
}

fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT >= 26) {
        val name = context.getString(R.string.notification_channel_name)
        val channel = NotificationChannel(CHANNEL_ID, name, NotificationManager.IMPORTANCE_HIGH)
        getNotificationManager(context).createNotificationChannel(channel)
    }
}

private fun logNotificationData(data: Bundle) {
    data.keySet() // Has the side effect of making `data.toString` more informative.
    Log.v(TAG, "getPushNotification: $data", Throwable())
}

internal fun onReceived(context: Context, conversations: ConversationMap, mapData: Map<String, String>) {
    // TODO refactor to not need this; reflects a juxtaposition of FCM with old GCM interfaces.
    val data = Bundle()
    for ((key, value) in mapData) {
        data.putString(key, value)
    }
    logNotificationData(data)

    val fcmMessage: FcmMessage
    try {
        fcmMessage = FcmMessage.fromFcmData(mapData)
    } catch (e: FcmMessageParseException) {
        Log.w(TAG, "Ignoring malformed FCM message: ${e.message}")
        return
    }

    if (fcmMessage is MessageFcmMessage) {
        addConversationToMap(fcmMessage, conversations)
        updateNotification(context, conversations, fcmMessage)
    } else if (fcmMessage is RemoveFcmMessage) {
        removeMessagesFromMap(conversations, fcmMessage)
        if (conversations.isEmpty()) {
            getNotificationManager(context).cancelAll()
        }
    }
}

private fun updateNotification(
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage) {
    if (conversations.isEmpty()) {
        getNotificationManager(context).cancelAll()
        return
    }
    val notification = getNotificationBuilder(context, conversations, fcmMessage).build()
    getNotificationManager(context).notify(NOTIFICATION_ID, notification)
}

private fun getNotificationSoundUri(context: Context): Uri {
    // Note: Provide default notification sound until we found a good sound
    // return Uri.parse("${ContentResolver.SCHEME_ANDROID_RESOURCE}://${context.packageName}/${R.raw.zulip}")
    return Settings.System.DEFAULT_NOTIFICATION_URI
}

private fun getNotificationBuilder(
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage): Notification.Builder {
    val builder = if (Build.VERSION.SDK_INT >= 26)
        Notification.Builder(context, CHANNEL_ID)
    else
        Notification.Builder(context)

    val uri = Uri.fromParts("zulip", "msgid:${fcmMessage.zulipMessageId}", "")
    val viewIntent = Intent(Intent.ACTION_VIEW, uri, context, NotificationIntentService::class.java)
    viewIntent.putExtra(EXTRA_NOTIFICATION_DATA, fcmMessage.dataForOpen())
    val viewPendingIntent = PendingIntent.getService(context, 0, viewIntent, 0)
    builder.setContentIntent(viewPendingIntent)

    builder.setAutoCancel(true)

    val totalMessagesCount = extractTotalMessagesCount(conversations)

    if (BuildConfig.DEBUG) {
        builder.setSmallIcon(R.mipmap.ic_launcher)
    } else {
        builder.setSmallIcon(R.drawable.zulip_notification)
    }

    if (conversations.size == 1) {
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
        builder.setStyle(Notification.BigTextStyle().bigText(fcmMessage.content))
    } else {
        builder.setContentTitle("$totalMessagesCount messages in ${conversations.size} conversations")
        builder.setContentText("Messages from ${TextUtils.join(",", extractNames(conversations))}")
        val inboxStyle = Notification.InboxStyle(builder)
        inboxStyle.setSummaryText("${conversations.size} conversations")
        buildNotificationContent(conversations, inboxStyle, context)
        builder.setStyle(inboxStyle)
    }

    try {
        ShortcutBadger.applyCount(context, totalMessagesCount)
    } catch (e: Exception) {
        Log.e(TAG, "BADGE ERROR: $e")
    }

    builder.setWhen(fcmMessage.timeMs)
    val vPattern = longArrayOf(0, 100, 200, 100)
    // NB the DEFAULT_VIBRATE flag below causes this to have no effect.
    // TODO: choose a vibration pattern we like, and unset DEFAULT_VIBRATE.
    builder.setVibrate(vPattern)

    builder.setDefaults(Notification.DEFAULT_VIBRATE or Notification.DEFAULT_LIGHTS)

    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
        val dismissIntent = Intent(context, NotificationIntentService::class.java)
        dismissIntent.action = ACTION_CLEAR
        val piDismiss = PendingIntent.getService(context, 0, dismissIntent, 0)
        val action = Notification.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss)
        builder.addAction(action)
    }

    val soundUri = getNotificationSoundUri(context)
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
        val audioAttr = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
        builder.setSound(soundUri, audioAttr)
    } else {
        builder.setSound(soundUri)
    }
    return builder
}

internal fun onOpened(application: ReactApplication, conversations: ConversationMap, data: Bundle) {
    logNotificationData(data)
    NotifyReact.notifyReact(application, data)
    getNotificationManager(application as Context).cancelAll()
    clearConversations(conversations)
    try {
        ShortcutBadger.removeCount(application as Context)
    } catch (e: Exception) {
        Log.e(TAG, "BADGE ERROR: $e")
    }

}

internal fun onClear(context: Context, conversations: ConversationMap) {
    clearConversations(conversations)
    getNotificationManager(context).cancelAll()
}
