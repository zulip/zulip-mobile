package com.zulipmobile.notifications;

import android.content.Intent;

import com.google.android.gms.iid.InstanceIDListenerService;

public class GcmInstanceRefreshService extends InstanceIDListenerService {

    @Override
    public void onTokenRefresh() {
        Intent intent = new Intent(this, GCMIdRefreshHandler.class);
        startService(intent);
    }
}
