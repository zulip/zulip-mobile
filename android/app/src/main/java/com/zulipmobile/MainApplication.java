package com.zulipmobile;

import android.app.Application;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;

import android.util.Log;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.react.ReactApplication;
import com.nikolaiwarner.RNTextInputReset.RNTextInputResetPackage;
import com.wix.reactnativenotifications.RNNotificationsPackage;
import com.imagepicker.ImagePickerPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnative.photoview.PhotoViewPackage;
import com.remobile.toast.RCTToastPackage;
import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.INotificationsApplication;
import com.wix.reactnativenotifications.core.notification.IPushNotification;
import com.zmxv.RNSound.RNSoundPackage;
import com.zulipmobile.notifications.GCMPushNotifications;
import com.zulipmobile.notifications.MessageInfo;
import com.zulipmobile.RNSecureRandom;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;

import io.sentry.RNSentryPackage;

import static com.zulipmobile.notifications.GCMPushNotifications.ACTION_NOTIFICATIONS_DISMISS;
import static com.zulipmobile.notifications.NotificationHelper.clearConversations;
import com.zulipmobile.notifications.NotificationHelper;

public class MainApplication extends Application implements ReactApplication, INotificationsApplication {
    private LinkedHashMap<String, List<MessageInfo>> conversations;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNTextInputResetPackage(),
                    new ImagePickerPackage(),
                    new OrientationPackage(),
                    new RNSentryPackage(MainApplication.this),
                    new PhotoViewPackage(),
                    new RCTToastPackage(),
                    new RNFetchBlobPackage(),
                    new RNSoundPackage(),
                    new RNDeviceInfo(),
                    new ZulipNativePackage(),
                    new RNNotificationsPackage(MainApplication.this)
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        GCMPushNotifications.createNotificationChannel(this);
        SoLoader.init(this, /* native exopackage */ false);
        conversations = new LinkedHashMap<>();
    }

    @Override
    public IPushNotification getPushNotification(Context context, Bundle bundle, AppLifecycleFacade defaultFacade, AppLaunchHelper defaultAppLaunchHelper) {
        bundle.keySet(); // Has the side effect of making `bundle.toString` more informative.
        Log.v(NotificationHelper.TAG, "getPushNotification: " + bundle.toString(), new Throwable());

        if (ACTION_NOTIFICATIONS_DISMISS.equals(bundle.getString(ACTION_NOTIFICATIONS_DISMISS))) {
            clearConversations(conversations);
            NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nMgr.cancelAll();
            return null;
        } else {
            return new GCMPushNotifications(context, bundle, defaultFacade, defaultAppLaunchHelper, new JsIOHelper(), conversations);
        }
    }
}
