package com.zulipmobile.notifications

import android.content.Intent
import androidx.core.app.RemoteInput
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class ReplyService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig {
        val remoteInput = RemoteInput.getResultsFromIntent(intent)
        val taskData = intent.extras
        val reply = remoteInput.getCharSequence(REPLY).toString()
        taskData!!.putString("reply", reply)
        return HeadlessJsTaskConfig(
            "reply",
            Arguments.fromBundle(taskData),
            5000
        )
    }
}
