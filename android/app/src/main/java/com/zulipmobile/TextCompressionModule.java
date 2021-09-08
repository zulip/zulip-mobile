package com.zulipmobile;

import android.util.Base64;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

// TODO: Write unit tests; see
//   https://github.com/zulip/zulip-mobile/blob/main/docs/howto/testing.md#unit-tests-android.
class TextCompressionModule extends ReactContextBaseJavaModule {
  public TextCompressionModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "TextCompressionModule";
  }

  // TODO: Experiment what value gives the best performance.
  private final int bufferSize = 8192;

  private final String header = "z|zlib base64|";

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("header", header);
    return constants;
  }

  @ReactMethod
  public void compress(String input, Promise promise) {
    try {
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      Deflater deflater = new Deflater();
      deflater.setInput(input.getBytes("UTF-8"));
      deflater.finish();
      byte[] buffer = new byte[bufferSize];
      while (!deflater.finished()) {
        int byteCount = deflater.deflate(buffer);
        outputStream.write(buffer, 0, byteCount);
      }
      deflater.end();
      outputStream.close();
      // The RN bridge currently doesn't support sending byte strings, so we
      // have to encode the compressed output as a `String`.  To avoid any
      // trouble, we use base64 to keep things inside ASCII.
      //
      // Ultimately our ASCII data seems to end up going to SQLite with size
      // no more than about 1 byte/char (presumably the string gets encoded
      // as UTF-8 and it's exactly 1 byte/char), so this is pretty OK.
      promise.resolve(header + Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT));
    } catch (UnsupportedEncodingException e) {
      promise.reject("UNSUPPORTED_ENCODING_EXCEPTION", e);
    } catch (IOException e) {
      promise.reject("IO_EXCEPTION", e);
    }
  }

  @ReactMethod
  public void decompress(String input, Promise promise) {
    try {
      Inflater inflater = new Inflater();
      byte[] inputBytes = input.getBytes("ISO-8859-1");
      inflater.setInput(Base64.decode(inputBytes,
                                      header.length(),
                                      inputBytes.length - header.length(),
                                      Base64.DEFAULT));
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      byte[] buffer = new byte[bufferSize];
      while (inflater.getRemaining() != 0) {
        int byteCount = inflater.inflate(buffer);
        outputStream.write(buffer, 0, byteCount);
      }
      inflater.end();
      outputStream.close();
      promise.resolve(outputStream.toString("UTF-8"));
    } catch(java.io.UnsupportedEncodingException e) {
      promise.reject("UNSUPPORTED_ENCODING_EXCEPTION", e);
    } catch (IOException e) {
      promise.reject("IO_EXCEPTION", e);
    } catch (DataFormatException e) {
      promise.reject("DATA_FORMAT_EXCEPTION", e);
    }
  }
}
