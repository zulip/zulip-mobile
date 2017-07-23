package com.zulipmobile;

import android.net.Uri;
import android.support.customtabs.CustomTabsIntent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Launches custom tabs.
 */

public class CustomTabsAndroid extends ReactContextBaseJavaModule {

    public CustomTabsAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CustomTabsAndroid";
    }

    @ReactMethod
    public void openURL(String url) throws NullPointerException {
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setStartAnimations(getReactApplicationContext().getCurrentActivity(), R.anim.slide_in_right, R.anim.slide_out_left);
        builder.setExitAnimations(getReactApplicationContext().getCurrentActivity(), R.anim.slide_in_left, R.anim.slide_out_right);
        CustomTabsIntent customTabsIntent = builder.build();
        customTabsIntent.launchUrl(getReactApplicationContext().getCurrentActivity(), Uri.parse(url));
    }
}
