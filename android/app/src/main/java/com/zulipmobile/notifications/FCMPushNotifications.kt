@file:JvmName("FCMPushNotifications")

package com.zulipmobile.notifications

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.Person
import androidx.core.app.RemoteInput
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.ReactApplication
import me.leolin.shortcutbadger.ShortcutBadger

import com.zulipmobile.BuildConfig
import com.zulipmobile.R

private val CHANNEL_ID = "default"

@JvmField
val ACTION_CLEAR = "ACTION_CLEAR"

@JvmField
val EXTRA_NOTIFICATION_DATA = "data"

@JvmField
val REPLY = "REPLY"

fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT >= 26) {
        val name = context.getString(R.string.notification_channel_name)

        @SuppressLint("WrongConstant")
        // Android Studio's linter demands NotificationManager.IMPORTANCE_* and rejects any other
        // value, hence using "SupressLint".
        val channel =
            NotificationChannel(CHANNEL_ID, name, NotificationManagerCompat.IMPORTANCE_HIGH).apply {
                description = context.getString(R.string.notification_channel_description)
                enableLights(true)
                enableVibration(true)
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
        Log.w(TAG, "Ignoring malformed FCM message: ${e.message}")
        return
    }

    if (fcmMessage is MessageFcmMessage) {
        updateNotification(context, fcmMessage)
    } // TODO handle case for RemoveFcmMessage
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

private fun createReplyAction(
    context: Context,
    fcmMessage: MessageFcmMessage,
    conversationKey: String
): NotificationCompat.Action {
    val sendTo: String
    var topic: String? = null
    var type = "private"
    when (fcmMessage.recipient) {
        is Recipient.Stream -> {
            sendTo = fcmMessage.recipient.stream
            topic = fcmMessage.recipient.topic
            type = "stream"
        }
        is Recipient.GroupPm -> sendTo = fcmMessage.recipient.pmUsers.toString()
        is Recipient.Pm -> sendTo  = fcmMessage.sender.id.toString()
    }

    val remoteInput = RemoteInput.Builder(REPLY).build()
    val replyIntent = Intent(context, ReplyService::class.java)
    replyIntent.putExtra("sendTo", sendTo)
    replyIntent.putExtra("topic", topic)
    replyIntent.putExtra("type", type)
    replyIntent.putExtra("conversationKey", conversationKey)

    val resultPendingIntent = PendingIntent.getService(
        context,
        0,
        replyIntent,
        PendingIntent.FLAG_UPDATE_CURRENT
    )

    return NotificationCompat.Action.Builder(
        android.R.drawable.edit_text,
        "Reply", resultPendingIntent)
        .addRemoteInput(remoteInput)
        .build()
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
fun getActiveNotification(context: Context, conversationKey: String):
    Pair<Int?, Notification?> {
    // activeNotifications are not available in NotificationCompatManager
    // Hence we have to use instance of NotificationManager.
    val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?

    val activeStatusBarNotifications = notificationManager?.activeNotifications
    if (activeStatusBarNotifications != null) {
        for (statusBarNotification in activeStatusBarNotifications) {
            val notification = statusBarNotification.notification
            if (notification.extras.getString("conversationKey") == conversationKey) {
                return Pair(statusBarNotification.id, notification)
            }
        }
    }
    return Pair(null, null)
}

private fun createSummaryNotification(
    context: Context,
    fcmMessage: MessageFcmMessage,
    groupKey: String
): NotificationCompat.Builder {
    val realmUri = fcmMessage.identity!!.realmUri.toString()
    val builder = NotificationCompat.Builder(context, CHANNEL_ID)

    builder.apply {
        // This should agree with `BRAND_COLOR` in the JS code.
        builder.color = Color.rgb(100, 146, 254)
        if (BuildConfig.DEBUG) {
            builder.setSmallIcon(R.mipmap.ic_launcher)
        } else {
            builder.setSmallIcon(R.drawable.zulip_notification)
        }
        setStyle(NotificationCompat.InboxStyle()
            .setSummaryText(realmUri)
        )
        setGroup(groupKey)
        setGroupSummary(true)
        setAutoCancel(true)
    }

    return builder
}

private fun updateNotification(
    context: Context, fcmMessage: MessageFcmMessage) {
    val user = Person.Builder().setName("You").build()
    val sender = Person.Builder()
        .setName(fcmMessage.sender.fullName)
        .setIcon(IconCompat.createWithBitmap(fetchBitmap(fcmMessage.sender.avatarURL)))
        .build()

    var isGroupConversation = true
    val title = when (fcmMessage.recipient) {
        is Recipient.Stream -> "#${fcmMessage.recipient.stream} > ${fcmMessage.recipient.topic}"
        // TODO use proper title for GroupPM, we will need
        // to have a way to get names of PM users here.
        is Recipient.GroupPm -> context.getString(R.string.group_pm, fcmMessage.recipient.pmUsers)
        is Recipient.Pm -> {
            isGroupConversation = false
            fcmMessage.sender.fullName
        }
    }
    val groupKey = "${fcmMessage.identity?.realmUri.toString()};${fcmMessage.identity?.userId}"
    val conversationKey = "$groupKey;$title"
    val extraData = Bundle()
    extraData.putString("conversationKey", conversationKey)
    var (notificationId, notification) = getActiveNotification(context, conversationKey)
    notificationId = notificationId?: fcmMessage.zulipMessageId

    val messagingStyle = when (notification) {
        null -> NotificationCompat.MessagingStyle(user)
        else -> NotificationCompat.MessagingStyle
            .extractMessagingStyleFromNotification(notification)
            ?: NotificationCompat.MessagingStyle(user)
    }
    messagingStyle
        .setConversationTitle(title)
        .setGroupConversation(isGroupConversation)
        .addMessage(fcmMessage.content, fcmMessage.timeMs, sender)

    val messageCount = messagingStyle.messages.size

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
    builder.apply {
        color = Color.rgb(100, 146, 254)
        if (BuildConfig.DEBUG) {
            setSmallIcon(R.mipmap.ic_launcher)
        } else {
            setSmallIcon(R.drawable.zulip_notification)
        }
        setAutoCancel(true)
        setStyle(messagingStyle)
        setGroup(groupKey)
        setContentIntent(createViewPendingIntent(fcmMessage, context))
        setNumber(messageCount)
        addAction(createReplyAction(context, fcmMessage, conversationKey))
        extras = extraData
    }

    val summaryNotification = createSummaryNotification(context, fcmMessage, groupKey)

    NotificationManagerCompat.from(context).apply {
        // here notifications are identified by TAG + notificationId
        // simply using notificationId is not sufficient and will
        // fail in case of different account in same realm.
        notify(groupKey, fcmMessage.identity!!.realmId, summaryNotification.build())
        notify(conversationKey, notificationId, builder.build())
    }
}

internal fun onOpened(application: ReactApplication, data: Bundle) {
    logNotificationData("notif opened", data)
    notifyReact(application, data)
    try {
        ShortcutBadger.removeCount(application as Context)
    } catch (e: Exception) {
        Log.e(TAG, "BADGE ERROR: $e")
    }

}
