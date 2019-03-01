/* @flow strict-local */
import type { IntlShape } from 'react-intl';
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { Auth, Topic, Message, Reaction, Narrow, RealmBot, User } from './api/apiTypes';
import type { AppStyles } from './styles/theme';

export type * from './reduxTypes';
export type * from './api/apiTypes';

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

export type InputSelectionType = {|
  start: number,
  end: number,
|};

/**
 * An `Identity`, a secret, and some other per-identity information.
 *
 * At present this consists of just the information the API client library
 * needs in order to talk to the server on the user's behalf, aka `Auth`.
 * NB in particular this includes an API key.
 *
 * In the future this might contain other metadata, if useful.
 *
 * See also `Identity`, which should be used instead where an API key is
 * not required.
 * TODO: move more code that way.
 */
export type Account = {|
  ...Auth,

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
 */
export type Identity = $Diff<Auth, { apiKey: string }>;

/**
 * A Zulip user/account, which might be a cross-realm bot.
 */
export type UserOrBot = User | RealmBot;

/** An aggregate of all the reactions with one emoji to one message. */
export type AggregatedReaction = {|
  code: string,
  count: number,
  name: string,
  selfReacted: boolean,
  type: string,
|};

export type EditMessage = {|
  id: number,
  content: string,
  topic: string,
|};

export type Debug = {|
  highlightUnreadMessages: boolean,
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
 * See also `Message`.
 */
export type Outbox = {|
  isOutbox: true,
  isSent: boolean,

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

  // These fields are always absent here, but can appear in `Message`.  We
  // mention them here only to reassure Flow that they'll never be something
  // more interesting than `undefined`, in order to type-check accesses on
  // values of type `Message | Outbox`.
  last_edit_timestamp?: void,
  match_content?: void,
|};

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

export type NotificationCommon = {|
  alert: string,
  content: string,
  content_truncated: string, // boolean
  'google.message_id': string,
  'google.sent_time': number,
  'google.ttl': number,
  event: 'message',
  realm_id: string, // string
  sender_avatar_url: string,
  sender_email: string, // email
  sender_full_name: string,
  sender_id: string,
  server: string,
  time: string,
  user: string,
  zulip_message_id: string,
|};

export type NotificationPrivate = {|
  ...$Exact<NotificationCommon>,
  recipient_type: 'private',
|};

export type NotificationGroup = {|
  ...$Exact<NotificationCommon>,
  pm_users: string, // comma separated ids
  recipient_type: 'private',
|};

export type NotificationStream = {|
  ...$Exact<NotificationCommon>,
  recipient_type: 'stream',
  stream: string,
  topic: string,
|};

export type Notification = NotificationPrivate | NotificationGroup | NotificationStream;

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
  timestamp: number,
  unread: number,
|};
