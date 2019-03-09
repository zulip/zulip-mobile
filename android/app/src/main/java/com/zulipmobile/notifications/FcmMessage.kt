package com.zulipmobile.notifications

import android.os.Bundle
import java.net.MalformedURLException
import java.net.URL
import java.util.*

/**
 * Data about the Zulip user that sent a message.
 */
internal data class Sender(
    val id: Int?,
    val email: String,
    val avatarURL: String,
    val fullName: String
)

/**
 * Data identifying where a Zulip message was sent.
 */
internal sealed class Recipient {
    /** A 1:1 private message.  Must have been sent to this user, so nothing more to say. */
    object Pm : Recipient()

    /**
     * A group PM.
     *
     * pmUsers: the user IDs of all users in the conversation, sorted,
     *     in ASCII decimal, comma-separated.
     */
    data class GroupPm(val pmUsers: String) : Recipient()

    /** A stream message. */
    data class Stream(val stream: String, val topic: String) : Recipient()
}

/**
 * Parsed version of an FCM message, of any type.
 *
 * The word "message" can be confusing in this context:
 *
 *  * FCM docs say "message" to refer to one of the blobs we receive over FCM,
 *    aka a "data notification".  One of these might correspond to zero, one,
 *    or more actual notifications we show in the UI.
 *
 *  * Around Zulip we of course say "message" all the time to mean the
 *    central item in the app model.
 *
 * In our notification code we often say "FCM message" or "Zulip message"
 * to disambiguate between these two.
 */
internal sealed class FcmMessage {
    companion object {
        fun fromFcmData(data: Map<String, String>): FcmMessage =
            when (val eventType = data["event"]) {
                "message" -> MessageFcmMessage.fromFcmData(data)
                "remove" -> RemoveFcmMessage.fromFcmData(data)
                null -> throw FcmMessageParseException("missing event type")
                else -> throw FcmMessageParseException("unknown event type: $eventType")
            }
    }
}

/**
 * Parsed version of an FCM message of type `message`.
 *
 * This corresponds to a Zulip message for which the user wants to
 * see a notification.
 *
 * The word "message" can be confusing in this context.
 * See `FcmMessage` for discussion.
 */
internal data class MessageFcmMessage(
    val sender: Sender,

    val zulipMessageId: Int,
    val recipient: Recipient,
    val content: String,
    val time: String
) : FcmMessage() {

    /**
     * All the data our React code needs on opening the notification.
     *
     * For the corresponding type definition on the JS side, see `Notification`
     * in `notification/index.js`.
     */
    fun dataForOpen(): Bundle {
        val bundle = Bundle()
        when (recipient) {
            // NOTE: Keep the JS-side type definition in sync with this code.
            is Recipient.Stream -> {
                bundle.putString("recipient_type", "stream")
                bundle.putString("stream", recipient.stream)
                bundle.putString("topic", recipient.topic)
            }
            is Recipient.GroupPm -> {
                bundle.putString("recipient_type", "private")
                bundle.putString("pm_users", recipient.pmUsers)
            }
            is Recipient.Pm -> {
                bundle.putString("recipient_type", "private")
                bundle.putString("sender_email", sender.email)
            }
        }
        return bundle
    }

    companion object {
        fun fromFcmData(data: Map<String, String>): MessageFcmMessage {
            val recipientType = data.require("recipient_type")
            val recipient = when (recipientType) {
                "stream" ->
                    Recipient.Stream(
                        data.require("stream"),
                        data.require("topic"))
                "private" ->
                    data["pm_users"]?.let {
                        Recipient.GroupPm(it)
                    } ?: Recipient.Pm
                else -> throw FcmMessageParseException("unexpected recipient_type: $recipientType")
            }

            val avatarURL = data.require("sender_avatar_url")
            try {
                URL(avatarURL)
            } catch (e: MalformedURLException) {
                throw FcmMessageParseException("invalid sender_avatar_url: $avatarURL")
            }

            return MessageFcmMessage(
                sender = Sender(
                    // sender_id was added in server version 1.8.0
                    // (released 2018-04-16; commit 1.8.0-rc1~1860).
                    id = data["sender_id"]?.let { parseInt(it, "invalid int at sender_id") },

                    email = data.require("sender_email"),
                    avatarURL = avatarURL,
                    fullName = data.require("sender_full_name")
                ),

                zulipMessageId = data.requireInt("zulip_message_id"),
                recipient = recipient,
                content = data.require("content"),
                time = data.require("time")
            )
        }
    }
}

internal data class RemoveFcmMessage(
    val messageIds: Set<Int>
) : FcmMessage() {
    companion object {
        fun fromFcmData(data: Map<String, String>): RemoveFcmMessage {
            val messageIds = HashSet<Int>()
            data["zulip_message_id"]?.let {
                messageIds.add(parseInt(it, "malformed message ID"))
            }
            for (idStr in data["zulip_message_ids"]?.split(",") ?: emptyList()) {
                messageIds.add(parseInt(idStr, "malformed message ID"))
            }
            return RemoveFcmMessage(messageIds)
        }
    }
}

private fun Map<String, String>.require(key: String): String =
    this[key] ?: throw FcmMessageParseException("missing expected field: $key")

private fun Map<String, String>.requireInt(key: String): Int =
    parseInt(require(key), "invalid format where int expected, at $key")

private fun parseInt(s: String, msg: String): Int = try {
    Integer.parseInt(s)
} catch (e: NumberFormatException) {
    throw FcmMessageParseException("$msg: $s")
}

class FcmMessageParseException(errorMessage: String) : RuntimeException(errorMessage)
