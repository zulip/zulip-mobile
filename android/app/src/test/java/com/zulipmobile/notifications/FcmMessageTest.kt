package com.zulipmobile.notifications

import com.google.common.truth.Expect
import org.junit.Rule
import org.junit.Test
import org.junit.jupiter.api.assertThrows

class FcmMessageTest {
    // This lets a single test method report multiple failures.
    // See upstream docs:
    //   https://google.github.io/truth/api/0.43/com/google/common/truth/Expect.html
    //   https://google.github.io/truth/comparison
    @get:Rule
    val expect: Expect = Expect.create()

    // I'm pretty sure there are cleaner ways to do this -- ideally it would be
    // invoked more like
    //    expect.that(mapOf()).parseFailure()
    // I think that means something like making a custom `Subject`, and adding
    // a `that` overload with a type like `Map<String, String> -> FcmMessageSubject`.
    //
    // But this is what I've figured out enough of the API so far to do,
    // and it'll be good enough for now.
    private fun assertParseFails(data: Map<String, String>): FcmMessageParseException? {
        val f = assertThrows { FcmMessage.fromFcmData(data) } as Throwable
        expect.that(f).isInstanceOf(FcmMessageParseException::class.java)
        return f as? FcmMessageParseException
    }

    @Test
    fun `parse failures on missing or bad event type`() {
        assertParseFails(mapOf())
        assertParseFails(mapOf("event" to "nonsense"))
    }
}
