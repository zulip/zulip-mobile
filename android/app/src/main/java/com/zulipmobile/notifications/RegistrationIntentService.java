package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Intent;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;
import com.zulipmobile.R;

import java.io.IOException;

import static com.zulipmobile.notifications.NotificationHelper.TAG;

public class RegistrationIntentService extends IntentService {
    public RegistrationIntentService() {
        super("RegistrationIntentService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        InstanceID instanceID = InstanceID.getInstance(this);
        String token;
        try {
            token = instanceID.getToken(getString(R.string.gcm_default_sender_id),
                                        GoogleCloudMessaging.INSTANCE_ID_SCOPE);
        } catch (IOException e) {
            Log.w(TAG, "Failed to get token", e);
            return;
        }

        final ReactContext reactContext =
                ((ReactApplication) getApplication())
                        .getReactNativeHost()
                        .getReactInstanceManager()
                        .getCurrentReactContext();
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            // If so, the next time the app is launched, this service will be invoked again
            // by our NotificationsModule#initialize, by which point there certainly is
            // a React context; so we'll learn the new token then.
            Log.w(TAG, "Got token before React context initialized");
            return;
        }
        Log.i(TAG, "Got token; emitting event");
        NotifyReact.emit(reactContext, "remoteNotificationsRegistered", token);
    }
}
