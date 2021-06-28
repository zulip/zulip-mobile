@file:JvmName("FCMPushNotifications")

package com.zulipmobile.notifications

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.NotificationCompat
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

fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT >= 26) {
        val name = context.getString(R.string.notification_channel_name)

        @SuppressLint("WrongConstant")
        // Android Studio's linter demands NotificationManager.IMPORTANCE_* and rejects any other
        // value, hence using "SupressLint".
        val channel =
            NotificationChannel(CHANNEL_ID, name, NotificationManagerCompat.IMPORTANCE_HIGH)
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
        Log.w(TAG, "Ignoring malformed FCM message: ${e.message}")
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

private fun updateNotification(
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage) {
    if (conversations.isEmpty()) {
        NotificationManagerCompat.from(context).cancelAll()
        return
    }
    val notification = getNotificationBuilder(context, conversations, fcmMessage).build()
    NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
}

private fun getNotificationSoundUri(context: Context): Uri {
    // Note: Provide default notification sound until we found a good sound
    // return Uri.parse("${ContentResolver.SCHEME_ANDROID_RESOURCE}://${context.packageName}/${R.raw.zulip}")
    return Settings.System.DEFAULT_NOTIFICATION_URI
}

private fun getNotificationBuilder(
    context: Context, conversations: ConversationMap, fcmMessage: MessageFcmMessage): NotificationCompat.Builder {
    val builder = NotificationCompat.Builder(context, CHANNEL_ID)

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

    // This should agree with `BRAND_COLOR` in the JS code.
    builder.setColor(Color.rgb(100, 146, 254))

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
        Log.e(TAG, "BADGE ERROR: $e")
    }

    builder.setWhen(fcmMessage.timeMs)
    builder.setShowWhen(true)

    val vPattern = longArrayOf(0, 100, 200, 100)
    // NB the DEFAULT_VIBRATE flag below causes this to have no effect.
    // TODO: choose a vibration pattern we like, and unset DEFAULT_VIBRATE.
    builder.setVibrate(vPattern)

    builder.setDefaults(NotificationCompat.DEFAULT_VIBRATE or NotificationCompat.DEFAULT_LIGHTS)

    val dismissIntent = Intent(context, NotificationIntentService::class.java)
    dismissIntent.action = ACTION_CLEAR
    val piDismiss = PendingIntent.getService(context, 0, dismissIntent, 0)
    val action = NotificationCompat.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss)
    builder.addAction(action)

    val soundUri = getNotificationSoundUri(context)
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
        Log.e(TAG, "BADGE ERROR: $e")
    }

}

internal fun onClear(context: Context, conversations: ConversationMap) {
    clearConversations(conversations)
    NotificationManagerCompat.from(context).cancelAll()
}
