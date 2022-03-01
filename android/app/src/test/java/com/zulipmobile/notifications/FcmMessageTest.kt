package com.zulipmobile.notifications

import com.google.common.truth.Expect
import org.junit.Rule
import org.junit.Test
import org.junit.jupiter.api.assertThrows
import java.net.URL

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
            "realm_uri" to "https://zulip.example.com",  // corresponds to realm.uri
            "user_id" to "234"
        )
        internal val identity = Identity(
            serverHost = base["server"]!!,
            realmId = 4,
            realmUri = URL(base["realm_uri"]!!),
            userId = 234
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

class RecipientTest : FcmMessageTestBase() {
    @Test
    fun `GroupPm#getPmUsersString gives the correct string`() {
        expect.that(Recipient.GroupPm(pmUsers = setOf(123, 234, 345)).getPmUsersString())
            .isEqualTo("123,234,345")
    }

    @Test
    fun `GroupPm#getPmUsersString correctly reorders user ids`() {
        expect.that(Recipient.GroupPm(pmUsers = setOf(234, 123, 23, 345)).getPmUsersString())
            .isEqualTo("23,123,234,345")
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

    private fun dataForOpen(data: Map<String, String>) =
        mapOf(*parse(data).dataForOpen())

    @Test
    fun `fields get parsed right in 'message' happy path`() {
        expect.that(parse(Example.stream)).isEqualTo(
            MessageFcmMessage(
                identity = FcmMessageTestBase.Example.identity,
                sender = Sender(
                    id = 123,
                    email = Example.stream["sender_email"]!!,
                    avatarURL = URL(Example.stream["sender_avatar_url"]!!),
                    fullName = Example.stream["sender_full_name"]!!
                ),
                zulipMessageId = 12345,
                recipient = Recipient.Stream(
                    streamName = Example.stream["stream"]!!,
                    topic = Example.stream["topic"]!!
                ),
                content = Example.stream["content"]!!,
                timeMs = Example.stream["time"]!!.toLong() * 1000
            )
        )
        expect.that(parse(Example.groupPm).recipient).isEqualTo(
            Recipient.GroupPm(pmUsers = setOf(123, 234, 345))
        )
        expect.that(parse(Example.pm).recipient).isEqualTo(
            Recipient.Pm
        )
    }

    @Test
    fun `dataForOpen works right in happy path`() {
        expect.that(dataForOpen(Example.stream)).isEqualTo(mapOf(
            "realm_uri" to Example.stream["realm_uri"]!!,
            "user_id" to Example.stream["user_id"]!!.toInt(),
            "recipient_type" to "stream",
            "stream_name" to Example.stream["stream"]!!,
            "topic" to Example.stream["topic"]!!,
        ))
        expect.that(dataForOpen(Example.groupPm)).isEqualTo(mapOf(
            "realm_uri" to Example.groupPm["realm_uri"]!!,
            "user_id" to Example.groupPm["user_id"]!!.toInt(),
            "recipient_type" to "private",
            "pm_users" to "123,234,345",
        ))
        expect.that(dataForOpen(Example.pm)).isEqualTo(mapOf(
            "realm_uri" to Example.pm["realm_uri"]!!,
            "user_id" to Example.pm["user_id"]!!.toInt(),
            "recipient_type" to "private",
            "sender_email" to Example.pm["sender_email"]!!,
        ))
    }

    @Test
    fun `optional fields missing cause no error`() {
        expect.that(parse(Example.pm.minus("user_id")).identity.userId).isNull()
    }

    @Test
    fun `dataForOpen leaves out optional fields missing in input`() {
        val baseExpected = mapOf(
            "realm_uri" to Example.stream["realm_uri"]!!,
            "user_id" to Example.stream["user_id"]!!.toInt(),
            "recipient_type" to "stream",
            "stream_name" to Example.stream["stream"]!!,
            "topic" to Example.stream["topic"]!!,
        )
        expect.that(dataForOpen(Example.stream.minus("user_id")))
            .isEqualTo(baseExpected.minus("user_id"))
    }

    @Test
    fun `obsolete or novel fields have no effect`() {
        expect.that(parse(Example.pm.plus("user" to "client@example.com")))
            .isEqualTo(parse(Example.pm))
        expect.that(parse(Example.pm.plus("awesome_feature" to "behold!")))
            .isEqualTo(parse(Example.pm))
    }

    @Test
    fun `parse failures on malformed 'message'`() {
        assertParseFails(Example.pm.minus("server"))
        assertParseFails(Example.pm.minus("realm_id"))
        assertParseFails(Example.pm.plus("realm_id" to "12,34"))
        assertParseFails(Example.pm.plus("realm_id" to "abc"))
        assertParseFails(Example.pm.minus("realm_uri"))
        assertParseFails(Example.pm.plus("realm_uri" to "zulip.example.com"))
        assertParseFails(Example.pm.plus("realm_uri" to "/examplecorp"))

        assertParseFails(Example.stream.minus("recipient_type"))
        assertParseFails(Example.stream.minus("stream"))
        assertParseFails(Example.stream.minus("topic"))
        assertParseFails(Example.groupPm.minus("recipient_type"))
        assertParseFails(Example.groupPm.plus("pm_users" to "abc,34"))
        assertParseFails(Example.groupPm.plus("pm_users" to "12,abc"))
        assertParseFails(Example.groupPm.plus("pm_users" to "12,"))
        assertParseFails(Example.pm.minus("recipient_type"))
        assertParseFails(Example.pm.plus("recipient_type" to "nonsense"))

        assertParseFails(Example.pm.minus("sender_avatar_url"))
        assertParseFails(Example.pm.plus("sender_avatar_url" to "/avatar/123.jpeg"))
        assertParseFails(Example.pm.plus("sender_avatar_url" to ""))

        assertParseFails(Example.pm.minus("sender_id"))
        assertParseFails(Example.pm.minus("sender_email"))
        assertParseFails(Example.pm.minus("sender_full_name"))
        assertParseFails(Example.pm.minus("zulip_message_id"))
        assertParseFails(Example.pm.plus("zulip_message_id" to "12,34"))
        assertParseFails(Example.pm.plus("zulip_message_id" to "abc"))
        assertParseFails(Example.pm.minus("content"))
        assertParseFails(Example.pm.minus("time"))
        assertParseFails(Example.pm.plus("time" to "12:34"))
    }
}

class RemoveFcmMessageTest : FcmMessageTestBase() {
    object Example {
        val base = FcmMessageTestBase.Example.base.plus(sequenceOf(
            "event" to "remove"
        ))

        /// The Zulip server before v2.0 sends this form (plus some irrelevant fields).
        // TODO(server-2.0): Drop this, and the logic it tests.
        val singular = base.plus(sequenceOf(
            "zulip_message_id" to "123"
        ))

        /// Zulip servers starting at v2.0 (released 2019-02-28; commit 9869153ae)
        /// send a hybrid form.  (In practice the singular field has one of the
        /// same IDs found in the batch.)
        ///
        /// We started consuming the batch field in 23.2.111 (released 2019-02-28;
        /// commit 4acd07376).
        val hybrid = base.plus(sequenceOf(
            "zulip_message_ids" to "234,345",
            "zulip_message_id" to "123"
        ))

        /// Some future Zulip server (at least v2.1; after clients older than
        /// v23.2.111 are rare) may drop the singular field.
        val batched = base.plus(sequenceOf(
            "zulip_message_ids" to "123,234,345"
        ))

        internal val identity = FcmMessageTestBase.Example.identity
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
            RemoveFcmMessage(Example.identity, setOf(123, 234, 345))
        )
        expect.that(parse(Example.batched)).isEqualTo(
            RemoveFcmMessage(Example.identity, setOf(123, 234, 345))
        )
        expect.that(parse(Example.singular)).isEqualTo(
            RemoveFcmMessage(Example.identity, setOf(123))
        )
        expect.that(parse(Example.singular.minus("zulip_message_id"))).isEqualTo(
            // This doesn't seem very useful to send, but harmless.
            RemoveFcmMessage(Example.identity, setOf())
        )
    }

    @Test
    fun `optional fields missing cause no error`() {
        expect.that(parse(Example.hybrid.minus("user_id")).identity.userId).isNull()
    }

    @Test
    fun `parse failures on malformed data`() {
        assertParseFails(Example.hybrid.minus("server"))
        assertParseFails(Example.hybrid.minus("realm_id"))
        assertParseFails(Example.hybrid.plus("realm_id" to "abc"))
        assertParseFails(Example.hybrid.plus("realm_id" to "12,34"))
        assertParseFails(Example.hybrid.minus("realm_uri"))
        assertParseFails(Example.hybrid.plus("realm_uri" to "zulip.example.com"))
        assertParseFails(Example.hybrid.plus("realm_uri" to "/examplecorp"))

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
