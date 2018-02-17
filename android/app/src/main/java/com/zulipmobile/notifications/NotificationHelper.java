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
import android.util.Pair;
import android.util.TypedValue;

import com.zulipmobile.R;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public class NotificationHelper {

    public static Bitmap fetch(URL url) throws IOException {
        Log.i("GAFT.fetch", "Getting gravatar from url: " + url);
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
            Log.e("ERROR", e.toString());
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

    public static void buildNotificationContent(LinkedHashMap<String, Pair<String, Integer>> conversations, Notification.InboxStyle inboxStyle, Context mContext) {
        for (Map.Entry<String, Pair<String, Integer>> map : conversations.entrySet()) {
            String name = extractName(map.getKey());

            Spannable sb = new SpannableString(String.format(Locale.ENGLISH, "%s%s: %s", name,
                    mContext.getResources().getQuantityString(R.plurals.messages, map.getValue().second, map.getValue().second),
                    map.getValue().first));
            sb.setSpan(new StyleSpan(android.graphics.Typeface.BOLD), 0, name.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
            inboxStyle.addLine(sb);
        }
    }

    public static int extractTotalMessagesCount(LinkedHashMap<String, Pair<String, Integer>> conversations) {
        int totalNumber = 0;
        for (Map.Entry<String, Pair<String, Integer>> map : conversations.entrySet()) {
            totalNumber += map.getValue().second;
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
            return String.format("%s:%s:group", prop.getSenderFullName(), prop.getGroupRecipientString());
        } else {
            return String.format("%s:%s:private", prop.getSenderFullName(), prop.getEmail());
        }
    }

    public static String[] extractNames(LinkedHashMap<String, Pair<String, Integer>> conversations) {
        String[] names = new String[conversations.size()];
        int index = 0;
        for (Map.Entry<String, Pair<String, Integer>> map : conversations.entrySet()) {
            names[index++] = map.getKey().split(":")[0];
        }
        return names;
    }

    public static void addConversationToMap(PushNotificationsProp prop, LinkedHashMap<String, Pair<String, Integer>> conversations) {
        String key = buildKeyString(prop);
        Pair<String, Integer> messages = conversations.get(key);
        if (messages != null) {
            conversations.put(key, new Pair<>(prop.getContent(), messages.second + 1));
        } else {
            conversations.put(key, new Pair<>(prop.getContent(), 1));
        }
    }


    public static void clearConversations(LinkedHashMap<String, Pair<String, Integer>> conversations) {
        conversations.clear();
    }
}
