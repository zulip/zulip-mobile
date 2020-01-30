package com.zulipmobile;

import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import androidx.browser.customtabs.CustomTabsIntent;
import android.widget.Toast;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.List;

/**
 * Launches custom tabs.
 */

class CustomTabsAndroid extends ReactContextBaseJavaModule {

    private ReactApplicationContext context;


    CustomTabsAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "CustomTabsAndroid";
    }

    @ReactMethod
    public void openURL(String url) throws NullPointerException {
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setStartAnimations(context, R.anim.slide_in_right, R.anim.slide_out_left);
        builder.setExitAnimations(context, R.anim.slide_in_left, R.anim.slide_out_right);
        CustomTabsIntent customTabsIntent = builder.build();

        if (CustomTabsHelper.isChromeCustomTabsSupported(context)) {
            customTabsIntent.launchUrl(context.getCurrentActivity(), Uri.parse(url));
        } else {
            //open in browser
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setData(Uri.parse(url));
            //ensure browser is present
            final List<ResolveInfo> customTabsApps = context.getPackageManager().queryIntentActivities(i, 0);

            if (customTabsApps.size() > 0) {
                i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(i);
            } else {
                // no browser
                Toast.makeText(getReactApplicationContext(), R.string.no_browser_found, Toast.LENGTH_SHORT).show();
            }
        }
    }
}
