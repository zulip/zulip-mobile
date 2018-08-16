package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static com.zulipmobile.Constants.NOTIFICATION_ID_REFRESH;

public class ZulipNotificationModule extends ReactContextBaseJavaModule {

    public ZulipNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ZulipNotificationModule";
    }

    @ReactMethod
    public void refreshToken() {
        final Context appContext = getReactApplicationContext().getApplicationContext();
        final Intent tokenFetchIntent = new Intent(appContext, GCMIdRefreshHandler.class);
        tokenFetchIntent.putExtra(NOTIFICATION_ID_REFRESH, true);
        appContext.startService(tokenFetchIntent);
    }
}