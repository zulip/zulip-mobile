package com.zulipmobile.notifications;

import android.app.Notification;
import android.graphics.Color;
import android.os.Bundle;
import androidx.annotation.Nullable;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import com.facebook.react.bridge.*;
import com.google.firebase.iid.FirebaseInstanceId;
import kotlin.Pair;

import com.zulipmobile.BuildConfig;
import com.zulipmobile.R;

import static com.zulipmobile.notifications.NotificationHelper.TAG;

class NotificationsModule extends ReactContextBaseJavaModule {

    static Bundle initialNotification = null;

    NotificationsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Notifications";
    }

    static void emitToken(@Nullable ReactContext reactContext, String token) {
        if (reactContext == null) {
            // Perhaps this is possible if InstanceIDListenerService gets invoked?
            return;
        }
        Log.i(TAG, "Got token; emitting event");
        NotifyReact.emit(reactContext, "remoteNotificationsRegistered", token);
    }

    /**
     * Grab the token and return it to the JavaScript caller.
     */
    @ReactMethod
    public void getToken(Promise promise) {
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnSuccessListener(instanceId -> promise.resolve(instanceId.getToken()))
                .addOnFailureListener(e -> promise.reject(e));
    }

    @ReactMethod
    public void readInitialNotification(Promise promise) {
        if (null == initialNotification) {
            promise.resolve(null);
        } else {
            promise.resolve(Arguments.fromBundle(initialNotification));
            initialNotification = null;
        }
    }

    @ReactMethod
    public void updateNotification(String avatarUrl, String conversationKey, String message) {
        Log.d("my-tag", "Hello");
        Log.d("my-tag", conversationKey);
        Pair<Integer, Notification> notificationPair =
                FCMPushNotifications
                        .getActiveNotification(getReactApplicationContext(), conversationKey);
        int notificationId = notificationPair.getFirst();
        Notification notification = notificationPair.getSecond();
        NotificationCompat.MessagingStyle messagingStyle =
                NotificationCompat.MessagingStyle
                        .extractMessagingStyleFromNotification(notification);

        Person user = new Person.Builder().setName("You").build();
        messagingStyle.addMessage(message, System.currentTimeMillis(), user);

        NotificationCompat.Builder builder
                = new NotificationCompat.Builder(getReactApplicationContext(), "default");

        if (BuildConfig.DEBUG) {
            builder.setSmallIcon(R.mipmap.ic_launcher);
        } else {
            builder.setSmallIcon(R.drawable.zulip_notification);
        }

        Bundle extra = new Bundle();
        extra.putString("conversationKey", conversationKey);

        builder
            .setColor(Color.rgb(100, 146, 254))
            .setStyle(messagingStyle)
            .setGroup(notification.getGroup())
            .setNumber(messagingStyle.getMessages().size())
            .setExtras(extra);

        NotificationManagerCompat.from(getReactApplicationContext())
                .notify(conversationKey, notificationId, builder.build());
    }
}
