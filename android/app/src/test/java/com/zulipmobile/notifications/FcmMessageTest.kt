package com.zulipmobile.notifications

import com.google.common.truth.Expect
import org.junit.Rule
import org.junit.Test
import org.junit.jupiter.api.assertThrows

open class FcmMessageTestBase {
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
    protected fun assertParseFails(data: Map<String, String>): FcmMessageParseException? {
        val f = assertThrows { FcmMessage.fromFcmData(data) } as Throwable
        expect.that(f).isInstanceOf(FcmMessageParseException::class.java)
        return f as? FcmMessageParseException
    }
}

class FcmMessageTest : FcmMessageTestBase() {
    @Test
    fun `parse failures on missing or bad event type`() {
        assertParseFails(mapOf())
        assertParseFails(mapOf("event" to "nonsense"))
    }
}

class MessageFcmMessageTest : FcmMessageTestBase() {
    object Example {
        val base = mapOf(
            "event" to "message",
            "sender_avatar_url" to "https://zulip.example.com/avatar/123.jpeg",
            "sender_email" to "sender@example.com",
            "sender_full_name" to "A Sender",
            "zulip_message_id" to "12345",
            "content" to "This is a *message*",
            "time" to "??? time in some format"
        )

        val stream = base.plus(sequenceOf(
            "recipient_type" to "stream",
            "stream" to "denmark",
            "topic" to "play"
        ))

        val groupPm = base.plus(sequenceOf(
            "recipient_type" to "private",
            "pm_users" to "123,234,345"
        ))

        val pm = base.plus(sequenceOf(
            "recipient_type" to "private"
        ))
    }

    @Test
    fun `'message' messages parse as MessageFcmMessage`() {
        val message = FcmMessage.fromFcmData(Example.stream)
        expect.that(message).isInstanceOf(MessageFcmMessage::class.java)
    }

    private fun parse(data: Map<String, String>) =
        FcmMessage.fromFcmData(data) as MessageFcmMessage

    @Test
    fun `fields get parsed right in 'message' happy path`() {
        expect.that(parse(Example.stream)).isEqualTo(
            MessageFcmMessage(
                email = Example.stream["sender_email"]!!,
                senderFullName = Example.stream["sender_full_name"]!!,
                avatarURL = Example.stream["sender_avatar_url"]!!,
                zulipMessageId = 12345,
                recipient = Recipient.Stream(
                    stream = Example.stream["stream"]!!,
                    topic = Example.stream["topic"]!!
                ),
                content = Example.stream["content"]!!,
                time = Example.stream["time"]!!
            )
        )
        expect.that(parse(Example.groupPm).recipient).isEqualTo(
            Recipient.GroupPm(pmUsers = Example.groupPm["pm_users"]!!)
        )
        expect.that(parse(Example.pm).recipient).isEqualTo(
            Recipient.Pm
        )
    }

    @Test
    fun `parse failures on malformed 'message'`() {
        assertParseFails(Example.stream.minus("recipient_type"))
        assertParseFails(Example.stream.minus("stream"))
        assertParseFails(Example.stream.minus("topic"))
        assertParseFails(Example.groupPm.minus("recipient_type"))
        assertParseFails(Example.pm.minus("recipient_type"))
        assertParseFails(Example.pm.plus("recipient_type" to "nonsense"))

        assertParseFails(Example.pm.minus("sender_avatar_url"))
        assertParseFails(Example.pm.plus("sender_avatar_url" to "/avatar/123.jpeg"))
        assertParseFails(Example.pm.plus("sender_avatar_url" to ""))

        assertParseFails(Example.pm.minus("sender_email"))
        assertParseFails(Example.pm.minus("sender_full_name"))
        assertParseFails(Example.pm.minus("zulip_message_id"))
        assertParseFails(Example.pm.plus("zulip_message_id" to "12,34"))
        assertParseFails(Example.pm.plus("zulip_message_id" to "abc"))
        assertParseFails(Example.pm.minus("content"))
        assertParseFails(Example.pm.minus("time"))
    }
}
