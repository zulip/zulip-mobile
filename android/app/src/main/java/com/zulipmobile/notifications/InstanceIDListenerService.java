package com.zulipmobile.notifications;

import android.content.Intent;

public class InstanceIDListenerService extends com.google.android.gms.iid.InstanceIDListenerService {
    /**
     * Called by the GCM framework if for some reason the token changes.
     *
     * Compare upstream example code:
     *   https://github.com/googlesamples/google-services/blob/3e2518f6d/android/gcm/app/src/main/java/gcm/play/android/samples/com/gcmquickstart/MyInstanceIDListenerService.java
     */
    @Override
    public void onTokenRefresh() {
        startService(new Intent(this, RegistrationIntentService.class));
    }
}
