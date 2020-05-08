// @flow strict-local

import type { Message, Narrow, Reaction } from '../api/apiTypes';

// After 2 hours a message is assumed to be too old to be relevant.
// TODO: make this user-configurable.
export const DECAY_TIME_MS = 1000 * 60 * 60 * 2;

/*
  The world being, as it is, imperfect, outbox messages often fail to be sent.
  We divide these messages up into two categories based on this fact.

  Outbox messages with a "terminal" status are exactly those which the app has
  given up on ever being able to send. These messages will:
    - be visibly marked as unsendable (red X) in the UI;
    - never be automatically re-sent;
    - never be purged without explicit user action;
    - (TODO) cause counts to appear in higher-level UI, similar to and alongside
      counts of unread incoming messages.

  Outbox messages with a "transient" status are exactly those which the app has
  not yet given up on being able to send. These messages will:
    - be visibly marked as attempting-to-send (spinner) in the UI;
    - be sent whenever message-sending is done (if they haven't yet been sent
      successfully);
    - decay into "age" failures (a kind of terminal status) after DECAY_TIME_MS
      have passed since their first attempted sending.

  Outbox messages which have been sent, and confirmed to be sent, are no longer
  outbox messages at all.


  State transition diagram (high-level overview):

  ```
                ┌───────────┐      ┌──────────┐
  (start)━━━━━━▶│ transient ┝━━━━━▶│ terminal │
                └─────┰─────┘      └──────────┘
                      ┃
                      ┗━━━━▶(done)
  ```

  The transient state has two substates, corresponding to various phases of the
  process of sending a message; similarly, the terminal state has several
  substates, corresponding to different reasons to give up on doing so. (Where
  there is no ambiguity, as is usually the case, we will refer to both the
  "superstates" and their substates simply as "states".)

  N.B.: all terminal states are error-states, but not all error-states are
  terminal.


  State transition diagram (mid-level overview):

  ```
                                            ┌──────────────────┐
              ┌───────────────────┐         │     terminal     │
              │     transient     │         ├──────────────────┤
              ├───────────────────┤         │ ┌──────────────┐ │
              │ ┌──────────┐      │         │ │ client error │ │
  (start)━━━━━┿▶│ enqueued │      │   [1]   │ └──────────────┘ │   [2]
              │ └────┰─────┘      ┝━━━━━━━━▶│ ┌──────────────┐ ┝ ━ ━ ━ ━X
              │      ┃            │         │ │      age     │ │
              │      ┃   ┌──────┐ │         │ └──────────────┘ │
              │      ┗━━▶│ sent │ │         │ ┌──────────────┐ │
              │          └──┱───┘ │         │ │      ...     │ │
              └─────────────╂─────┘         │ └──────────────┘ │
                            ┃               └──────────────────┘
                       [3]  ┗━━▶(deleted)
  ```

  [1] Any transient state may become terminal. (In practice, only some of the
    possible substate transitions actually occur; this arrow stands in for a
    number of smaller arrows.)

  [2] The terminal state is almost exactly that. There is no transition out of
    the terminal state, nor even from one terminal substate to another, except
    when explicitly directed by the user.

  [3] Sent messages remain in the outbox, and are deleted once the processed
    message is received from the server. This normally occurs as an
    EVENT_NEW_MESSAGE, but it may also be part of a queue refresh.


  ## Transient states

  The set of transient states is closed. (As this is a strictly-internal API, in
  practice this means that new states are unlikely to be added, not impossible.)

  ### The "enqueued" state

  This is the initial state of all messages.

  A message will typically transition out of this state by being sent (and going
  to "sent") or failing to be sent in some recognizably-irrecoverable way (and
  going to an appropriate terminal state, usually "client error").

  Messages will usually not remain in this state for long: whenever a message is
  created or an initial fetch is performed, an attempt is made to send any
  enqueued messages.

    * (Technically, only the oldest enqueued message will ever have an attempt
      made to send it; it must transition away from this state before the
      next-oldest message will get its turn.)

  A message remains in this state if it cannot be sent due to a server error
  (including a network timeout); such an error is stored as part of the status
  [TODO and may be viewed by the user on long-press].

  It is possible for sending to fail multiple times; only the most recent such
  error is stored.

  [TODO: distinguish in UI somehow.]

  ### The "sent" state

  The "sent" state is a sort of liminal state between `Outbox` and `Message`. An
  outbox message transitions to the "sent" state when a API call to send it has
  successfully concluded. However, that sending isn't considered to be finalized
  (and, therefore, the message no longer an outbox message) until it's been
  received from the Zulip server as an _incoming_ message. This normally occurs
  as an EVENT_NEW_MESSAGE, but it may also be part of a queue refresh.

  #### Decay of the "sent" state

  The "sent" state is a transient state! If the finalization never occurs, it's
  possible for this status to decay into an "age" failure (q.v. infra). This is
  considered a program error, and will be reported as such to Sentry.

  It _is_ possible for this to happen in normal operation, but it requires
  precise unfortunate timing; the period between a completed send-request and
  its finalization should normally be on the order of one second or less.

  If a confirmation is later received for that message as an EVENT_NEW_MESSAGE,
  it will not be deleted (although a follow-up event will also be sent to
  Sentry).

  ## Terminal states

  ### The "client error" state

  When a message fails with an HTTP error which is presumed to indicate a bug in
  the client, it enters this state.

  The actual error message is preserved here, for display to the user and
  (possibly) later reporting to Sentry.

  ### The "age" state

  When a message in a transient state is older than DECAY_TIME_MS, it's moved to
  the "age" state.

  This is expected to happen in normal operation if (for example) a message is
  composed while out of service, and expires before service is restored. A
  message entering this state is not ordinarily considered a Sentry-worthy event
  (although see 'Decay of the "sent" state', above).

  ### The "misc" state

  This is a catch-all state, intended to represent any classes of error not
  considered above.

  It is assumed that any message's entrance into this state is a Sentry-worthy
  event.

 */

export type OutboxStatus = { ... }; /* omitted */

/**
 * A message we're in the process of sending.
 *
 * We use these objects for two purposes:
 *
 * (a) They make up the queue of messages the user has asked us to send, and
 *     which we'll retry sending if initial attempts fail.  See
 *     `trySendMessages`.
 *
 * (b) We show them immediately in the message list, even before we've
 *     successfully gotten them to the server (but with an activity
 *     indicator to show we're still working on them.)
 *
 * Even after (a) is complete for a given message, we still need the
 * `Outbox` object for the sake of (b), until we hear an `EVENT_NEW_MESSAGE`
 * event from the server that lets us replace it with the corresponding
 * `Message` object.
 *
 * This type most often appears in the union `Message | Outbox`, and so its
 * properties are deliberately similar to those of `Message`.
 */
export type Outbox = {|
  /** Used for distinguishing from a `Message` object. */
  isOutbox: true,

  /**
   * False until we successfully send the message, then true.
   *
   * As described in the type's jsdoc (above), once we've sent the message
   * we still keep the `Outbox` object around for a (usually short) time
   * until we can replace it with a `Message` object.
   */
  isSent: boolean,

  // These fields don't exist in `Message`.
  // They're used for sending the message to the server.
  markdownContent: string,
  narrow: Narrow,

  // These fields are modeled on `Message`.
  avatar_url: string | null,
  content: string,
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  id: number,
  reactions: $ReadOnlyArray<Reaction>,
  sender_email: string,
  sender_full_name: string,
  subject: string,
  timestamp: number,
  type: 'stream' | 'private',
|};

/**
 * MessageLike: Imprecise alternative to `Message | Outbox`.
 *
 * Flow reasonably dispermits certain classes of access on union types. In
 * particular,
 * ```
 *   const { sender_id } = (message: Message | Outbox);  // error
 * ```
 * is not allowed. However, as long as you're prepared to handle values of
 * `undefined`, it's both JavaScript-legal to do so and occasionally convenient.
 *
 * We therefore construct an intermediate type which Flow recognizes as a
 * subtype of `Message | Outbox`, but which Flow will permit us to directly (and
 * soundly) destructure certain `Message`-only fields from:
 * ```
 *   const { sender_id } = (message: MessageLike);  // ok!
 * ```
 *
 * * Note: `MessageLike` <: `Message | Outbox`, but the converse does not hold.
 *   It is therefore strongly advised _never_ to use `MessageLike` as either an
 *   argument or return type; instead, always accept and produce values of
 *   `Message | Outbox`, and cast them to `MessageLike` at their use-site when
 *   necessary.
 *
 * * Note 2: This class is asymmetric mostly because there is no current use case
 *   for accessing Outbox-only fields on a `Message | Outbox`.
 *
 */
export type MessageLike =
  | $ReadOnly<Message>
  | $ReadOnly<{
      // $Shape<T> is unsound, per Flow docs, but $ReadOnly<$Shape<T>> is not
      ...$Shape<{ [$Keys<Message>]: void }>,
      ...Outbox,
    }>;
