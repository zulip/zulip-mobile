package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.zulipmobile.MainApplication;

import static com.zulipmobile.notifications.GCMPushNotifications.ACTION_CLEAR;
import static com.zulipmobile.notifications.GCMPushNotifications.PUSH_NOTIFICATION_EXTRA_NAME;

public class NotificationIntentService extends IntentService {
    public NotificationIntentService() { super("NotificationIntentService"); }

    @Override
    protected void onHandleIntent(Intent intent) {
        if (ACTION_CLEAR.equals(intent.getAction())) {
            final Context applicationContext = getApplicationContext();
            if (!(applicationContext instanceof MainApplication)) {
                return;
            }
            ((MainApplication) applicationContext).clearNotifications();
        }
    }
}
