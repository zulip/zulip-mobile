package com.zulipmobile.notifications

import com.facebook.react.ReactApplication
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

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
