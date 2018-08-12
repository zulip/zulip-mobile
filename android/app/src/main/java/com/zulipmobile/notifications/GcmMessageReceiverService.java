package com.zulipmobile.notifications;


import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.text.TextUtils;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;
import com.zulipmobile.MainApplication;
import com.zulipmobile.R;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

import me.leolin.shortcutbadger.ShortcutBadger;

import static com.zulipmobile.Constants.NOTIFICATION_ACTION_CLEAR;
import static com.zulipmobile.Constants.NOTIFICATION_ID;
import static com.zulipmobile.Constants.NOTIFICATION_INTENT_BUNDLE_KEY;
import static com.zulipmobile.notifications.NotificationHelper.addConversationToMap;
import static com.zulipmobile.notifications.NotificationHelper.buildNotificationContent;
import static com.zulipmobile.notifications.NotificationHelper.extractNames;
import static com.zulipmobile.notifications.NotificationHelper.extractTotalMessagesCount;
import static com.zulipmobile.notifications.NotificationHelper.fetchAvatar;

public class GcmMessageReceiverService extends GcmListenerService {
    private static final String TAG = GcmMessageReceiverService.class.getSimpleName();

    @Override
    public void onMessageReceived(String s, Bundle bundle) {
        Log.d(TAG, "New message from GCM: " + bundle);

        try {
            if (!bundle.getString("event").equals("message")) {
                throw new InvalidNotificationEventException("Invalid notification event");
            }
            LinkedHashMap<String, List<MessageInfo>> conversations = MainApplication.getConversations();
            PushNotificationsProp notificationProp = new PushNotificationsProp(bundle);
            addConversationToMap(notificationProp, conversations);
            showNotification(getApplicationContext(), notificationProp, conversations);
        } catch (InvalidNotificationEventException e) {
            Log.v(TAG, "GCM message handling aborted", e);
        }
    }

    private PendingIntent getPendingIntent(Context mContext, Bundle bundle) {
        Intent cta = new Intent(mContext, GcmIntentHandlerService.class);
        cta.putExtra(NOTIFICATION_INTENT_BUNDLE_KEY, bundle);
        return PendingIntent.getService(mContext, (int) System.currentTimeMillis(), cta, PendingIntent.FLAG_ONE_SHOT);
    }

    private void showNotification(Context mContext, PushNotificationsProp notificationProp, LinkedHashMap<String, List<MessageInfo>> conversations) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(getApplicationContext());

        String type = notificationProp.getRecipientType();
        String content = notificationProp.getContent();
        String senderFullName = notificationProp.getSenderFullName();
        String avatarURL = notificationProp.getAvatarURL();
        String time = notificationProp.getTime();
        String stream = notificationProp.getStream();
        String topic = notificationProp.getTopic();
        String baseURL = notificationProp.getBaseURL();
        int totalMessagesCount = extractTotalMessagesCount(conversations);

        builder.setSmallIcon(R.drawable.zulip_notification);
        builder.setAutoCancel(true);
        builder.setContentText(content);
        builder.setContentIntent(getPendingIntent(mContext, notificationProp.getBundle()))
                .setDefaults(Notification.DEFAULT_ALL)
                .setAutoCancel(true);

        if (conversations.size() == 1) {
            //Only one 1 notification therefore no using of big view styles
            if (totalMessagesCount > 1) {
                builder.setContentTitle(senderFullName + " (" + totalMessagesCount + ")");
            } else {
                builder.setContentTitle(senderFullName);
            }
            if (type.equals("stream")) {
                if (Build.VERSION.SDK_INT >= 16) {
                    String displayTopic = stream + " > "
                            + topic;
                    builder.setSubText("Message on " + displayTopic);
                }
            }
            if (avatarURL != null && avatarURL.startsWith("http")) {
                Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(mContext,
                        avatarURL, 64, baseURL));
                if (avatar != null) {
                    builder.setLargeIcon(avatar);
                }
            }
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(content));
        } else {
            String conversationTitle = String.format(Locale.ENGLISH, "%d messages in %d conversations", totalMessagesCount, conversations.size());
            builder.setContentTitle(conversationTitle);
            builder.setContentText("Messages from " + TextUtils.join(",", extractNames(conversations)));
            NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle(builder);
            inboxStyle.setSummaryText(String.format(Locale.ENGLISH, "%d conversations", conversations.size()));
            buildNotificationContent(conversations, inboxStyle, mContext);
            builder.setStyle(inboxStyle);
        }

        try {
            ShortcutBadger.applyCount(mContext, totalMessagesCount);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }

        if (time != null) {
            long timStamp = Long.parseLong(notificationProp.getTime()) * 1000;
            builder.setWhen(timStamp);
        }
        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);


        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(mContext, GcmIntentHandlerService.class);
            dismissIntent.setAction(NOTIFICATION_ACTION_CLEAR);
            PendingIntent piDismiss = PendingIntent.getService(mContext, 0, dismissIntent, 0);
            NotificationCompat.Action action = new NotificationCompat.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss);
            builder.addAction(action);
        }
        builder.setSound(Uri.parse("android.resource://" + mContext.getPackageName() + "/" + R.raw.zulip));
        Notification notification = builder.build();
        NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        nMgr.notify(NOTIFICATION_ID, notification);
    }
}
