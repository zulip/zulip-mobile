package com.zulipmobile.notifications;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
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
        final ReactContext reactContext =
                ((ReactApplication) getApplication())
                .getReactNativeHost()
                .getReactInstanceManager()
                .getCurrentReactContext();
        NotificationsModule.emitToken(reactContext);
    }
}
