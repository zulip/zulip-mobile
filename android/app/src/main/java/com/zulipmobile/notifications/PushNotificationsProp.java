package com.zulipmobile.notifications;

import android.os.Bundle;

class PushNotificationsProp {

    private Bundle mBundle;

    PushNotificationsProp(Bundle bundle) {
        mBundle = bundle;
    }

    Bundle asBundle() { return (Bundle) mBundle.clone(); }

    /** Really "event type": one of a small fixed set of identifiers. */
    String getEvent() {
        return mBundle.getString("event");
    }

    String getRecipientType() {
        return mBundle.getString("recipient_type");
    }

    String getContent() {
        return mBundle.getString("content");
    }

    String getSenderFullName() {
        return mBundle.getString("sender_full_name");
    }

    String getAvatarURL() {
        return mBundle.getString("sender_avatar_url");

    }

    String getStream() {
        return mBundle.getString("stream");
    }

    String getTopic() {
        return mBundle.getString("topic");
    }

    String getTime() {
        return mBundle.getString("time");
    }

    protected PushNotificationsProp copy() {
        return new PushNotificationsProp((Bundle) mBundle.clone());
    }

    String getEmail() {
        return mBundle.getString("sender_email");
    }

    String getBaseURL() {
        return mBundle.getString("base_url");
    }

    String getPmUsers() {
        return mBundle.getString("pm_users");
    }

    boolean isGroupMessage() {
        return getRecipientType().equals("private") && mBundle.containsKey("pm_users");
    }

    int getZulipMessageId() {
        return Integer.parseInt(mBundle.getString("zulip_message_id"));
    }
}
