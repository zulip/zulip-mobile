package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.zulipmobile.MainApplication;
import com.zulipmobile.notifications.NotificationHelper.ConversationMap;

import static android.content.Intent.ACTION_VIEW;
import static com.zulipmobile.notifications.GCMPushNotifications.ACTION_CLEAR;
import static com.zulipmobile.notifications.GCMPushNotifications.PUSH_NOTIFICATION_EXTRA_NAME;

public class NotificationIntentService extends IntentService {
    public NotificationIntentService() { super("NotificationIntentService"); }

    @Override
    protected void onHandleIntent(Intent intent) {
        final Context applicationContext = getApplicationContext();
        if (!(applicationContext instanceof MainApplication)) {
            return;
        }
        final ConversationMap conversations =
                ((MainApplication) applicationContext).getConversations();
        if (ACTION_VIEW.equals(intent.getAction())) {
            final Bundle data = intent.getBundleExtra(PUSH_NOTIFICATION_EXTRA_NAME);
            GCMPushNotifications.onOpened(this, conversations, data);
        } else if (ACTION_CLEAR.equals(intent.getAction())) {
            GCMPushNotifications.onClear(this, conversations);
        }
    }
}
