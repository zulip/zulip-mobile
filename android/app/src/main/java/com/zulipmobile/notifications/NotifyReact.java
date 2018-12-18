package com.zulipmobile.notifications;

import android.content.Context;
import android.os.Bundle;
import com.wix.reactnativenotifications.core.*;

import static com.wix.reactnativenotifications.Defs.NOTIFICATION_OPENED_EVENT_NAME;

/**
 * Methods for telling React about a notification.
 *
 * This logic is largely inherited from the wix library.
 * TODO: Replace this with a fresh implementation based on RN upstream docs.
 */
class NotifyReact {
    static void notifyReact(Context context, final Bundle data) {
        InitialNotificationHolder.getInstance().set(new PushNotificationsProp(data));
        final AppLifecycleFacade lifecycleFacade = AppLifecycleFacadeHolder.get();
        if (!lifecycleFacade.isReactInitialized()) {
            context.startActivity(new AppLaunchHelper().getLaunchIntent(context));
            return;
        }
        if (lifecycleFacade.isAppVisible()) {
            notifyReactNow(data);
        } else {
            lifecycleFacade.addVisibilityListener(new AppLifecycleFacade.AppVisibilityListener() {
                @Override public void onAppNotVisible() {}
                @Override public void onAppVisible() {
                    lifecycleFacade.removeVisibilityListener(this);
                    notifyReactNow(data);
                }
            });
            context.startActivity(new AppLaunchHelper().getLaunchIntent(context));
        }
    }

    private static void notifyReactNow(Bundle data) {
        new JsIOHelper().sendEventToJS(
                NOTIFICATION_OPENED_EVENT_NAME,
                data,
                AppLifecycleFacadeHolder.get().getRunningReactContext());
    }
}
