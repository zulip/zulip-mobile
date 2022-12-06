package com.zulipmobile

import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.UnsupportedEncodingException
import java.util.zip.DataFormatException
import java.util.zip.Deflater
import java.util.zip.Inflater

// TODO: Write unit tests; see
//   https://github.com/zulip/zulip-mobile/blob/main/docs/howto/testing.md#unit-tests-android.

// TODO: Experiment what value gives the best performance.
private const val bufferSize = 8192

private const val header = "z|zlib base64|"

internal fun compress(input: String): String {
    val outputStream = ByteArrayOutputStream()
    val deflater = Deflater()
    deflater.setInput(input.toByteArray(charset("UTF-8")))
    deflater.finish()
    val buffer = ByteArray(bufferSize)
    while (!deflater.finished()) {
        val byteCount = deflater.deflate(buffer)
        outputStream.write(buffer, 0, byteCount)
    }
    deflater.end()
    outputStream.close()
    // The RN bridge currently doesn't support sending byte strings, so we
    // have to encode the compressed output as a `String`.  To avoid any
    // trouble, we use base64 to keep things inside ASCII.
    //
    // Ultimately our ASCII data seems to end up going to SQLite with size
    // no more than about 1 byte/char (presumably the string gets encoded
    // as UTF-8 and it's exactly 1 byte/char), so this is pretty OK.
    return header + Base64.encodeToString(outputStream.toByteArray(),
        Base64.DEFAULT)
}

internal fun decompress(input: String): String {
    val inflater = Inflater()
    val inputBytes = input.toByteArray(charset("ISO-8859-1"))
    inflater.setInput(Base64.decode(inputBytes,
        header.length,
        inputBytes.size - header.length,
        Base64.DEFAULT))
    val outputStream = ByteArrayOutputStream()
    val buffer = ByteArray(bufferSize)
    while (inflater.remaining != 0) {
        val byteCount = inflater.inflate(buffer)
        outputStream.write(buffer, 0, byteCount)
    }
    inflater.end()
    outputStream.close()
    return outputStream.toString("UTF-8")
}

internal class TextCompressionModule(reactContext: ReactApplicationContext?) :
        ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "TextCompressionModule"

    override fun getConstants(): Map<String, Any> = hashMapOf("header" to header)

    @ReactMethod
    fun compress(input: String, promise: Promise) {
        try {
            promise.resolve(compress(input))
        } catch (e: UnsupportedEncodingException) {
            promise.reject("UNSUPPORTED_ENCODING_EXCEPTION", e)
        } catch (e: IOException) {
            promise.reject("IO_EXCEPTION", e)
        }
    }

    @ReactMethod
    fun decompress(input: String, promise: Promise) {
        try {
            promise.resolve(decompress(input))
        } catch (e: UnsupportedEncodingException) {
            promise.reject("UNSUPPORTED_ENCODING_EXCEPTION", e)
        } catch (e: IOException) {
            promise.reject("IO_EXCEPTION", e)
        } catch (e: DataFormatException) {
            promise.reject("DATA_FORMAT_EXCEPTION", e)
        }
    }
}
