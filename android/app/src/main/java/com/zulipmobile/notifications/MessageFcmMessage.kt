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
internal class MessageFcmMessage(private val mBundle: Bundle) {

    fun asBundle(): Bundle {
        return mBundle.clone() as Bundle
    }

    protected fun copy(): MessageFcmMessage {
        return MessageFcmMessage(mBundle.clone() as Bundle)
    }

    /** Really "event type": one of a small fixed set of identifiers.  */
    val event: String?
        get() = mBundle.getString("event")

    val recipientType: String?
        get() = mBundle.getString("recipient_type")

    val content: String?
        get() = mBundle.getString("content")

    val senderFullName: String?
        get() = mBundle.getString("sender_full_name")

    val avatarURL: String?
        get() = mBundle.getString("sender_avatar_url")

    val stream: String?
        get() = mBundle.getString("stream")

    val topic: String?
        get() = mBundle.getString("topic")

    val time: String?
        get() = mBundle.getString("time")

    val email: String?
        get() = mBundle.getString("sender_email")

    val baseURL: String?
        get() = mBundle.getString("base_url")

    val pmUsers: String?
        get() = mBundle.getString("pm_users")

    val isGroupMessage: Boolean
        get() = recipientType == "private" && mBundle.containsKey("pm_users")

    val zulipMessageId: Int
        get() = Integer.parseInt(mBundle.getString("zulip_message_id"))
}
