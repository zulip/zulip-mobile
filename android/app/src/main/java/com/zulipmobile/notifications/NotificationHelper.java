package com.zulipmobile.notifications;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.util.TypedValue;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

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
}
