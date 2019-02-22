package com.zulipmobile;

import android.app.KeyguardManager;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.widget.Toast;

import android.os.Bundle;
import android.webkit.WebView;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    private static final int REQUEST_CODE = 1337;
    private KeyguardManager keyguardManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent i = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            keyguardManager=(KeyguardManager)getSystemService(KEYGUARD_SERVICE);
            i = keyguardManager.createConfirmDeviceCredentialIntent(
                    "Zulip secure", "Authenticate to access Zulip ");


            if (i == null) {
                Toast.makeText(this, "No authentication required!", Toast.LENGTH_SHORT).show();
            } else {
                startActivityForResult(i, REQUEST_CODE);
            }
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode,
                                    Intent data) {
        if (requestCode==REQUEST_CODE) {
            if (resultCode==RESULT_OK) {
                Toast.makeText(this, "Authenticated!", Toast.LENGTH_SHORT).show();
            }
            else {
                finish();
            }
        }
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
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}
