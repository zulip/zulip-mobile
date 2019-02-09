package com.zulipmobile.notifications;

import com.facebook.react.ReactApplication;
import com.google.firebase.iid.FirebaseInstanceIdService;

public class InstanceIDListenerService extends FirebaseInstanceIdService {
    /**
     * Called by the Firebase framework when the InstanceID token is updated.
     *
     * Mainly this means on first registration, but the framework
     * might choose to rotate the token later.
     */
    @Override
    public void onTokenRefresh() {
        NotificationsModule.emitToken((ReactApplication) getApplication());
    }
}
