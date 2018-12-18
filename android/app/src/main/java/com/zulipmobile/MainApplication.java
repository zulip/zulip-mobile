package com.zulipmobile;

import android.app.Application;

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
import com.zmxv.RNSound.RNSoundPackage;
import com.zulipmobile.notifications.GCMPushNotifications;
import com.zulipmobile.notifications.MessageInfo;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;

import io.sentry.RNSentryPackage;

import static com.zulipmobile.notifications.NotificationHelper.clearConversations;

public class MainApplication extends Application implements ReactApplication {
    private LinkedHashMap<String, List<MessageInfo>> conversations;
    public LinkedHashMap<String, List<MessageInfo>> getConversations() { return conversations; }

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

        @Override
        protected String getJSMainModuleName() {
            return "index";
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

    public void clearNotifications() {
        clearConversations(conversations);
        GCMPushNotifications.getNotificationManager(this).cancelAll();
    }
}
