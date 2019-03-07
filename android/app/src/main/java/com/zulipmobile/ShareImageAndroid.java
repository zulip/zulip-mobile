package com.zulipmobile;

import android.content.Intent;
import android.net.Uri;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Send Send Multiple Pieces of Content to other apps.
 */

public class ShareImageAndroid extends ReactContextBaseJavaModule {

    public ShareImageAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ShareImageAndroid";
    }

    @ReactMethod
    public void shareImage(String path) throws NullPointerException {
        Intent shareIntent = new Intent();
        shareIntent.setAction(Intent.ACTION_SEND);
        shareIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse(path));
        shareIntent.setType("image/jpeg");
        Intent intent = Intent.createChooser(shareIntent,
                getReactApplicationContext().getResources().getText(R.string.send_to));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }
}
