package com.zulipmobile.notifications;

import android.content.Context;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.zulipmobile.MainApplication;
import com.zulipmobile.notifications.NotificationHelper.ConversationMap;

public class FcmListenerService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage message) {
        final Context applicationContext = getApplicationContext();
        if (!(applicationContext instanceof MainApplication)) {
            return;
        }
        final ConversationMap conversations =
                ((MainApplication) applicationContext).getConversations();
        GCMPushNotifications.onReceived(this, conversations, message.getData());
    }
}
