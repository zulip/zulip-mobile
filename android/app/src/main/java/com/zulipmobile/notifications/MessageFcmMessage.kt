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
        val bundle: Bundle,
        val recipientType: String
) {

    /** Really "event type": one of a small fixed set of identifiers.  */
    val event: String?
        get() = bundle.getString("event")

    val content: String?
        get() = bundle.getString("content")

    val senderFullName: String?
        get() = bundle.getString("sender_full_name")

    val avatarURL: String?
        get() = bundle.getString("sender_avatar_url")

    val stream: String?
        get() = bundle.getString("stream")

    val topic: String?
        get() = bundle.getString("topic")

    val time: String?
        get() = bundle.getString("time")

    val email: String?
        get() = bundle.getString("sender_email")

    val baseURL: String?
        get() = bundle.getString("base_url")

    val pmUsers: String?
        get() = bundle.getString("pm_users")

    val isGroupMessage: Boolean
        get() = recipientType == "private" && bundle.containsKey("pm_users")

    val zulipMessageId: Int
        get() = Integer.parseInt(bundle.getString("zulip_message_id"))

    protected fun copy(): MessageFcmMessage {
        return fromBundle(bundle)
    }

    companion object {
        fun fromBundle(bundle: Bundle): MessageFcmMessage {
            return MessageFcmMessage(
                bundle = bundle.clone() as Bundle,
                recipientType = bundle.requireString("recipient_type")
            )
        }
    }
}

private fun Bundle.requireString(key: String): String {
    return getString(key) ?: throw FcmMessageParseException("missing expected field: $key")
}

class FcmMessageParseException(errorMessage: String): RuntimeException(errorMessage)
