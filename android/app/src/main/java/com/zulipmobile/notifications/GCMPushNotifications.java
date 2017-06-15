package com.zulipmobile.notifications;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;

import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.PushNotification;
import com.zulipmobile.R;

import java.io.IOException;
import java.net.URL;

public class GCMPushNotifications extends PushNotification {

    private static final int NOTIFICATION_ID = 1;

    public GCMPushNotifications(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper jsIoHelper) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, jsIoHelper);
    }

    @Override
    protected PushNotificationsProp createProps(Bundle bundle) {
        return new PushNotificationsProp(bundle);
    }

    protected PushNotificationsProp getProps() {
        return (PushNotificationsProp) mNotificationProps;
    }

    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        // First, get a builder initialized with defaults from the core class.
        final Notification.Builder builder = super.getNotificationBuilder(intent);

        String type = getProps().getRecipientType();
        String content = getProps().getContent();
        String title = getProps().getSenderFullName();
        String avatarURL = getProps().getAvatarURL();
        String time = getProps().getTime();
        String stream = getProps().getStream();
        String topic = getProps().getTopic();
        String baseURL = getProps().getBaseURL();

        builder.setSmallIcon(R.drawable.zulip_notification);
        builder.setContentTitle(title);
        builder.setAutoCancel(true);
        builder.setContentText(content);

        if (type.equals("stream")) {
            if (android.os.Build.VERSION.SDK_INT >= 16) {
                String displayTopic = stream + " > "
                        + topic;
                builder.setSubText("Mention on " + displayTopic);
            }
        }
        if (avatarURL != null && avatarURL.startsWith("http")) {
            Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(mContext,
                    avatarURL, 64, baseURL));
            if (avatar != null) {
                builder.setLargeIcon(avatar);
            }
        }
        if (time != null) {
            long timStamp = Long.parseLong(getProps().getTime()) * 1000;
            builder.setWhen(timStamp);
        }

        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);
        return builder;
    }

    private Bitmap fetchAvatar(URL url) {
        try {
            return NotificationHelper.fetch(url);
        } catch (IOException e) {
            Log.e("ERROR", e.toString());
        }
        return null;
    }

    @Override
    protected int createNotificationId(Notification notification) {
        return NOTIFICATION_ID;
    }
}
