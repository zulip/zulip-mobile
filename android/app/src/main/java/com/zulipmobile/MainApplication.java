package com.zulipmobile;

import android.app.Application;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.yamill.orientation.OrientationPackage;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.nikolaiwarner.RNTextInputReset.RNTextInputResetPackage;
import com.reactnative.photoview.PhotoViewPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.remobile.toast.RCTToastPackage;
import com.zmxv.RNSound.RNSoundPackage;
import io.sentry.RNSentryPackage;
import java.util.Arrays;
import java.util.List;

import com.zulipmobile.notifications.ConversationMap;
import com.zulipmobile.notifications.FCMPushNotifications;
import com.zulipmobile.notifications.NotificationsPackage;

public class MainApplication extends Application implements ReactApplication {
    private ConversationMap conversations;
    public ConversationMap getConversations() { return conversations; }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.asList(
                    new MainReactPackage(),
                    new NetInfoPackage(),
                    new DocumentPickerPackage(),
                    new RNCWebViewPackage(),
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
                    new NotificationsPackage()
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
        FCMPushNotifications.createNotificationChannel(this);
        SoLoader.init(this, /* native exopackage */ false);
        conversations = new ConversationMap();
    }
}
