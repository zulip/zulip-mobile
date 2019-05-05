package com.zulipmobile;

import android.util.Base64;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

class RNSecureRandom extends ReactContextBaseJavaModule {
  private static final String SEED_KEY = "seed";

  public RNSecureRandom(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "RNSecureRandom";
  }

  @ReactMethod
  public void randomBase64(int size, Callback success) {
    success.invoke(null, getRandomBytes(size));
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(SEED_KEY, getRandomBytes(4096));
    return constants;
  }

  @ReactMethod
  private String getRandomBytes(int size) {
    SecureRandom sr = new SecureRandom();
    byte[] values = new byte[size];
    sr.nextBytes(values);
    return Base64.encodeToString(values, Base64.DEFAULT);
  }
}
