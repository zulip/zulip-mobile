package com.zulipmobile.notifications

import android.os.Bundle

internal class PushNotificationsProp(private val mBundle: Bundle) {

    fun asBundle(): Bundle {
        return mBundle.clone() as Bundle
    }

    protected fun copy(): PushNotificationsProp {
        return PushNotificationsProp(mBundle.clone() as Bundle)
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
