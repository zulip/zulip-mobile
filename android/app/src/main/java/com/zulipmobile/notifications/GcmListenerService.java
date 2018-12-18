package com.zulipmobile.notifications;

import android.content.Context;
import android.os.Bundle;
import com.zulipmobile.MainApplication;

public class GcmListenerService extends com.google.android.gms.gcm.GcmListenerService {
    @Override
    public void onMessageReceived(String from, Bundle data) {
        // `from` is used when the notification goes to a GCM "topic";
        // we don't do that, so we get to ignore it.
        final Context applicationContext = getApplicationContext();
        if (!(applicationContext instanceof MainApplication)) {
            return;
        }
        final GCMPushNotifications wixNotificationObject =
                new GCMPushNotifications((MainApplication)applicationContext, data);
        wixNotificationObject.onReceived();
    }
}
