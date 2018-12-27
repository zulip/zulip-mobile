package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.bridge.*;

public class NotificationsModule extends ReactContextBaseJavaModule {

    static Bundle initialNotification = null;

    NotificationsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Notifications";
    }

    @Override
    public void initialize() {
        final Context context = getReactApplicationContext().getApplicationContext();
        context.startService(new Intent(context, RegistrationIntentService.class));
    }

    @ReactMethod
    public void getInitialNotification(Promise promise) {
        if (null == initialNotification) {
            promise.resolve(null);
        } else {
            promise.resolve(Arguments.fromBundle(initialNotification));
        }
    }
}
