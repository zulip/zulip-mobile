package com.zulipmobile;

import android.content.Intent;
import android.content.res.Configuration;
import android.util.Log;

import com.facebook.react.ReactActivity;

import me.leolin.shortcutbadger.ShortcutBadger;

public class MainActivity extends ReactActivity {

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

    @Override
    protected void onResume() {
        super.onResume();
        try {
            if (ShortcutBadger.isBadgeCounterSupported(MainActivity.this)) {
                ShortcutBadger.removeCount(MainActivity.this);
            }
        } catch (Exception e) {
            Log.e("BADGE ERROR", e.toString());
        }
    }
}
