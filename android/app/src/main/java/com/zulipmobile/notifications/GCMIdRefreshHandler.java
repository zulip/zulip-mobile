package com.zulipmobile.notifications;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import java.io.IOException;

import static com.zulipmobile.Constants.NOTIFICATION_GCM_TOKEN_REFRESHED;
import static com.zulipmobile.Constants.NOTIFICATION_SENDER_ID_MANIFEST_NAME;

public class GCMIdRefreshHandler extends IntentService {

    public final static String TAG = GCMIdRefreshHandler.class.getSimpleName();

    public GCMIdRefreshHandler(String name) {
        super(name);
    }

    public GCMIdRefreshHandler() {
        super(TAG);
    }

    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        // if intent.getBooleanExtra(NOTIFICATION_ID_REFRESH, false) is true then it is
        // Called via JS refresh() function
        refreshToken();
    }

    private void refreshToken() {
        InstanceID instanceID = InstanceID.getInstance(this);
        String token = null;
        try {
            token = instanceID.getToken(getSenderIdFromManifest(this), GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);
            Log.i(TAG, "Refreshed GCM token: " + token);
            sendTokenToJS(getApplicationContext(), token);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    protected String getSenderIdFromManifest(Context mAppContext) {
        final ApplicationInfo appInfo;
        try {
            appInfo = mAppContext.getPackageManager().getApplicationInfo(mAppContext.getPackageName(), PackageManager.GET_META_DATA);
            return appInfo.metaData.getString(NOTIFICATION_SENDER_ID_MANIFEST_NAME);
        } catch (PackageManager.NameNotFoundException e) {
            Log.e(TAG, "Failed to resolve sender ID from manifest", e);
            return null;
        }
    }

    protected void sendTokenToJS(Context mAppContext, String token) {
        final ReactInstanceManager instanceManager = ((ReactApplication) mAppContext).getReactNativeHost().getReactInstanceManager();
        final ReactContext reactContext = instanceManager.getCurrentReactContext();

        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(NOTIFICATION_GCM_TOKEN_REFRESHED, token);
        }
    }
}
