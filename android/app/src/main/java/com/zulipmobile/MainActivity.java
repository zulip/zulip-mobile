package com.zulipmobile;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // check for data in Implicit Intent
        // https://developer.android.com/guide/components/intents-filters#Receiving
        checkForImplicitIntentData();
    }

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

    private void checkForImplicitIntentData() {
        String receivedAction = getIntent().getAction();
        String receivedType = getIntent().getType();

        if (receivedAction == null || !receivedAction.equals(Intent.ACTION_SEND)
                || receivedType == null) {
            return;
        }

        // check data type
        if (receivedType.startsWith("text/")) {
            String text = getIntent()
                    .getStringExtra(Intent.EXTRA_TEXT);
            if (text != null) {
                AppSession appSession = AppSession.getAppSession();
                appSession.setShareDataType("text");
                appSession.setShareData(text);
            }
        }
    }
}
