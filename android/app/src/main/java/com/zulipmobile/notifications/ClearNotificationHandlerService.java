package com.zulipmobile.notifications;


import android.app.IntentService;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.wix.reactnativenotifications.core.notification.IPushNotification;
import com.wix.reactnativenotifications.core.notification.PushNotification;
import com.zulipmobile.MainApplication;

import static com.zulipmobile.Constants.NOTIFICATION_ACTION_CLEAR;

import static com.zulipmobile.Constants.NOTIFICATION_CANCEL_BUNDLE_KEY;


public class ClearNotificationHandlerService extends IntentService {

    public ClearNotificationHandlerService() {
        super("clearNotificationHandler");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        if (NOTIFICATION_ACTION_CLEAR.equals(intent.getAction())) {
            clearConversations();
            return;
        }
        final Bundle notificationData = intent.getBundleExtra(NOTIFICATION_CANCEL_BUNDLE_KEY);
        final IPushNotification pushNotification = PushNotification.get(this, notificationData);
        if (pushNotification != null) {
            pushNotification.onOpened();
        }
    }

    private void clearConversations() {
        MainApplication.clearAllConversations();
        NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        nMgr.cancelAll();
    }
}
