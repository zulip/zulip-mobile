@file:JvmName("NotificationHelper")

package com.zulipmobile.notifications

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.text.Spannable
import android.text.SpannableStringBuilder
import android.text.TextUtils
import android.text.style.StyleSpan
import android.util.Log
import android.util.TypedValue
import androidx.core.app.NotificationCompat
import java.io.IOException
import java.io.InputStream
import java.net.URL
import java.util.*

@JvmField
val TAG = "ZulipNotif"

/**
 * Type of value in [ConversationMap], contains information about
 * the conversation.
 * 
 * Specifically contains the following:
 * - notificationId of the notification this conversation is linked to.
 *   (usually set to the first messageId of the conversation.)
 * 
 * - realmId of the realm the notification belongs to (helpful
 *   for grouping)
 * 
 * - messages of this particular conversation.
 */
data class Conversation(
    val notificationId: Int,
    val realmId: Int,
    val messages: MutableList<MessageFcmMessage>
)

/**
 * All Zulip messages we're showing in notifications.
 *
 * Each key identifies a conversation; see [buildKeyString].
 *
 * Each value is the messages in the conversation, in the order we
 * received them.
 */
class ConversationMap : LinkedHashMap<String, Conversation>()

fun fetchBitmap(url: URL): Bitmap? {
    return try {
        val connection = url.openConnection()
        connection.useCaches = true
        (connection.content as? InputStream)
            ?.let { BitmapFactory.decodeStream(it) }
    } catch (e: IOException) {
        Log.e(TAG, "ERROR: $e")
        null
    }
}

fun sizedURL(context: Context, url: URL, dpSize: Float): URL {
    // From http://stackoverflow.com/questions/4605527/
    val r = context.resources
    val px = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP,
        dpSize, r.displayMetrics)
    val query = if (url.query != null) "${url.query}&s=$px" else "s=$px"
    return URL(url, "?$query")
}

fun buildNotificationContent(conversations: ConversationMap, inboxStyle: NotificationCompat.InboxStyle) {
    for (conversation in conversations.values) {
        // TODO ensure latest sender is shown last?  E.g. Gmail-style A, B, ..., A.
        val seenSenders = HashSet<String>()
        val names = ArrayList<String>()
        for (message in conversation.messages) {
            if (seenSenders.contains(message.sender.email))
                continue;
            seenSenders.add(message.sender.email)
            names.add(message.sender.fullName)
        }

        val builder = SpannableStringBuilder()
        builder.append(TextUtils.join(", ", names))
        builder.setSpan(StyleSpan(android.graphics.Typeface.BOLD),
            0, builder.length, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        builder.append(": ")
        builder.append(conversation.messages.last().content)
        inboxStyle.addLine(builder)
    }
}

fun extractTotalMessagesCount(conversations: ConversationMap): Int {
    var totalNumber = 0
    for ((_, value) in conversations) {
        totalNumber += value.messages.size
    }
    return totalNumber
}

/**
 * Formats -
 * stream message - fullName:streamName:'stream'
 * group message - fullName:Recipients:'group'
 * private message - fullName:Email:'private'
 */
private fun buildKeyString(fcmMessage: MessageFcmMessage): String {
    val recipient = fcmMessage.recipient
    return when (recipient) {
        is Recipient.Stream -> String.format("%s:stream", recipient.stream)
        is Recipient.GroupPm -> String.format("%s:group", recipient.getPmUsersString())
        is Recipient.Pm -> String.format("%s:private", fcmMessage.sender.email)
    }
}

fun extractNames(conversations: ConversationMap): ArrayList<String> {
    val namesSet = LinkedHashSet<String>()
    for (conversation in conversations.values) {
        for (fcmMessage in conversation.messages) {
            namesSet.add(fcmMessage.sender.fullName)
        }
    }
    return ArrayList(namesSet)
}

fun addConversationToMap(fcmMessage: MessageFcmMessage, conversations: ConversationMap) {
    val key = buildKeyString(fcmMessage)
    if (!conversations.contains(key)) {
        val conversation = Conversation(
            fcmMessage.zulipMessageId,
            fcmMessage.identity!!.realmId,
            mutableListOf<MessageFcmMessage>()
        )
        conversations[key] = conversation
    }
    conversations[key]!!.messages.add(fcmMessage)
}

fun removeMessagesFromMap(conversations: ConversationMap, removeFcmMessage: RemoveFcmMessage) {
    // We don't have the information to compute what key we ought to find each message under,
    // so just walk the whole thing.  If the user has >100 notifications, this linear scan
    // won't be their worst problem anyway...
    //
    // TODO redesign this whole data structure, for many reasons.
    val it = conversations.values.iterator()
    while (it.hasNext()) {
        val conversation = it.next()
        val messages = conversation.messages
        for (i in messages.indices.reversed()) {
            if (removeFcmMessage.messageIds.contains(messages[i].zulipMessageId)) {
                messages.removeAt(i)
            }
        }
        if (messages.isEmpty()) {
            it.remove()
        }
    }
}

fun clearConversations(conversations: ConversationMap) {
    conversations.clear()
}
