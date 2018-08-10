package com.zulipmobile.notifications;

import android.os.Bundle;

import com.wix.reactnativenotifications.core.notification.PushNotificationProps;

import java.util.Arrays;

public class PushNotificationsProp extends PushNotificationProps {

    public PushNotificationsProp(Bundle bundle) {
        super(bundle);
    }

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

    @Override
    protected PushNotificationsProp copy() {
        return new PushNotificationsProp((Bundle) mBundle.clone());
    }

    public String getEmail() {
        return mBundle.getString("sender_email");
    }

    public String getBaseURL() {
        return mBundle.getString("base_url");
    }

    public int[] getPmUsers() {
        if (mBundle.containsKey("pm_users")){
            return mBundle.getIntArray("pm_users");
        }
        return null;
    }

    public boolean isGroupMessage() {
        return getRecipientType().equals("private") && mBundle.containsKey("pm_users");
    }
    public String getGroupRecipientString() {
        return Arrays.toString(getPmUsers());
    }

    public int getZulipMessageId() {
        return Integer.parseInt(mBundle.getString("zulip_message_id"));
    }
}
