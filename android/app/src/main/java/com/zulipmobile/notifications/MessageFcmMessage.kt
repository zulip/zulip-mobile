package com.zulipmobile.notifications

import android.os.Bundle


/**
 * Parsed version of an FCM message of type `message`.
 *
 * This corresponds to a Zulip message for which the user wants to
 * see a notification.
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
internal class MessageFcmMessage private constructor(
        val email: String,
        val senderFullName: String,
        val avatarURL: String,

        val recipientType: String,
        val isGroupMessage: Boolean,
        val stream: String?,
        val topic: String?,
        val pmUsers: String?,

        val zulipMessageId: Int,
        val content: String,
        val time: String,

        val bundle: Bundle
) {

    /** Really "event type": one of a small fixed set of identifiers.  */
    val event: String?
        get() = bundle.getString("event")

    val baseURL: String?
        get() = bundle.getString("base_url")

    protected fun copy(): MessageFcmMessage {
        return fromBundle(bundle)
    }

    companion object {
        fun fromBundle(bundle: Bundle): MessageFcmMessage {
            val recipientType = bundle.requireString("recipient_type")
            when (recipientType) {
                "stream" -> {
                    bundle.requireString("stream")
                    bundle.requireString("topic")
                }
                "private" -> {
                    // "pm_users" optional -- present just for group PMs
                }
                else -> throw FcmMessageParseException("unexpected recipient_type: $recipientType")
            }

            return MessageFcmMessage(
                email = bundle.requireString("sender_email"),
                senderFullName = bundle.requireString("sender_full_name"),
                avatarURL = bundle.requireString("sender_avatar_url"),

                recipientType = recipientType,
                isGroupMessage = recipientType == "private" && bundle.getString("pm_users") != null,
                stream = bundle.getString("stream"),
                topic = bundle.getString("topic"),
                pmUsers = bundle.getString("pm_users"),

                zulipMessageId = bundle.requireIntString("zulip_message_id"),
                content = bundle.requireString("content"),
                time = bundle.requireString("time"),

                bundle = bundle.clone() as Bundle
            )
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
