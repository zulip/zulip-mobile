package com.zulipmobile.notifications

import com.zulipmobile.notifications.onReceived
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.zulipmobile.MainApplication
import android.content.Intent
import com.zulipmobile.HeadlessFetchService
import android.os.Bundle
import com.zulipmobile.notifications.ConversationMap
import com.facebook.react.bridge.ReactContext
import com.facebook.react.ReactApplication
import com.zulipmobile.notifications.NotificationsModule

class FcmListenerService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        if (applicationContext !is MainApplication) return
        run {
            val service = Intent(applicationContext, HeadlessFetchService::class.java)
            val bundle = Bundle()
            bundle.putString("foo", "bar")
            service.putExtras(bundle)
            applicationContext.startService(service)
        }
        val conversations = (applicationContext as MainApplication).conversations
        onReceived(this, conversations, message.data)
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