package com.zulipmobile.notifications

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.facebook.react.bridge.ReactContext
import com.facebook.react.ReactApplication

class FcmListenerService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        onReceived(this, message.data)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        val reactContext = (application as ReactApplication)
            .reactNativeHost
            .reactInstanceManager
            .currentReactContext
        NotificationsModule.emitToken(reactContext, token)
    }
}
