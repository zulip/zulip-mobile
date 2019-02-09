package com.zulipmobile.notifications;

import android.os.Bundle;

public class PushNotificationsProp {

    private Bundle mBundle;

    public PushNotificationsProp(Bundle bundle) {
        mBundle = bundle;
    }

    Bundle asBundle() { return (Bundle) mBundle.clone(); }

    /** Really "event type": one of a small fixed set of identifiers. */
    public String getEvent() {
        return mBundle.getString("event");
    }

    public String getRecipientType() {
        return mBundle.getString("recipient_type");
    }

    public String getContent() {
        return mBundle.getString("content");
    }

    public String getSenderFullName() {
        return mBundle.getString("sender_full_name");
    }

    public String getAvatarURL() {
        return mBundle.getString("sender_avatar_url");

    }

    public String getStream() {
        return mBundle.getString("stream");
    }

    public String getTopic() {
        return mBundle.getString("topic");
    }

    public String getTime() {
        return mBundle.getString("time");
    }

    protected PushNotificationsProp copy() {
        return new PushNotificationsProp((Bundle) mBundle.clone());
    }

    public String getEmail() {
        return mBundle.getString("sender_email");
    }

    public String getBaseURL() {
        return mBundle.getString("base_url");
    }

    public String getPmUsers() {
        return mBundle.getString("pm_users");
    }

    public boolean isGroupMessage() {
        return getRecipientType().equals("private") && mBundle.containsKey("pm_users");
    }

    public int getZulipMessageId() {
        return Integer.parseInt(mBundle.getString("zulip_message_id"));
    }
}
