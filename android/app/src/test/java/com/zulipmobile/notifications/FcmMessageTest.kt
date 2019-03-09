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

    object Example {
        val base = mapOf(
            "server" to "zulip.example.cloud",  // corresponds to EXTERNAL_HOST
            "realm_id" to "4",
            "realm_uri" to "https://zulip.example.com"  // corresponds to realm.uri
        )
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
        val base = FcmMessageTestBase.Example.base.plus(sequenceOf(
            "event" to "message",

            "zulip_message_id" to "12345",

            "sender_id" to "123",
            "sender_email" to "sender@example.com",
            "sender_avatar_url" to "https://zulip.example.com/avatar/123.jpeg",
            "sender_full_name" to "A Sender",

            "time" to "1546300800",  // a Unix seconds-since-epoch

            "user" to "client@example.com",  // this recipient's email address
            "content" to "This is a message",  // rendered_content, reduced to plain text
            "content_truncated" to "This is a m…"
        ))

        val stream = base.plus(sequenceOf(
            "recipient_type" to "stream",
            "stream" to "denmark",
            "topic" to "play",

            "alert" to "New stream message from A Sender in denmark"
        ))

        val groupPm = base.plus(sequenceOf(
            "recipient_type" to "private",
            "pm_users" to "123,234,345",

            "alert" to "New private group message from A Sender"
        ))

        val pm = base.plus(sequenceOf(
            "recipient_type" to "private",

            "alert" to "New private message from A Sender"
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

class RemoveFcmMessageTest : FcmMessageTestBase() {
    object Example {
        val base = FcmMessageTestBase.Example.base.plus(sequenceOf(
            "event" to "remove"
        ))

        /// The Zulip server before v2.0 sends this form (plus some irrelevant fields).
        val singular = base.plus(sequenceOf(
            "zulip_message_id" to "123"
        ))

        /// Zulip servers starting at v2.0 (released 2019-02-28; commit 2.0.0~57)
        /// send a hybrid form.  (In practice the singular field has one of the
        /// same IDs found in the batch.)
        ///
        /// We started consuming the batch field in 23.2.111 (released 2019-02-28;
        /// commit 23.2.111~32).
        val hybrid = base.plus(sequenceOf(
            "zulip_message_ids" to "234,345",
            "zulip_message_id" to "123"
        ))

        /// Some future Zulip server (at least v2.1; after clients older than
        /// v23.2.111 are rare) may drop the singular field.
        val batched = base.plus(sequenceOf(
            "zulip_message_ids" to "123,234,345"
        ))
    }

    @Test
    fun `'remove' messages parse as RemoveFcmMessage`() {
        val message = FcmMessage.fromFcmData(Example.batched)
        expect.that(message).isInstanceOf(RemoveFcmMessage::class.java)
    }

    private fun parse(data: Map<String, String>) =
        FcmMessage.fromFcmData(data) as RemoveFcmMessage

    @Test
    fun `fields get parsed right in happy path`() {
        expect.that(parse(Example.hybrid)).isEqualTo(
            RemoveFcmMessage(setOf(123, 234, 345))
        )
        expect.that(parse(Example.batched)).isEqualTo(
            RemoveFcmMessage(setOf(123, 234, 345))
        )
        expect.that(parse(Example.singular)).isEqualTo(
            RemoveFcmMessage(setOf(123))
        )
        expect.that(parse(Example.singular.minus("zulip_message_id"))).isEqualTo(
            // This doesn't seem very useful to send, but harmless.
            RemoveFcmMessage(setOf())
        )
    }

    @Test
    fun `parse failures on malformed data`() {
        for (badInt in sequenceOf(
            "12,34",
            "abc",
            ""
        )) {
            assertParseFails(Example.singular.plus("zulip_message_id" to badInt))
            assertParseFails(Example.hybrid.plus("zulip_message_id" to badInt))
        }

        for (badIntList in sequenceOf(
            "abc,34",
            "12,abc",
            "12,",
            ""
        )) {
            assertParseFails(Example.hybrid.plus("zulip_message_ids" to badIntList))
            assertParseFails(Example.batched.plus("zulip_message_ids" to badIntList))
        }
    }
}
