/* @flow strict-local */
import type { IntlShape } from 'react-intl';
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { Auth, Topic, Message, Reaction, ReactionType, Narrow } from './api/apiTypes';
import type { AppStyles } from './styles/theme';

export type * from './reduxTypes';
export type * from './api/apiTypes';

/**
 * Assert a contradiction, statically.  Do nothing at runtime.
 *
 * The `empty` type is the type with no values.  So, apart from certain bugs
 * in Flow, the only way a call to this function can ever be valid is when
 * the type-checker can actually prove the call site is unreachable.
 *
 * Especially useful for statically asserting that a `switch` statement is
 * exhaustive:
 *
 *     type Foo =
 *       | {| type: 'frob', ... |}
 *       | {| type: 'twiddle', ... |};
 *
 *
 *     const foo: Foo = ...;
 *     switch (foo.type) {
 *       case 'frob': ...; break;
 *
 *       case 'twiddle': ...; break;
 *
 *       default:
 *         ensureUnreachable(foo); // Asserts no possible cases for `foo` remain.
 *         break;
 *     }
 *
 * In this example if by mistake a case is omitted, or if another case is
 * added to the type without a corresponding `case` statement here, then
 * Flow will report a type error at the `ensureUnreachable` call.
 */
export function ensureUnreachable(x: empty) {}

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
   * Use this to affect how we make some API requests, keeping the logic
   * isolated to the edge, where we communicate with the server, to keep with
   * the "crunchy shell" pattern (see docs/architecture/crunchy-shell.md), and
   * for Sentry reports.
   */
  zulipVersion?: string,

  /**
   * The last device token value the server has definitely heard from us.
   *
   * This is `null` until we make a successful request to the server to
   * tell it the token.
   *
   * See the `pushToken` property in `SessionState`, and docs linked there.
   */
  ackedPushToken: string | null,
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
export type Identity = $Diff<Auth, { apiKey: string }>;

export type EmojiType = 'image' | 'unicode';

/** An aggregate of all the reactions with one emoji to one message. */
export type AggregatedReaction = {|
  code: string,
  count: number,
  name: string,
  selfReacted: boolean,
  type: ReactionType,
  users: $ReadOnlyArray<number>,
|};

export type EditMessage = {|
  id: number,
  content: string,
  topic: string,
|};

export type Debug = {|
  doNotMarkMessagesAsRead: boolean,
|};

export type TopicExtended = {|
  ...$Exact<Topic>,
  isMuted: boolean,
  unreadCount: number,
|};

export type Context = {|
  styles: AppStyles,
|};

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
  reactions: Reaction[],
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
 * const { sender_id } = (message: Message | Outbox);  // error
 * ```
 * is not allowed. However, as long as you're prepared to handle values of
 * `undefined`, it's both JavaScript-legal to do so and occasionally convenient.
 *
 * We therefore construct an intermediate type which Flow recognizes as a
 * subtype of `Message | Outbox`, but which Flow will permit us to directly (and
 * soundly) destructure certain `Message`-only fields from:
 * ```
 * const { sender_id } = (message: MessageLike);  // ok!
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

export type LocalizableText = string | { text: string, values?: { [string]: string } };

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
 *
 * @prop intl - The full react-intl API, for more complex situations.
 */
export type GetText = {
  (string): string,
  intl: IntlShape,
};

export type UnreadStreamItem = {|
  key: string,
  streamName: string,
  unread: number,
  color: string,
  isMuted: boolean,
  isPinned: boolean,
  isPrivate: boolean,
  data: Array<{|
    key: string,
    topic: string,
    unread: number,
    isMuted: boolean,
    lastUnreadMsgId: number,
  |}>,
|};

export type RenderedTimeDescriptor = {|
  type: 'time',
  key: number | string,
  timestamp: number,
  firstMessage: Message | Outbox,
|};

export type RenderedMessageDescriptor = {|
  type: 'message',
  key: number | string,
  message: Message | Outbox,
  isBrief: boolean,
|};

export type RenderedSectionDescriptor = {|
  key: string | number,
  message: Message | Outbox | {||},
  data: $ReadOnlyArray<RenderedMessageDescriptor | RenderedTimeDescriptor>,
|};

export type TimingItemType = {|
  text: string,
  startMs: number,
  endMs: number,
|};

export type NamedUser = {|
  id: number,
  email: string,
  full_name: string,
|};

export type TabNavigationOptionsPropsType = {|
  isFocussed: boolean,
  tintColor: string,
|};

/**
 * Summary of a PM conversation (either 1:1 or group PMs).
 */
export type PmConversationData = {|
  ids: string,
  msgId: number,
  recipients: string,
  unread: number,
|};
