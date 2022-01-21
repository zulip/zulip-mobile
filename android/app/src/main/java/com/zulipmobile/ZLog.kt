package com.zulipmobile

import android.util.Log
import io.sentry.Sentry
import io.sentry.SentryLevel

/**
 * Zulip-specific logging helpers.
 *
 * These mirror part of the interface of `android.util.Log`, but they log
 * to Sentry as well as to the device console.
 *
 * We basically always want to use these instead of plain `Log.e` or `Log.w`.
 */
class ZLog {
    companion object {
        /** Log an error to both Sentry and the device log. */
        public fun e(tag: String, e: Throwable) {
            // Oddly there is no `Log.e` taking just a throwable, like there is for `Log.w`.
            // Have a message that just repeats the first line of how the throwable prints.
            val msg = "${e.javaClass.name}: ${e.message}"
            Log.e(tag, msg, e)
            Sentry.captureException(e)
        }

        /** Log a warning to both Sentry and the device log. */
        public fun w(tag: String, e: Throwable) {
            Log.w(tag, e)
            SentryX.warnException(e)
        }

        /** Log a warning to both Sentry and the device log. */
        public fun w(tag: String, msg: String) {
            Log.w(tag, msg)
            Sentry.captureMessage(msg, SentryLevel.WARNING)
        }
    }
}
