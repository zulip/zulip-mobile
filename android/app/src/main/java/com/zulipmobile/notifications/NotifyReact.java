package com.zulipmobile.notifications;

import android.content.Context;
import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.wix.reactnativenotifications.core.AppLaunchHelper;

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
            context.startActivity(new AppLaunchHelper().getLaunchIntent(context));
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
            context.startActivity(new AppLaunchHelper().getLaunchIntent(context));
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
}
