package com.zulipmobile.notifications;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.zulipmobile.BuildConfig;
import com.zulipmobile.notifications.NotificationHelper.ConversationMap;
import com.zulipmobile.R;

import java.io.IOException;
import java.net.URL;
import java.util.*;

import me.leolin.shortcutbadger.ShortcutBadger;

import static com.zulipmobile.notifications.NotificationHelper.*;

public class FCMPushNotifications {

    private static final String CHANNEL_ID = "default";
    private static final int NOTIFICATION_ID = 435;
    static final String ACTION_CLEAR = "ACTION_CLEAR";
    static final String EXTRA_NOTIFICATION_DATA = "data";

    private static NotificationManager getNotificationManager(Context context) {
        return (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    }

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= 26) {
            CharSequence name = context.getString(R.string.notification_channel_name);
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            getNotificationManager(context).createNotificationChannel(channel);
        }
    }

    private static void logNotificationData(Bundle data) {
        data.keySet(); // Has the side effect of making `data.toString` more informative.
        Log.v(TAG, "getPushNotification: " + data.toString(), new Throwable());
    }

    static void onReceived(Context context, ConversationMap conversations, Map<String, String> mapData) {
        // TODO refactor to not need this; reflects a juxtaposition of FCM with old GCM interfaces.
        final Bundle data = new Bundle();
        for (Map.Entry<String, String> entry : mapData.entrySet()) {
            data.putString(entry.getKey(), entry.getValue());
        }
        logNotificationData(data);
        final String eventType = mapData.get("event");
        switch (eventType) {
          case "message":
            MessageFcmMessage fcmMessage;
            try {
                fcmMessage = MessageFcmMessage.Companion.fromFcmData(mapData);
            } catch (FcmMessageParseException e) {
                Log.w(TAG, "Ignoring malformed FCM message of type `message`: " + e.getMessage());
                return;
            }
            addConversationToMap(fcmMessage, conversations);
            updateNotification(context, conversations, fcmMessage);
            break;
          case "remove":
            RemoveFcmMessage fcmMessage1;
            try {
                fcmMessage1 = RemoveFcmMessage.Companion.fromFcmData(mapData);
            } catch (FcmMessageParseException e) {
                Log.w(TAG, "Ignoring malformed FCM message of type `remove`: " + e.getMessage());
                return;
            }
            removeMessagesFromMap(conversations, fcmMessage1.getMessageIds());
            if (conversations.isEmpty()) {
                getNotificationManager(context).cancelAll();
            }
            break;
          default:
            Log.w(TAG, "Ignoring FCM message of unknown event type: " + eventType);
            break;
        }
    }

    private static void updateNotification(
            Context context, ConversationMap conversations, MessageFcmMessage fcmMessage) {
        if (conversations.isEmpty()) {
            getNotificationManager(context).cancelAll();
            return;
        }
        final Notification notification = getNotificationBuilder(context, conversations, fcmMessage).build();
        getNotificationManager(context).notify(NOTIFICATION_ID, notification);
    }

    private static Uri getNotificationSoundUri(Context context) {
        // Note: Provide default notification sound until we found a good sound
        // return Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE +"://" + context.getPackageName() + "/" + R.raw.zulip);
        return Settings.System.DEFAULT_NOTIFICATION_URI;
    }

    private static Notification.Builder getNotificationBuilder(
            Context context, ConversationMap conversations, MessageFcmMessage fcmMessage) {
        final Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ?
                new Notification.Builder(context, CHANNEL_ID)
                : new Notification.Builder(context);

        final int messageId = fcmMessage.getZulipMessageId();
        final Uri uri = Uri.fromParts("zulip", "msgid:" + Integer.toString(messageId), "");
        final Intent viewIntent = new Intent(Intent.ACTION_VIEW, uri, context, NotificationIntentService.class);
        viewIntent.putExtra(EXTRA_NOTIFICATION_DATA, fcmMessage.dataForOpen());
        final PendingIntent viewPendingIntent =
                PendingIntent.getService(context, 0, viewIntent, 0);
        builder.setContentIntent(viewPendingIntent);

        builder.setAutoCancel(true);

        Recipient recipient = fcmMessage.getRecipient();
        String content = fcmMessage.getContent();
        String senderFullName = fcmMessage.getSenderFullName();
        String avatarURL = fcmMessage.getAvatarURL();
        String time = fcmMessage.getTime();
        int totalMessagesCount = extractTotalMessagesCount(conversations);

        if (BuildConfig.DEBUG) {
            builder.setSmallIcon(R.mipmap.ic_launcher);
        } else {
            builder.setSmallIcon(R.drawable.zulip_notification);
        }

        if (conversations.size() == 1) {
            //Only one 1 notification therefore no using of big view styles
            if (totalMessagesCount > 1) {
                builder.setContentTitle(senderFullName + " (" + totalMessagesCount + ")");
            } else {
                builder.setContentTitle(senderFullName);
            }
            builder.setContentText(content);
            if (recipient instanceof Recipient.Stream) {
                Recipient.Stream r = (Recipient.Stream) recipient;
                String displayTopic = r.getStream() + " > " + r.getTopic();
                builder.setSubText("Message on " + displayTopic);
            }
            if (avatarURL.startsWith("http")) {
                Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(context,
                        avatarURL, 64));
                if (avatar != null) {
                    builder.setLargeIcon(avatar);
                }
            }
            builder.setStyle(new Notification.BigTextStyle().bigText(content));
        } else {
            String conversationTitle = String.format(Locale.ENGLISH, "%d messages in %d conversations", totalMessagesCount, conversations.size());
            builder.setContentTitle(conversationTitle);
            builder.setContentText("Messages from " + TextUtils.join(",", extractNames(conversations)));
            Notification.InboxStyle inboxStyle = new Notification.InboxStyle(builder);
            inboxStyle.setSummaryText(String.format(Locale.ENGLISH, "%d conversations", conversations.size()));
            buildNotificationContent(conversations, inboxStyle, context);
            builder.setStyle(inboxStyle);
        }

        try {
            ShortcutBadger.applyCount(context, totalMessagesCount);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }

        long timeMillis = Long.parseLong(time) * 1000;
        builder.setWhen(timeMillis);
        long[] vPattern = {0, 100, 200, 100};
        // NB the DEFAULT_VIBRATE flag below causes this to have no effect.
        // TODO: choose a vibration pattern we like, and unset DEFAULT_VIBRATE.
        builder.setVibrate(vPattern);

        builder.setDefaults(Notification.DEFAULT_VIBRATE
                | Notification.DEFAULT_LIGHTS);

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(context, NotificationIntentService.class);
            dismissIntent.setAction(ACTION_CLEAR);
            PendingIntent piDismiss = PendingIntent.getService(context, 0, dismissIntent, 0);
            Notification.Action action = new Notification.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss);
            builder.addAction(action);
        }

        final Uri soundUri = getNotificationSoundUri(context);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            AudioAttributes audioAttr = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION).build();
            builder.setSound(soundUri, audioAttr);
        } else {
            builder.setSound(soundUri);
        }
        return builder;
    }

    private static Bitmap fetchAvatar(URL url) {
        try {
            return NotificationHelper.fetch(url);
        } catch (IOException e) {
            Log.e(TAG, "ERROR: " + e.toString());
        }
        return null;
    }

    static void onOpened(ReactApplication application, ConversationMap conversations, Bundle data) {
        logNotificationData(data);
        NotifyReact.notifyReact(application, data);
        getNotificationManager((Context) application).cancelAll();
        clearConversations(conversations);
        try {
            ShortcutBadger.removeCount((Context) application);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }
    }

    static void onClear (Context context, ConversationMap conversations) {
        clearConversations(conversations);
        getNotificationManager(context).cancelAll();
    }
}
