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
import android.text.TextUtils;
import android.util.Log;

import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.InitialNotificationHolder;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.PushNotification;
import com.zulipmobile.BuildConfig;
import com.zulipmobile.R;

import java.io.IOException;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

import me.leolin.shortcutbadger.ShortcutBadger;

import static com.zulipmobile.notifications.NotificationHelper.buildNotificationContent;
import static com.zulipmobile.notifications.NotificationHelper.clearConversations;
import static com.zulipmobile.notifications.NotificationHelper.extractNames;
import static com.zulipmobile.notifications.NotificationHelper.extractTotalMessagesCount;
import static com.zulipmobile.notifications.NotificationHelper.addConversationToMap;
import static com.zulipmobile.notifications.NotificationHelper.removeMessageFromMap;
import static com.zulipmobile.notifications.NotificationHelper.TAG;

public class GCMPushNotifications extends PushNotification {

    public static final String CHANNEL_ID = "default";
    public static final int NOTIFICATION_ID = 435;
    public static final String ACTION_CLEAR = "ACTION_CLEAR";

    /**
     * The Zulip messages we're showing as a notification, grouped by conversation.
     *
     * Each key identifies a conversation; see @{link buildKeyString}.
     *
     * Each value is the messages in the conversation, in the order we
     * received them.
     */
    private LinkedHashMap<String, List<MessageInfo>> conversations;

    /**
     * Same as {@link com.wix.reactnativenotifications.core.NotificationIntentAdapter#PUSH_NOTIFICATION_EXTRA_NAME}
     */
    public static final String PUSH_NOTIFICATION_EXTRA_NAME = "pushNotification";

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= 26) {
            CharSequence name = context.getString(R.string.notification_channel_name);
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public GCMPushNotifications(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper jsIoHelper, LinkedHashMap<String, List<MessageInfo>> conversations) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, jsIoHelper);
        this.conversations = conversations;
    }

    @Override
    protected PushNotificationsProp createProps(Bundle bundle) {
        return new PushNotificationsProp(bundle);
    }

    protected PushNotificationsProp getProps() {
        return (PushNotificationsProp) mNotificationProps;
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private void updateNotification() {
        if (conversations.isEmpty()) {
            getNotificationManager().cancelAll();
            return;
        }
        final Notification notification = getNotificationBuilder(null).build();
        final int notificationId = createNotificationId(notification);
        getNotificationManager().notify(notificationId, notification);
    }

    @Override
    public void onReceived() {
        final String eventType = getProps().getEvent();
        if (eventType.equals("message")) {
            addConversationToMap(getProps(), conversations);
            updateNotification();
        } else if (eventType.equals("remove")) {
            removeMessageFromMap(getProps(), conversations);
            if (conversations.isEmpty()) {
                getNotificationManager().cancelAll();
            }
        } else {
            Log.w(TAG, "Ignoring GCM message of unknown event type: " + eventType);
        }
    }

    @Override
    public void onOpened() {
        try {
            InitialNotificationHolder.getInstance().set(getProps());
        } catch (Exception e) {
            Log.e(TAG, "PendingNotif error: " + e.toString());
        }
        super.onOpened();
        clearConversations(conversations);
        try {
            ShortcutBadger.removeCount(mContext);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }
    }

    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent ignoredIntent) {
        final Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ?
                new Notification.Builder(mContext, CHANNEL_ID)
                : new Notification.Builder(mContext);

        final int messageId = getProps().getZulipMessageId();
        final Uri uri = Uri.fromParts("zulip", "msgid:" + Integer.toString(messageId), "");
        final Intent viewIntent = new Intent(Intent.ACTION_VIEW, uri, mContext, NotificationIntentService.class);
        viewIntent.putExtra(PUSH_NOTIFICATION_EXTRA_NAME, getProps().asBundle());
        final PendingIntent viewPendingIntent =
                PendingIntent.getService(mContext, 0, viewIntent, 0);
        builder.setContentIntent(viewPendingIntent);

        builder.setDefaults(Notification.DEFAULT_ALL)
                .setAutoCancel(true);

        final PushNotificationsProp props = getProps();
        String type = props.getRecipientType();
        String content = props.getContent();
        String senderFullName = props.getSenderFullName();
        String avatarURL = props.getAvatarURL();
        String time = props.getTime();
        String stream = props.getStream();
        String topic = props.getTopic();
        String baseURL = props.getBaseURL();
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
            if (type.equals("stream")) {
                String displayTopic = stream + " > " + topic;
                builder.setSubText("Message on " + displayTopic);
            }
            if (avatarURL != null && avatarURL.startsWith("http")) {
                Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(mContext,
                        avatarURL, 64, baseURL));
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
            buildNotificationContent(conversations, inboxStyle, mContext);
            builder.setStyle(inboxStyle);
        }

        try {
            ShortcutBadger.applyCount(mContext, totalMessagesCount);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }

        if (time != null) {
            long timeMillis = Long.parseLong(time) * 1000;
            builder.setWhen(timeMillis);
        }
        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(mContext, NotificationIntentService.class);
            dismissIntent.setAction(ACTION_CLEAR);
            PendingIntent piDismiss = PendingIntent.getService(mContext, 0, dismissIntent, 0);
            Notification.Action action = new Notification.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss);
            builder.addAction(action);
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            AudioAttributes audioAttr = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION).build();
            builder.setSound(Uri.parse("android.resource://" + mContext.getPackageName() + "/" + R.raw.zulip), audioAttr);
        } else {
            builder.setSound(Uri.parse("android.resource://" + mContext.getPackageName() + "/" + R.raw.zulip));
        }
        return builder;
    }

    private Bitmap fetchAvatar(URL url) {
        try {
            return NotificationHelper.fetch(url);
        } catch (IOException e) {
            Log.e(TAG, "ERROR: " + e.toString());
        }
        return null;
    }

    @Override
    protected int createNotificationId(Notification notification) {
        return NOTIFICATION_ID;
    }
}
