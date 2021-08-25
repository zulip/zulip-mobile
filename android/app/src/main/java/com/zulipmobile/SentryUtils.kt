package com.zulipmobile

import io.sentry.Sentry
import io.sentry.SentryLevel

/**
 * A home for things that ought to be static extensions of `Sentry`.
 *
 * Extending Java classes with static members isn't currently a feature
 * available in Kotlin:
 *   https://youtrack.jetbrains.com/issue/KT-11968
 * so this is our substitute.
 */
class SentryX {
    companion object {
        /**
         * Like `Sentry.captureException`, but at level `SentryLevel.WARNING`.
         */
        public fun warnException(e: Throwable) {
            Sentry.withScope { scope ->
                scope.level = SentryLevel.WARNING
                Sentry.captureException(e)
            }
        }
    }
}
