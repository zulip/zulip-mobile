package com.zulipmobile.notifications

import android.os.Bundle
import java.net.MalformedURLException
import java.net.URL
import java.util.HashSet

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
internal sealed class FcmMessage {}

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
        val email: String,
        val senderFullName: String,
        val avatarURL: String,

        val zulipMessageId: Int,
        val recipient: Recipient,
        val content: String,
        val time: String,

        val bundle: Bundle
) : FcmMessage() {
    companion object {
        fun fromBundle(bundle: Bundle): MessageFcmMessage {
            val recipientType = bundle.requireString("recipient_type")
            val recipient = when (recipientType) {
                "stream" ->
                    Recipient.Stream(
                            bundle.requireString("stream"),
                            bundle.requireString("topic"))
                "private" ->
                    bundle.getString("pm_users")?.let {
                        Recipient.GroupPm(it)
                    } ?: Recipient.Pm
                else -> throw FcmMessageParseException("unexpected recipient_type: $recipientType")
            }

            val avatarURL = bundle.requireString("sender_avatar_url")
            try {
                URL(avatarURL)
            } catch (e: MalformedURLException) {
                throw FcmMessageParseException("invalid sender_avatar_url: $avatarURL")
            }

            return MessageFcmMessage(
                email = bundle.requireString("sender_email"),
                senderFullName = bundle.requireString("sender_full_name"),
                avatarURL = avatarURL,

                zulipMessageId = bundle.requireIntString("zulip_message_id"),
                recipient = recipient,
                content = bundle.requireString("content"),
                time = bundle.requireString("time"),

                bundle = bundle.clone() as Bundle
            )
        }
    }
}

internal data class RemoveFcmMessage(
        val messageIds: Set<Int>
) : FcmMessage() {
    companion object {
        fun fromFcmData(data: Map<String, String>): RemoveFcmMessage {
            return RemoveFcmMessage(parseMessageIds(data))
        }

        private fun parseMessageIdInto(messageIds: MutableSet<Int>, idStr: String) {
            try {
                messageIds.add(Integer.parseInt(idStr))
            } catch (e: NumberFormatException) {
                throw FcmMessageParseException("malformed message ID: $idStr")
            }
        }

        private fun parseMessageIds(mapData: Map<String, String>): Set<Int> {
            val messageIds = HashSet<Int>()
            val idStr = mapData["zulip_message_id"]
            if (idStr != null) {
                parseMessageIdInto(messageIds, idStr)
            }
            val idsStr = mapData["zulip_message_ids"]
            if (idsStr != null) {
                val idStrs = idsStr.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                for (idStr1 in idStrs) {
                    parseMessageIdInto(messageIds, idStr1)
                }
            }
            return messageIds
        }
    }
}

private fun Bundle.requireString(key: String): String {
    return getString(key) ?: throw FcmMessageParseException("missing expected field: $key")
}

private fun Bundle.requireIntString(key: String): Int {
    val s = requireString(key);
    return try {
        Integer.parseInt(s)
    } catch (e: NumberFormatException) {
        throw FcmMessageParseException("invalid format where int expected: $key -> $s")
    }
}

class FcmMessageParseException(errorMessage: String): RuntimeException(errorMessage)
