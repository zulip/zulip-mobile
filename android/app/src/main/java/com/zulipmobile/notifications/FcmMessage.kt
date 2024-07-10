package com.zulipmobile.notifications

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
    ///   https://zulip.com/api/get-server-settings
    val realmUri: URL,

    /// This user's ID within the server.  Useful mainly in the case where
    /// the user has multiple accounts in the same org.
    val userId: Int,
)

/**
 * Data about the Zulip user that sent a message.
 */
data class Sender(
    val id: Int,
    val email: String,
    val avatarURL: URL,
    val fullName: String,
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
        fun getPmUsersString() = pmUsers.sorted().joinToString(separator = ",") { it.toString() }
    }

    /** A stream message. */
    // TODO(server-5.0): Require the stream ID (#3918).
    data class Stream(val streamId: Int?, val streamName: String, val topic: String) : Recipient()
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

                // The latter, longer name is deprecated:
                //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.2323997.20Endpoint.20for.20test.20notification/near/1690777
                "test", "test-by-device-token" -> TestFcmMessage.fromFcmData(data)

                null -> throw FcmMessageParseException("missing event type")
                else -> throw FcmMessageParseException("unknown event type: $eventType")
            }
    }
}

// This exists mainly to give a properly-typed wrapper around ArrayList#toArray.
inline fun <reified T> buildArray(block: (ArrayList<T>) -> Unit): Array<T> {
    val result = arrayListOf<T>()
    block(result)
    return result.toArray(arrayOf<T>())
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
    val identity: Identity,
    val sender: Sender,
    val zulipMessageId: Int,
    val recipient: Recipient,
    val content: String,
    val timeMs: Long,
) : FcmMessage() {

    /**
     * All the data our React code needs on opening the notification.
     *
     * For the corresponding type definition on the JS side, see `Notification`
     * in `src/notification/types.js`.
     */
    fun dataForOpen(): Array<Pair<String, Any?>> =
        // NOTE: Keep the JS-side type definition in sync with this code.
        buildArray { list ->
            list.add("realm_uri" to identity.realmUri.toString())
            list.add("user_id" to identity.userId)
            when (recipient) {
                is Recipient.Stream -> {
                    list.add("recipient_type" to "stream")
                    recipient.streamId?.let { list.add("stream_id" to it) }
                    list.add("stream_name" to recipient.streamName)
                    list.add("topic" to recipient.topic)
                }
                is Recipient.GroupPm -> {
                    list.add("recipient_type" to "private")
                    list.add("pm_users" to recipient.getPmUsersString())
                }
                is Recipient.Pm -> {
                    list.add("recipient_type" to "private")
                    list.add("sender_email" to sender.email)
                }
            }
        }

    companion object {
        fun fromFcmData(data: Map<String, String>): MessageFcmMessage {
            val recipientType = data.require("recipient_type")
            val recipient = when (recipientType) {
                "stream" ->
                    Recipient.Stream(
                        data["stream_id"]?.parseInt("stream_id"),
                        data.require("stream"),
                        data.require("topic")
                    )
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
                    id = data.require("sender_id").parseInt("sender_id"),
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
    val messageIds: Set<Int>,
) : FcmMessage() {
    companion object {
        fun fromFcmData(data: Map<String, String>): RemoveFcmMessage {
            val messageIds = HashSet<Int>()
            data["zulip_message_ids"]?.parseCommaSeparatedInts("zulip_message_ids")?.let {
                messageIds.addAll(it)
            }

            return RemoveFcmMessage(
                identity = extractIdentity(data),
                messageIds = messageIds
            )
        }
    }
}

data class TestFcmMessage(
    val identity: Identity,

    // Hopefully to be added before 8.0 release; discussion:
    //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.2323997.20Endpoint.20for.20test.20notification/near/1691552
    val realmName: String?,
) : FcmMessage() {
    companion object {
        fun fromFcmData(data: Map<String, String>): TestFcmMessage {
            return TestFcmMessage(
                identity = extractIdentity(data),
                realmName = data["realm_name"],
            )
        }
    }
}

private fun extractIdentity(data: Map<String, String>): Identity =
    Identity(
        serverHost = data.require("server"),
        realmId = data.require("realm_id").parseInt("realm_id"),

        // `realm_uri` was added in server version 1.9.0
        realmUri = data.require("realm_uri").parseUrl("realm_uri"),

        // `user_id` was added in server version 2.1.0.
        userId = data.require("user_id").parseInt("user_id")
    )

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
