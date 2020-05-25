package com.zulipmobile.sharing

import com.facebook.react.bridge.*

internal class SharingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "Sharing"
    }

    @ReactMethod
    fun getInitialSharedContent(promise: Promise) {
        if (null == initialSharedData) {
            promise.resolve(null)
        } else {
            promise.resolve(initialSharedData)
        }

    }

    companion object {
        var initialSharedData: WritableMap? = null
    }
}
