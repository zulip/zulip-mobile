/* @flow strict-local */
import type { Node } from 'react';
import type { IntlShape } from 'react-intl';
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { SubsetProperties } from './generics';
import type {
  Auth,
  Topic,
  Message,
  PmMessage,
  StreamMessage,
  ReactionType,
  UserId,
} from './api/apiTypes';
import type { ZulipVersion } from './utils/zulipVersion';
import type { PmKeyUsers } from './utils/recipient';

export type * from './generics';
export type * from './reduxTypes';
export type * from './api/apiTypes';
export type { Narrow } from './utils/narrow';

export { ensureUnreachable } from './generics';

/*
 * TODO as the name suggests, this should be broken down more specifically.
 * Each use should be one of ViewStyleProp, TextStyleProp, ImageStyleProp.
 */
export type Style = DangerouslyImpreciseStyleProp;

export type Orientation = 'LANDSCAPE' | 'PORTRAIT';

export type Dimensions = {|
  bottom: number,
  left: number,
  right: number,
  top: number,
|};

export type InputSelection = {|
  +start: number,
  +end: number,
|};

/**
 * An `Identity`, a secret, and some other per-identity information.
 *
 * This includes all the information the API client library
 * needs in order to talk to the server on the user's behalf.
 * Use `authOfAccount` to extract that information as an `Auth`,
 * the form used by the API client library.
 *
 * NB in particular this includes an API key, which must be handled with
 * care.
 *
 * Use `Identity` instead for code where an API key is not required,
 * with `identityOfAccount` to convert at the boundary.
 * TODO: move more code that way.
 */
export type Account = {|
  ...Auth,

  /**
   * The user's numeric ID.
   *
   * We learn the user ID each time we complete an initial fetch.
   *
   * This is `null` briefly when we've logged in but not yet completed our
   * first initial fetch on the account.  It's also `null` when representing
   * an account which was last used on a version of the app which didn't
   * record this information.  It's never `null` for an account for which we
   * have server data.
   */
  // A subtle key step in making that invariant true, that server data means
  // this isn't `null`, is migration 34 dropping server data after this was
  // added.  Otherwise on first startup after upgrade, we'd be using server
  // data from an initial fetch made when we didn't yet store this property.
  userId: UserId | null,

  /**
   * The version of the Zulip server.
   *
   * We learn the server's version from /server_settings at the start of the
   * login process, and again from /register when setting up an event queue.
   * Because a server deploy invalidates event queues, this means the value
   * is always up to date for a server we have an active event queue on.
   *
   * This is `null` just when representing an account which was last used on
   * a version of the app which didn't record this information.  It's never
   * `null` for an account for which we have server data.
   *
   * For use in:
   *  * how we make some API requests, in order to keep the logic isolated
   *    to the edge, where we communicate with the server, to keep with the
   *    "crunchy shell" pattern (see docs/architecture/crunchy-shell.md);
   *  * context data in Sentry reports.
   */
  // See discussion at userId for a subtle piece of why that not-null invariant holds.
  zulipVersion: ZulipVersion | null,

  /**
   * An integer indicating what features are available on the server.
   *
   * The feature level increases monotonically; a value of N means the
   * server supports all API features introduced before feature level N.
   * This is designed to provide a simple way for mobile apps to decide
   * whether the server supports a given feature or API change.
   *
   * This is `null` just when representing an account which was last used on
   * a version of the app which didn't record this information.  It's never
   * `null` for an account for which we have server data.
   *
   * Like zulipVersion, we learn the feature level from /server_settings
   * at the start of the login process, and again from /register when
   * setting up an event queue.
   */
  // See discussion at userId for a subtle piece of why that not-null invariant holds.
  zulipFeatureLevel: number | null,

  /**
   * The last device token value the server has definitely heard from us.
   *
   * This is `null` until we make a successful request to the server to
   * tell it the token.
   *
   * See the `pushToken` property in `SessionState`, and docs linked there.
   */
  ackedPushToken: string | null,

  /**
   * When the user last dismissed the server-not-set-up-for-notifs notice.
   *
   * `null` when the user hasn't dismissed this notice.
   *
   * "This notice" means the currently applicable notice. If the server does
   * get setup for push notifications, then gets un-setup, a new notice will
   * apply.
   */
  lastDismissedServerPushSetupNotice: Date | null,
|};

/**
 * An identity belonging to this user in some Zulip org, with no secrets.
 *
 * This should be used in preference to `Auth` or `Account` in code that
 * doesn't need to make (authenticated) requests to the server and only
 * needs to pick their own email or ID out of a list, use the org's base URL
 * to make a relative URL absolute, etc.
 *
 * Use `identityOfAuth` or `identityOfAccount` to make one of these where
 * you have an `Auth` or `Account`.
 */
export type Identity = $Diff<Auth, {| apiKey: string |}>;

export type EmojiType = 'image' | 'unicode';

/** An emoji, in a shape we can pass to @zulip/shared */
export type EmojiForShared = {| emoji_type: EmojiType, emoji_name: string, emoji_code: string |};

/** An aggregate of all the reactions with one emoji to one message. */
export type AggregatedReaction = {|
  code: string,
  count: number,
  name: string,
  selfReacted: boolean,
  type: ReactionType,
  users: $ReadOnlyArray<UserId>,
|};

/**
 * ID and original topic/content of an already-sent message that the
 * user is currently editing.
 */
export type EditMessage = {|
  id: number,
  content: string,
  topic: string,
|};

/** Add debug setting here. */
export type Debug = {||};

export type TopicExtended = {|
  ...$Exact<Topic>,
  isMuted: boolean,
  unreadCount: number,
|};

/**
 * Properties in common among the two different flavors of a
 * `Outbox`: `PmOutbox` and `StreamOutbox`.
 */
type OutboxBase = $ReadOnly<{|
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

  // `markdownContent` doesn't exist in `Message`.
  // It's used for sending the message to the server.
  markdownContent: string,

  ...SubsetProperties<
    // Could use `MessageBase` here.  Then Flow would check that the listed
    // properties are in `MessageBase`, rather than just in both branches of
    // `Message` but potentially separately.
    Message,
    {|
      avatar_url: mixed,
      content: mixed,
      id: mixed,
      reactions: mixed,
      sender_id: mixed,
      sender_email: mixed,
      sender_full_name: mixed,
      timestamp: mixed,
    |},
  >,
|}>;

export type PmOutbox = $ReadOnly<{|
  ...OutboxBase,

  ...SubsetProperties<
    PmMessage,
    {|
      type: mixed,
      display_recipient: mixed,
      subject: mixed,
    |},
  >,
|}>;

export type StreamOutbox = $ReadOnly<{|
  ...OutboxBase,

  ...SubsetProperties<
    StreamMessage,
    {|
      type: mixed,
      display_recipient: mixed,
      stream_id: mixed,
      subject: mixed,
    |},
  >,
|}>;

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
export type Outbox = PmOutbox | StreamOutbox;

/**
 * MessageLike: Imprecise alternative to `Message | Outbox`.
 *
 * Flow reasonably dispermits certain classes of access on union types. In
 * particular,
 * ```
 * const { match_content } = (message: Message | Outbox);  // error
 * ```
 * is not allowed. However, as long as you're prepared to handle values of
 * `undefined`, it's both JavaScript-legal to do so and occasionally convenient.
 *
 * We therefore construct an intermediate type which Flow recognizes as a
 * subtype of `Message | Outbox`, but which Flow will permit us to directly (and
 * soundly) destructure certain `Message`-only fields from:
 * ```
 * const { match_content } = (message: MessageLike);  // ok!
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
  | $ReadOnly<{|
      // $Shape<T> is unsound, per Flow docs, but $ReadOnly<$Shape<T>> is not
      ...$Shape<{| [$Keys<Message>]: void |}>,
      ...Outbox,
    |}>;

// Name and type copied from docs:
//   https://formatjs.io/docs/react-intl/api/#formatmessage
type MessageFormatPrimitiveValue = string | number | boolean | null | void;

/**
 * A string to show, translated, in the UI as a plain string.
 *
 * For when formatting is needed (and possible), see `LocalizableReactText`.
 */
export type LocalizableText =
  | string
  | {| +text: string, +values?: {| +[string]: MessageFormatPrimitiveValue |} |};

/**
 * A string to show, translated, in the UI as a React node.
 *
 * Here the values can be React nodes, and so the translated result will be
 * a React node.  For when the result is a plain string and React nodes
 * aren't permitted in the values, see `LocalizableText`.
 */
export type LocalizableReactText =
  | string
  | {| +text: string, +values?: {| +[string]: MessageFormatPrimitiveValue | Node |} |};

/**
 * Usually called `_`, and invoked like `_('Message')` -> `'Nachricht'`.
 *
 * To use, put these two lines at the top of a React component's body:
 *
 *     static contextType = TranslationContext;
 *     context: GetText;
 *
 * and then in methods, say `const _ = this.context`.
 *
 * Alternatively, for when `context` is already in use: use `withGetText`
 * and then say `const { _ } = this.props`.
 */
export type GetText = {|
  (message: string, values?: {| +[string]: MessageFormatPrimitiveValue |}): string,

  /** Convenient in contexts where callers pass `LocalizableText`. */
  (message: LocalizableText): string,

  /** The full react-intl API, for more complex situations. */
  intl: IntlShape,
|};

export type TimeMessageListElement = {|
  type: 'time',

  // TODO(facebook/flow#4509): Read-only tuple type, when supported
  key: [number, 0],

  timestamp: number,
  subsequentMessage: Message | Outbox,
|};

export type MessageMessageListElement = {|
  type: 'message',

  // TODO(facebook/flow#4509): Read-only tuple type, when supported
  key: [number, 2],

  message: Message | Outbox,
  isBrief: boolean,
|};

export type HeaderMessageListElement = {|
  type: 'header',

  // TODO(facebook/flow#4509): Read-only tuple type, when supported
  key: [number, 1],

  style: 'topic+date' | 'full',
  subsequentMessage: Message | Outbox,
|};

/**
 * Data object for a unit in the message list.
 *
 * Formerly called "message peers" and "HTML piece descriptors".
 *
 * A list of these is sortable by the `key` property, which holds a tuple
 * with two members:
 * - `.key[0]` is the message ID that the MessageListElement is related to.
 * - `.key[1]` is an integer representing whether the element is a
 *   TimeMessageListElement (0), HeaderMessageListElement (1), or
 *   MessageMessageListElement (2). The message list should present them in
 *   that order (0-2).
 *
 * See generateInboundEventEditSequence for where we implement the compare
 * function for `key`.
 */
export type MessageListElement =
  | TimeMessageListElement
  | MessageMessageListElement
  | HeaderMessageListElement;

// Check that all FooMessageListElement.key is reasonable.
//
// TODO(facebook/flow#4509): $ReadOnlyArray<number> is a proxy for tuple
//   type [number, number] with its two members marked as covariant. Flow
//   has no syntax for that yet.
// eslint-disable-next-line no-unused-expressions
(k: MessageListElement['key']): $ReadOnlyArray<number> => k;

export type TimingItemType = {|
  text: string,
  startMs: number,
  endMs: number,
|};

/**
 * Summary of a PM conversation (either 1:1 or group PMs).
 */
export type PmConversationData = {|
  /**
   * A comma-separated (numerically-)sorted sequence of the IDs of the users
   * involved in this conversation.  Omits the self-user just if there are
   * exactly two recipients.
   *
   * (This unusual specification is intended to simultaneously match the
   * disjoint key-spaces of `unreadPms` and `unreadHuddles`.)
   */
  key: string,

  keyRecipients: PmKeyUsers,

  /** The most recent message in this conversation. */
  msgId: number,

  /** The count of unread messages in this conversation. */
  unread: number,
|};
