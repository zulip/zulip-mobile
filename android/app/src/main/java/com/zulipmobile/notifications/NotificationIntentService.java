package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactApplication;

import com.zulipmobile.MainApplication;

import static android.content.Intent.ACTION_VIEW;
import static com.zulipmobile.notifications.FCMPushNotifications.ACTION_CLEAR;
import static com.zulipmobile.notifications.FCMPushNotifications.EXTRA_NOTIFICATION_DATA;

public class NotificationIntentService extends IntentService {
    public NotificationIntentService() {
        super("NotificationIntentService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        final Context applicationContext = getApplicationContext();
        if (!(applicationContext instanceof MainApplication)) {
            return;
        }
        if (ACTION_VIEW.equals(intent.getAction())) {
            final Bundle data = intent.getBundleExtra(EXTRA_NOTIFICATION_DATA);
            FCMPushNotifications.onOpened((ReactApplication) getApplication(), data);
        }
    }
}
