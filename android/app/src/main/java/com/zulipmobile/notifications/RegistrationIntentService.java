package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Intent;
import android.util.Log;
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
        String token = null;
        try {
            token = instanceID.getToken(getString(R.string.gcm_default_sender_id),
                                        GoogleCloudMessaging.INSTANCE_ID_SCOPE);
        } catch (IOException e) {
            Log.w(TAG, "Failed to get token", e);
            return;
        }

        // TODO send to JS (thence to storage and server)

    }
}
