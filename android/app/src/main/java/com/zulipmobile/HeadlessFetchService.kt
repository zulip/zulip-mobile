package com.zulipmobile

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class HeadlessFetchService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        return if (extras != null) {
            HeadlessJsTaskConfig(
                "FetchTask",
                Arguments.fromBundle(extras),
                5000, // chosen arbitrarily
                true // revert this to false
            )
        } else null
    }
}