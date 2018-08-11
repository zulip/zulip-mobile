package com.zulipmobile.notifications;


import android.app.IntentService;
import android.content.Intent;
import android.os.Bundle;

import com.wix.reactnativenotifications.core.notification.IPushNotification;
import com.wix.reactnativenotifications.core.notification.PushNotification;

import static com.zulipmobile.Constants.NOTIFICATION_CANCEL_BUNDLE_KEY;


public class ClearNotificationHandlerService extends IntentService {

    public ClearNotificationHandlerService() {
        super("clearNotificationHandler");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        final Bundle notificationData = intent.getBundleExtra(NOTIFICATION_CANCEL_BUNDLE_KEY);
        final IPushNotification pushNotification = PushNotification.get(this, notificationData);
        if (pushNotification != null) {
            pushNotification.onOpened();
        }
    }
}
