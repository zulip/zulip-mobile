package com.zulipmobile.notifications

import android.os.Bundle
import java.net.MalformedURLException
import java.net.URL
import java.util.*

/**
 * An identity belonging to this user in some Zulip org/realm.
 */
data class Identity(
    /// The server's `EXTERNAL_HOST` setting.  This is a hostname,
    /// or a colon-separated hostname-plus-port.  For documentation,
    /// see zulip-server:zproject/prod_settings_template.py .
    val serverHost: String,

    /// The realm's ID within the server.
    val realmId: Int,

    /// The realm's own URL/URI.  This is a real, absolute URL which is
    /// the base for all URLs a client uses with this realm.  It corresponds
    /// to `realm_uri` in the `server_settings` API response:
    ///   https://zulipchat.com/api/server-settings
    val realmUri: URL?,

    /// This user's ID within the server.  Useful mainly in the case where
    /// the user has multiple accounts in the same org.
    val userId: Int?
)

/**
 * Data about the Zulip user that sent a message.
 */
data class Sender(
    val id: Int?,
    val email: String,
    val avatarURL: URL,
    val fullName: String
)

/**
 * Data identifying where a Zulip message was sent.
 */
sealed class Recipient {
    /** A 1:1 private message.  Must have been sent to this user, so nothing more to say. */
    object Pm : Recipient()

    /**
     * A group PM.
     *
     * pmUsers: the user IDs of all users in the conversation.
     */
    data class GroupPm(val pmUsers: Set<Int>) : Recipient() {
        fun getPmUsersString() = pmUsers.sorted().joinToString { toString() }
    }

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
sealed class FcmMessage {
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
data class MessageFcmMessage(
    val identity: Identity?,
    val sender: Sender,
    val zulipMessageId: Int,
    val recipient: Recipient,
    val content: String,
    val timeMs: Long
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
                bundle.putString("pm_users", recipient.getPmUsersString())
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
                    data["pm_users"]?.parseCommaSeparatedInts("pm_users")?.let {
                        Recipient.GroupPm(it.toSet())
                    } ?: Recipient.Pm
                else -> throw FcmMessageParseException("unexpected recipient_type: $recipientType")
            }

            val avatarURL = data.require("sender_avatar_url").parseUrl("sender_avatar_url")

            return MessageFcmMessage(
                identity = extractIdentity(data),
                sender = Sender(
                    // sender_id was added in server version 1.8.0
                    // (released 2018-04-16; commit 014900c2e).
                    id = data["sender_id"]?.parseInt("sender_id"),

                    email = data.require("sender_email"),
                    avatarURL = avatarURL,
                    fullName = data.require("sender_full_name")
                ),

                zulipMessageId = data.require("zulip_message_id").parseInt("zulip_message_id"),
                recipient = recipient,
                content = data.require("content"),
                timeMs = data.require("time").parseLong("time") * 1000
            )
        }
    }
}

data class RemoveFcmMessage(
    val identity: Identity,
    val messageIds: Set<Int>
) : FcmMessage() {
    companion object {
        fun fromFcmData(data: Map<String, String>): RemoveFcmMessage {
            val messageIds = HashSet<Int>()
            data["zulip_message_id"]?.parseInt("zulip_message_id")?.let {
                messageIds.add(it)
            }
            data["zulip_message_ids"]?.parseCommaSeparatedInts("zulip_message_ids")?.let {
                messageIds.addAll(it)
            }

            return RemoveFcmMessage(
                // When the server first started sending `remove` messages at all
                // (commit bc43eefbf, released in 1.9.0), it already included
                // `server`, `realm_id`, and `realm_uri`.  So we can insist on an
                // Identity here in the "crunchy shell", and reduce null-checks in
                // the "soft center".
                identity = extractIdentity(data)
                    ?: throw FcmMessageParseException("missing expected field: server"),

                messageIds = messageIds
            )
        }
    }
}

private fun extractIdentity(data: Map<String, String>): Identity? =
    data["server"]?.let { serverHost ->
        Identity(
            // `server` was added in server version 1.8.0
            // (released 2018-04-16; commit 014900c2e).
            serverHost = serverHost,

            // `realm_id` was added in the same commit as `server`.
            realmId = data.require("realm_id").parseInt("realm_id"),

            // `realm_uri` was added in server version 1.9.0
            // (released 2018-11-06; commit 5f8d193bb).
            realmUri = data["realm_uri"]?.parseUrl("realm_uri"),

            // Server versions from 1.6.0 through 2.0.0 (and possibly earlier
            // and later) send the user's email address, as `user`.  We *could*
            // use this as a substitute for `user_id` when that's missing...
            // but it'd be inherently buggy, and the bug it'd introduce seems
            // likely to affect more users than the bug it'd fix.  So just ignore.
            // (data["user"] ignored)

            // As of 2019-03 (with 2.0.0 the latest release), the server
            // is expected to start sending this soon.  See zulip/zulip#11961 .
            userId = data["user_id"]?.parseInt("user_id")
        )
    }

private fun Map<String, String>.require(key: String): String =
    this[key] ?: throw FcmMessageParseException("missing expected field: $key")

private fun String.parseInt(loc: String): Int = try {
    Integer.parseInt(this)
} catch (e: NumberFormatException) {
    throw FcmMessageParseException("invalid int at $loc: $this")
}

private fun String.parseLong(loc: String): Long = try {
    toLong()
} catch (e: NumberFormatException) {
    throw FcmMessageParseException("invalid long at $loc: $this")
}

private fun String.parseUrl(loc: String): URL = try {
    URL(this)
} catch (e: MalformedURLException) {
    throw FcmMessageParseException("invalid URL at $loc: $this")
}

private fun String.parseCommaSeparatedInts(loc: String): Sequence<Int> =
    splitToSequence(",").map { it.parseInt(loc) }

class FcmMessageParseException(errorMessage: String) : RuntimeException(errorMessage)
