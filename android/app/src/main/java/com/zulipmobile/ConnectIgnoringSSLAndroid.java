package com.zulipmobile;
import java.util.Map;
import java.util.HashMap;
import android.net.Uri;
import android.content.Intent;
import android.widget.Toast;
import com.facebook.react.bridge.Promise;
import java.net.*;
import java.io.InputStream;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;

public class ConnectIgnoringSSLAndroid extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext = null;
  private static final String CONNECT_ERROR = "CONNECT_ERROR";

    public ConnectIgnoringSSLAndroid(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }
    @Override
    public String getName() {
        return "ConnectIgnoringSSLAndroid";
    }

    @ReactMethod
     public void connect(String inputUrl, Promise promise) {
         WritableMap map = Arguments.createMap();
         try{
                TrustAllCertificates.install();
                URL url = new URL(inputUrl);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                InputStream in = urlConnection.getInputStream();
                map.putString("result", "success");
                promise.resolve(map);
         }catch (Exception e) {
             promise.reject(this.CONNECT_ERROR, e);
         }    
  }
  
}
