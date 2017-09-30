package com.zulipmobile;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by vishwesh on 30/09/17.
 */

public class CloseAllCustomTabsAndroid extends ReactContextBaseJavaModule {
    public CloseAllCustomTabsAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CloseAllCustomTabsAndroid";
    }

    @ReactMethod
    public void closeAll() throws NullPointerException {
        Intent intent = new Intent(getReactApplicationContext().getCurrentActivity(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().getCurrentActivity().startActivity(intent);
    }
}
