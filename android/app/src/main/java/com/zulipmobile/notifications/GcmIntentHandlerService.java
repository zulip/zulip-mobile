package com.zulipmobile.notifications;


import android.app.IntentService;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactApplication;
import com.zulipmobile.MainActivity;
import com.zulipmobile.MainApplication;

import static com.zulipmobile.Constants.NOTIFICATION_ACTION_CLEAR;
import static com.zulipmobile.Constants.NOTIFICATION_INTENT_BUNDLE_KEY;


public class GcmIntentHandlerService extends IntentService {

    public GcmIntentHandlerService() {
        super("gcmIntentHandlerService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        if (NOTIFICATION_ACTION_CLEAR.equals(intent.getAction())) {
            clearConversations();
            return;
        }
        final Bundle notificationData = intent.getBundleExtra(NOTIFICATION_INTENT_BUNDLE_KEY);

        if (!((ReactApplication) getApplicationContext()).getReactNativeHost().hasInstance()) {
            // If the React context is null that shows the app is in dead or killed state currently
            // Therefore save the notification in the MainApplication and use the javascript to
            // fetch this notification
            MainApplication.saveOpenedNotification(notificationData);
        }

        // Launch the app
        final Intent newIntent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        getApplicationContext().startActivity(newIntent);
    }

    private void clearConversations() {
        MainApplication.clearAllConversations();
        NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        nMgr.cancelAll();
    }
}
