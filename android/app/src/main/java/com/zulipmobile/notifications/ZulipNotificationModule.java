package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;


import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.zulipmobile.MainApplication;

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

    @ReactMethod
    public void getInitialNotification(Promise promise) {
        Object result = null;
        try {
            final Bundle notification = MainApplication.getIntialNotification();
            if (notification == null) {
                return;
            }
            notification.keySet();
            result = Arguments.fromBundle(notification);
        } finally {
            promise.resolve(result);
        }
    }
}