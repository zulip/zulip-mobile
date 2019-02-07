package com.zulipmobile.notifications;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.zulipmobile.MainActivity;

import static com.zulipmobile.notifications.NotificationHelper.TAG;

/**
 * Methods for telling React about a notification.
 *
 * This logic is largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */
class NotifyReact {

    static void notifyReact(Context context, final Bundle data) {
        NotificationsModule.initialNotification = data;

        if (!emitIfResumed("notificationOpened", Arguments.fromBundle(data))) {
            // The app will check initialNotification on launch.
            Log.d(TAG, "notifyReact: launching main activity");
            launchMainActivity(context);
        }
    }

    private static boolean emitIfResumed(final String eventName, final @Nullable Object data) {
        final ReactContext reactContext = NotificationsModule.reactContext;
        if (reactContext == null
                || !reactContext.hasActiveCatalystInstance()
                || reactContext.getLifecycleState() != LifecycleState.RESUMED) {
            return false;
        }
        emit(reactContext, eventName, data);
        return true;
    }

    private static void emit(@NonNull ReactContext reactContext, String eventName, @Nullable Object data) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
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
