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
                .emit("notificationOpened", Arguments.fromBundle(data));
    }

    private static void launchMainActivity(Context context) {
        final Intent intent = new Intent(context, MainActivity.class);
        // See these sections in the Android docs:
        //   https://developer.android.com/guide/components/activities/tasks-and-back-stack#TaskLaunchModes
        //   https://developer.android.com/reference/android/content/Intent#FLAG_ACTIVITY_CLEAR_TOP
        //
        // * The flag FLAG_ACTIVITY_NEW_TASK is redundant in that it produces the
        //   same effect as setting `android:launchMode="singleTask"` on the
        //   activity, which we've done; but Context#startActivity requires it for
        //   clarity's sake, a requirement overridden in Activity#startActivity,
        //   because the behavior without it only makes sense when starting from
        //   an Activity.  Our `context` is a service, so it's required.
        //
        // * The flag FLAG_ACTIVITY_CLEAR_TOP is mentioned as being what the
        //   notification manager does; so use that.  It has no effect as long
        //   as we only have one activity; but if we add more, it will destroy
        //   all the activities on top of the target one.
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                      | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        context.startActivity(intent);
    }
}
