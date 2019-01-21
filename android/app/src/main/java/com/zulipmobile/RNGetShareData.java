package com.zulipmobile;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RNGetShareData extends ReactContextBaseJavaModule {

    public RNGetShareData(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNGetShareData";
    }

    @ReactMethod
    public void getShareData(Callback callback) {
        AppSession appSession = AppSession.getAppSession();
        callback.invoke(appSession.getShareDataType(), appSession.getShareData());
    }
}
