package com.zulipmobile;

import android.app.Application;
import android.os.Bundle;

import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.yamill.orientation.OrientationPackage;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.nikolaiwarner.RNTextInputReset.RNTextInputResetPackage;
import com.reactnative.photoview.PhotoViewPackage;
import com.remobile.toast.RCTToastPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.zulipmobile.notifications.MessageInfo;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;

import io.sentry.RNSentryPackage;

public class MainApplication extends Application implements ReactApplication {

    private static LinkedHashMap<String, List<MessageInfo>> conversations;
    private static Bundle intialNotification;

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
                    new ZulipNativePackage()
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
        SoLoader.init(this, /* native exopackage */ false);
        conversations = new LinkedHashMap<>();
    }

    public static void clearAllConversations() {
        conversations.clear();
    }

    public static LinkedHashMap<String, List<MessageInfo>> getConversations() {
        return conversations;
    }

    public static void saveOpenedNotification(Bundle prop) {
        intialNotification = prop;
    }

    public static Bundle getIntialNotification() {
        return intialNotification;
    }
}
