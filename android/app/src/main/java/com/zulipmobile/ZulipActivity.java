package com.zulipmobile;

import android.content.Intent;
import android.content.res.Configuration;

import com.facebook.react.ReactActivity;

/**
 * We are pretending that our package name is `com.zulipmobile.debug`
 * by adding a comment in the manifest (just for RN).
 * <p>
 * If we are pretending that our package name is something different
 * we want valid activity (entry point activity) which should be
 * present at this pretending package.
 * <p>
 * Thus extracting logic will help in avoiding logic duplicacy.
 */

public class ZulipActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ZulipMobile";
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}

