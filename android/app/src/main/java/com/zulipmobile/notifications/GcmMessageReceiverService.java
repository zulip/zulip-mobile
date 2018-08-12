package com.zulipmobile.notifications;


import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;
import com.wix.reactnativenotifications.core.notification.IPushNotification;
import com.wix.reactnativenotifications.core.notification.PushNotification;

public class GcmMessageReceiverService extends GcmListenerService {

    private static final String TAG = GcmMessageReceiverService.class.getSimpleName();

    @Override
    public void onMessageReceived(String s, Bundle bundle) {
        Log.d(TAG, "New message from GCM: " + bundle);

        try {
            final IPushNotification notification = PushNotification.get(getApplicationContext(), bundle);
            notification.onReceived();
        } catch (IPushNotification.InvalidNotificationException e) {
            Log.v(TAG, "GCM message handling aborted", e);
        } catch (NullPointerException npe) {

        }
    }
}
