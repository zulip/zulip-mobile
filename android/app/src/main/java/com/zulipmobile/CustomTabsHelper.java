package com.zulipmobile;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import androidx.annotation.NonNull;
import java.util.List;

/**
 * Contains helper methods for custom tabs.
 */

class CustomTabsHelper {

    private static final String SERVICE_ACTION = "android.support.customtabs.action.CustomTabsService";
    private static final String CHROME_PACKAGE = "com.android.chrome";

    public static boolean isChromeCustomTabsSupported(@NonNull final Context context) {
        Intent serviceIntent = new Intent(SERVICE_ACTION);
        serviceIntent.setPackage(CHROME_PACKAGE);
        List<ResolveInfo> resolveInfos = context.getPackageManager().queryIntentServices(serviceIntent, 0);
        return !(resolveInfos == null || resolveInfos.isEmpty());
    }
}
