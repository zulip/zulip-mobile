package com.zulipmobile.notifications;

import android.app.Notification;
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
import com.wix.reactnativenotifications.core.ProxyService;
import com.wix.reactnativenotifications.core.notification.PushNotification;
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

public class GCMPushNotifications extends PushNotification {

    public static final int NOTIFICATION_ID = 435;
    public static final String ACTION_NOTIFICATIONS_DISMISS = "ACTION_NOTIFICATIONS_DISMISS";

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
    private static final String PUSH_NOTIFICATION_EXTRA_NAME = "pushNotification";

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


    @Override
    public void onOpened() {
        try {
            InitialNotificationHolder.getInstance().set(getProps());
        } catch (Exception e) {
            Log.e("PendingNotif error", e.toString());
        }
        super.onOpened();
        clearConversations(conversations);
        try {
            ShortcutBadger.removeCount(mContext);
        } catch (Exception e) {
            Log.e("BADGE ERROR", e.toString());
        }
    }


    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        // First, get a builder initialized with defaults from the core class.
        final Notification.Builder builder = super.getNotificationBuilder(intent);

        String type = getProps().getRecipientType();
        String content = getProps().getContent();
        String senderFullName = getProps().getSenderFullName();
        String avatarURL = getProps().getAvatarURL();
        String time = getProps().getTime();
        String stream = getProps().getStream();
        String topic = getProps().getTopic();
        String baseURL = getProps().getBaseURL();
        int totalMessagesCount = extractTotalMessagesCount(conversations);

        builder.setSmallIcon(R.drawable.zulip_notification);
        builder.setAutoCancel(true);
        builder.setContentText(content);

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
            Log.e("BADGE ERROR", e.toString());
        }

        if (time != null) {
            long timStamp = Long.parseLong(getProps().getTime()) * 1000;
            builder.setWhen(timStamp);
        }
        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);


        /**
         * Ideally, actions are sent using dismissIntent.setAction(String),
         * But here {@link com.wix.reactnativenotifications.core.NotificationIntentAdapter#extractPendingNotificationDataFromIntent(Intent)}
         * it checks in the bundle hence, An empty bundle is sent and checked in
         * {@link com.zulipmobile.MainApplication#getPushNotification} for this string and then dismissed
         *
         **/
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(mContext, ProxyService.class);
            Bundle bundle = new Bundle();
            bundle.putString(ACTION_NOTIFICATIONS_DISMISS, ACTION_NOTIFICATIONS_DISMISS);
            dismissIntent.putExtra(PUSH_NOTIFICATION_EXTRA_NAME, bundle);
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
            Log.e("ERROR", e.toString());
        }
        return null;
    }

    @Override
    protected int createNotificationId(Notification notification) {
        return NOTIFICATION_ID;
    }
}
