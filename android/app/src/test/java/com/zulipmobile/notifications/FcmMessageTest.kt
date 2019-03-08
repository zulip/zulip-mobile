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

    private val exampleMessageBase = mapOf(
        "event" to "message",
        "sender_avatar_url" to "https://zulip.example.com/avatar/123.jpeg",
        "sender_email" to "sender@example.com",
        "sender_full_name" to "A Sender",
        "zulip_message_id" to "12345",
        "content" to "This is a *message*",
        "time" to "??? time in some format"
    )
    private val exampleMessageStream = exampleMessageBase.plus(sequenceOf(
        "recipient_type" to "stream",
        "stream" to "denmark",
        "topic" to "play"
    ))
    private val exampleMessageGroupPm = exampleMessageBase.plus(sequenceOf(
        "recipient_type" to "private",
        "pm_users" to "123,234,345"
    ))
    private val exampleMessagePm = exampleMessageBase.plus(sequenceOf(
        "recipient_type" to "private"
    ))

    @Test
    fun `'message' messages parse as MessageFcmMessage`() {
        val message = FcmMessage.fromFcmData(exampleMessageStream)
        expect.that(message).isInstanceOf(MessageFcmMessage::class.java)
    }

    @Test
    fun `fields get parsed right in 'message' happy path`() {
        expect.that(
            FcmMessage.fromFcmData(exampleMessageStream) as MessageFcmMessage
        ).isEqualTo(MessageFcmMessage(
            email = exampleMessageStream["sender_email"]!!,
            senderFullName = exampleMessageStream["sender_full_name"]!!,
            avatarURL = exampleMessageStream["sender_avatar_url"]!!,
            zulipMessageId = 12345,
            recipient = Recipient.Stream(
                stream = exampleMessageStream["stream"]!!,
                topic = exampleMessageStream["topic"]!!
            ),
            content = exampleMessageStream["content"]!!,
            time = exampleMessageStream["time"]!!
        ))
        val groupMessage = FcmMessage.fromFcmData(exampleMessageGroupPm) as MessageFcmMessage
        expect.that(groupMessage.recipient).isEqualTo(
            Recipient.GroupPm(pmUsers = exampleMessageGroupPm["pm_users"]!!)
        )
        val pmMessage = FcmMessage.fromFcmData(exampleMessagePm) as MessageFcmMessage
        expect.that(pmMessage.recipient).isEqualTo(
            Recipient.Pm
        )
    }

    @Test
    fun `parse failures on malformed 'message'`() {
        assertParseFails(exampleMessageStream.minus("recipient_type"))
        assertParseFails(exampleMessageStream.minus("stream"))
        assertParseFails(exampleMessageStream.minus("topic"))
        assertParseFails(exampleMessageGroupPm.minus("recipient_type"))
        assertParseFails(exampleMessagePm.minus("recipient_type"))
        assertParseFails(exampleMessagePm.plus("recipient_type" to "nonsense"))

        assertParseFails(exampleMessagePm.minus("sender_avatar_url"))
        assertParseFails(exampleMessagePm.plus("sender_avatar_url" to "/avatar/123.jpeg"))
        assertParseFails(exampleMessagePm.plus("sender_avatar_url" to ""))

        assertParseFails(exampleMessagePm.minus("sender_email"))
        assertParseFails(exampleMessagePm.minus("sender_full_name"))
        assertParseFails(exampleMessagePm.minus("zulip_message_id"))
        assertParseFails(exampleMessagePm.plus("zulip_message_id" to "12,34"))
        assertParseFails(exampleMessagePm.plus("zulip_message_id" to "abc"))
        assertParseFails(exampleMessagePm.minus("content"))
        assertParseFails(exampleMessagePm.minus("time"))
    }
}
