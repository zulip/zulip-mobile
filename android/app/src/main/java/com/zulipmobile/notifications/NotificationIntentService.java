package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactApplication;
import java.net.MalformedURLException;
import java.net.URL;

import com.zulipmobile.MainApplication;

import static android.content.Intent.ACTION_VIEW;
import static com.zulipmobile.notifications.FCMPushNotifications.ACTION_CLEAR;
import static com.zulipmobile.notifications.FCMPushNotifications.EXTRA_NOTIFICATION_DATA;

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
        final Bundle data = intent.getBundleExtra(EXTRA_NOTIFICATION_DATA);

        try {
            Identity identity = new Identity(
                    data.getString("server_host", null),
                    data.getInt("realm_id"),
                    new URL(data.getString("realm_url")),
                    data.getInt("user_id")
            );
            if (ACTION_VIEW.equals(intent.getAction())) {
                FCMPushNotifications.onOpened((ReactApplication) getApplication(), conversations, data, identity);
            } else if (ACTION_CLEAR.equals(intent.getAction())) {
                FCMPushNotifications.onClear(this, conversations, identity);
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

    }
}
