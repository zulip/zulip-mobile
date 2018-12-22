package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.zulipmobile.MainActivity;

import static com.wix.reactnativenotifications.Defs.NOTIFICATION_OPENED_EVENT_NAME;

/**
 * Methods for telling React about a notification.
 *
 * This logic is largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */
class NotifyReact {

    static void notifyReact(Context context, final Bundle data) {
        NotificationsModule.initialNotification = data;

        final ReactContext reactContext = NotificationsModule.reactContext;
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            launchMainActivity(context);
            return;
        }
        if (reactContext.getLifecycleState() == LifecycleState.RESUMED) {
            notifyReactNow(data);
        } else {
            reactContext.addLifecycleEventListener(new LifecycleEventListener() {
                @Override public void onHostPause() {}
                @Override public void onHostDestroy() {}
                @Override public void onHostResume() {
                    reactContext.removeLifecycleEventListener(this);
                    notifyReactNow(data);
                }
            });
            launchMainActivity(context);
        }
    }

    private static void notifyReactNow(Bundle data) {
        final ReactContext reactContext = NotificationsModule.reactContext;
        if (reactContext == null) {
            return;
        }
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(NOTIFICATION_OPENED_EVENT_NAME,
                      Arguments.fromBundle(data));
    }

    private static void launchMainActivity(Context context) {
        final Intent intent = new Intent(context, MainActivity.class);
        // TODO flags inherited from wix; consult Android docs, determine what we want
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        context.startActivity(intent);
    }
}
