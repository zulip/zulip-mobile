package com.zulipmobile.notifications;

import android.os.Bundle;

import com.wix.reactnativenotifications.core.notification.PushNotificationProps;

public class PushNotificationsProp extends PushNotificationProps {

    public PushNotificationsProp(Bundle bundle) {
        super(bundle);
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
}
