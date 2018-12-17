package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.zulipmobile.MainApplication;

import static com.zulipmobile.notifications.GCMPushNotifications.ACTION_NOTIFICATIONS_DISMISS;
import static com.zulipmobile.notifications.GCMPushNotifications.PUSH_NOTIFICATION_EXTRA_NAME;

public class NotificationIntentService extends IntentService {
    public NotificationIntentService() { super("NotificationIntentService"); }

    @Override
    protected void onHandleIntent(Intent intent) {
        final Bundle bundle = intent.getBundleExtra(PUSH_NOTIFICATION_EXTRA_NAME);
        if (bundle == null) {
            return;
        }
        if (ACTION_NOTIFICATIONS_DISMISS.equals(bundle.getString(ACTION_NOTIFICATIONS_DISMISS))) {
            final Context applicationContext = getApplicationContext();
            if (!(applicationContext instanceof MainApplication)) {
                return;
            }
            ((MainApplication) applicationContext).clearNotifications();
        }
    }
}
