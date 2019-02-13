package com.zulipmobile.notifications;

import android.app.Notification;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.StyleSpan;
import android.util.Log;
import android.util.TypedValue;

import com.zulipmobile.R;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class NotificationHelper {
    public static final String TAG = "ZulipNotif";

    /**
     * The Zulip messages we're showing as a notification, grouped by conversation.
     *
     * Each key identifies a conversation; see @{link buildKeyString}.
     *
     * Each value is the messages in the conversation, in the order we
     * received them.
     */
    public static final class ConversationMap
            extends LinkedHashMap<String, List<MessageInfo>> {}

    public static Bitmap fetch(URL url) throws IOException {
        Log.i(TAG, "GAFT.fetch: Getting gravatar from url: " + url);
        URLConnection connection = url.openConnection();
        connection.setUseCaches(true);
        Object response = connection.getContent();
        if (response instanceof InputStream) {
            return BitmapFactory.decodeStream((InputStream) response);
        }
        return null;
    }

    public static URL sizedURL(Context context, String url, float dpSize, String baseUrl) {
        // From http://stackoverflow.com/questions/4605527/
        Resources r = context.getResources();
        float px = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP,
                dpSize, r.getDisplayMetrics());
        try {
            return new URL(addHost(url, baseUrl) + "&s=" + px);
        } catch (MalformedURLException e) {
            Log.e(TAG, "ERROR: " + e.toString());
            return null;
        }
    }

    public static String addHost(String url, String baseURL) {
        if (!url.startsWith("http")) {
            if (baseURL.endsWith("/")) {
                url = baseURL.substring(0, baseURL.length() - 1) + url;
            } else {
                url = baseURL + url;
            }
        }
        return url;
    }


    public static String extractName(String key) {
        return key.split(":")[0];
    }

    public static void buildNotificationContent(ConversationMap conversations, Notification.InboxStyle inboxStyle, Context mContext) {
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            String name = extractName(entry.getKey());
            List<MessageInfo> messages = entry.getValue();
            Spannable sb = new SpannableString(String.format(Locale.ENGLISH, "%s%s: %s", name,
                    mContext.getResources().getQuantityString(R.plurals.messages,messages.size(),messages.size()),
                   messages.get(entry.getValue().size() - 1).getContent()));
            sb.setSpan(new StyleSpan(android.graphics.Typeface.BOLD), 0, name.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
            inboxStyle.addLine(sb);
        }
    }

    public static int extractTotalMessagesCount(ConversationMap conversations) {
        int totalNumber = 0;
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            totalNumber += entry.getValue().size();
        }
        return totalNumber;
    }

    /**
     * Formats -
     * stream message - fullName:streamName:'stream'
     * group message - fullName:Recipients:'group'
     * private message - fullName:Email:'private'
     */
    public static String buildKeyString(PushNotificationsProp prop) {
        if (prop.getRecipientType().equals("stream"))
            return String.format("%s:%s:stream", prop.getSenderFullName(), prop.getStream());
        else if (prop.isGroupMessage()) {
            return String.format("%s:%s:group", prop.getSenderFullName(), prop.getPmUsers());
        } else {
            return String.format("%s:%s:private", prop.getSenderFullName(), prop.getEmail());
        }
    }

    public static String[] extractNames(ConversationMap conversations) {
        String[] names = new String[conversations.size()];
        int index = 0;
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            names[index++] = entry.getKey().split(":")[0];
        }
        return names;
    }

    public static void addConversationToMap(PushNotificationsProp prop, ConversationMap conversations) {
        String key = buildKeyString(prop);
        List<MessageInfo> messages = conversations.get(key);
        MessageInfo messageInfo = new MessageInfo(prop.getContent(), prop.getZulipMessageId());
        if (messages == null) {
            messages = new ArrayList<>();
        }
        messages.add(messageInfo);
        conversations.put(key, messages);
    }

    public static void removeMessageFromMap(ConversationMap conversations, int zulipMessageId) {
        // We don't have the information to compute what key we ought to find this message under,
        // so just walk the whole thing.  If the user has >100 notifications, this linear scan
        // won't be their worst problem anyway...
        //
        // TODO redesign this whole data structure, for many reasons.
        for (String key : conversations.keySet()) {
            List<MessageInfo> messages = conversations.get(key);
            for (int i = 0; i < messages.size(); i++) {
                if (messages.get(i).getMessageId() == zulipMessageId) {
                    messages.remove(i);
                    if (messages.isEmpty()) {
                        conversations.remove(key);
                    }
                    return;
                }
            }
        }
    }

    public static void clearConversations(ConversationMap conversations) {
        conversations.clear();
    }
}
