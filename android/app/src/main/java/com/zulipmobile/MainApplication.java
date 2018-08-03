package com.zulipmobile;

import android.app.Application;
import android.app.NotificationManager;
import android.content.Context;
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
import com.wix.reactnativenotifications.RNNotificationsPackage;
import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.INotificationsApplication;
import com.wix.reactnativenotifications.core.notification.IPushNotification;
import com.zmxv.RNSound.RNSoundPackage;
import com.zulipmobile.notifications.GCMPushNotifications;
import com.zulipmobile.notifications.MessageInfo;
import com.zulipmobile.notifications.PushNotificationsProp;

import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;

import io.sentry.RNSentryPackage;

import static com.zulipmobile.notifications.GCMPushNotifications.ACTION_NOTIFICATIONS_DISMISS;
import static com.zulipmobile.notifications.NotificationHelper.addConversationToMap;
import static com.zulipmobile.notifications.NotificationHelper.clearConversations;
import static com.zulipmobile.notifications.NotificationHelper.extractKeyFromConversations;

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
        SoLoader.init(this, /* native exopackage */ false);
        conversations = new LinkedHashMap<>();
    }

    private void clearAllNotifications() {
        clearConversations(conversations);
        NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        nMgr.cancelAll();
    }

    @Override
    public IPushNotification getPushNotification(Context context, Bundle bundle, AppLifecycleFacade defaultFacade, AppLaunchHelper defaultAppLaunchHelper) {
        if (ACTION_NOTIFICATIONS_DISMISS.equals(bundle.getString(ACTION_NOTIFICATIONS_DISMISS))) {
            clearConversations(conversations);
            NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nMgr.cancelAll();
            return null;
        }

        PushNotificationsProp prop = new PushNotificationsProp(bundle);
        if (prop.isRemoveNotificationEvent()) {
            String key = extractKeyFromConversations(prop.getZulipMessageId(), conversations);
            if (key == null) {
                // Clear button pressed before the remove event.
                return null;
            }
            List<MessageInfo> conversation = conversations.get(key);
            if (conversation == null) {
                // There can be a strange case where the GCM message couldn't reach the phone and the user
                // executed the cancel event from their phone and their all the conversations will be cleared.
                return null;
            }

            if (conversation.get(conversation.size() - 1).getMessageId() == prop.getZulipMessageId()) {
                // Last message remove this conversation
                conversations.remove(key);
            } else {
                // Search for Message ID
                Iterator itr = conversation.iterator();
                while (itr.hasNext()) {
                    MessageInfo messageInfo = (MessageInfo) itr.next();
                    if (messageInfo.getMessageId() == prop.getZulipMessageId()) {
                        itr.remove();
                        break;
                    }
                }
                conversations.put(key, conversation);
            }
            if (conversations.isEmpty()) {
                clearAllNotifications();
                return null;
            }
        } else {
            addConversationToMap(prop, conversations);
        }
        return new GCMPushNotifications(context, bundle, defaultFacade, defaultAppLaunchHelper, new JsIOHelper(), conversations);
    }
}