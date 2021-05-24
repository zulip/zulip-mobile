/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';
import Immutable from 'immutable';

import type {
  CrossRealmBot,
  Message,
  PmMessage,
  StreamMessage,
  PmRecipientUser,
  Reaction,
  Stream,
  Subscription,
  User,
  UserGroup,
  UserId,
} from '../../api/modelTypes';
import { makeUserId } from '../../api/idTypes';
import type {
  AccountSwitchAction,
  LoginSuccessAction,
  RealmInitAction,
  MessageFetchStartAction,
  MessageFetchCompleteAction,
  Action,
  GlobalState,
  CaughtUpState,
  MessagesState,
  RealmState,
} from '../../reduxTypes';
import type { Auth, Account, OutboxBase, StreamOutbox } from '../../types';
import { UploadedAvatarURL } from '../../utils/avatar';
import { ZulipVersion } from '../../utils/zulipVersion';
import {
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  REALM_INIT,
  EVENT_NEW_MESSAGE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
} from '../../actionConstants';
import rootReducer from '../../boot/reducers';
import { authOfAccount } from '../../account/accountMisc';
import { HOME_NARROW } from '../../utils/narrow';
import type { BackgroundData } from '../../webview/MessageList';
import { getStreamsById, getStreamsByName } from '../../selectors';

/* ========================================================================
 * Utilities
 *
 * Generators for primitive data types.
 */

/**
 * Generate a new (nonzero) timestamp, suitable for many uninteresting purposes.
 *
 * Counts up approximately forever in increments of 1000.
 */
const makeTime: () => number = (() => {
  const startTime = 10 ** 13; // 2286-11-20
  let calls = 0;
  return () => startTime + 1000 * ++calls;
})();

/** Return an integer 0 <= N < end, roughly uniformly at random. */
const randInt = (end: number) => Math.floor(Math.random() * end);

/**
 * Return a factory for unique integers 0 <= N < end.
 *
 * The factory will throw if it ever runs out of integers in its set. Both
 * initialization and use should be O(1).
 */
const makeUniqueRandInt = (itemsType: string, end: number): (() => number) => {
  // Sparse array. Pretends to be initialized to iota.
  const deck = new Array(end);

  return () => {
    if (deck.length === 0) {
      throw new Error(`ran out of ${itemsType}`);
    }
    // Perform a single step of the Fisher-Yates shuffle...
    const leftIndex = randInt(deck.length);
    const rightIndex = deck.length - 1;
    const leftValue = deck[leftIndex] ?? leftIndex;
    const rightValue = deck[rightIndex] ?? rightIndex;
    deck[leftIndex] = rightValue;
    /* deck[rightIndex] = leftValue; */

    // ... but, instead of storing the new final value, "pop" it off the end and
    // return it.
    --deck.length;
    return leftValue;
  };
};

/** Return a string that's almost surely different every time. */
export const randString = (): string => randInt(2 ** 54).toString(36);

const intRange = (start, len) => Array.from({ length: len }, (k, i) => i + start);

/** A string with diverse characters to exercise encoding/decoding bugs. */
/* eslint-disable prefer-template */
export const diverseCharacters: string =
  // The whole range of lowest code points, including control codes
  // and ASCII punctuation like `"` and `&` used in various syntax...
  String.fromCharCode(...intRange(0, 0x100))
  // ... some characters from other scripts...
  + 'いい文字🎇'
  // ... some unpaired surrogates, which JS strings can have...
  + String.fromCharCode(...intRange(0xdbf0, 0x20))
  // ... some characters beyond the BMP (≥ U+10000)...
  + '𐂷𠂢'
  // ... and some code points at the very end of the Unicode range.
  + String.fromCodePoint(...intRange(0x10fff0, 0x10));

/* ========================================================================
 * Users and bots
 */

type UserOrBotPropertiesArgs = {|
  name?: string,
  user_id?: number, // accept a plain number, for convenience in tests
|};

const randUserId: () => UserId = (mk => () => makeUserId(mk()))(
  makeUniqueRandInt('user IDs', 10000),
);
const userOrBotProperties = ({ name: _name, user_id }: UserOrBotPropertiesArgs) => {
  const name = _name ?? randString();
  const capsName = name.substring(0, 1).toUpperCase() + name.substring(1);
  return deepFreeze({
    // Internally the UploadedAvatarURL mutates itself for memoization.
    // That conflicts with the deepFreeze we do for tests; so construct it
    // here with a full-blown URL object in the first place to prevent that.
    avatar_url: new UploadedAvatarURL(new URL(`https://zulip.example.org/yo/avatar-${name}.png`)),

    date_joined: `2014-04-${randInt(30)
      .toString()
      .padStart(2, '0')}`,

    email: `${name}@example.org`,
    full_name: `${capsName} User`,
    is_admin: false,
    timezone: 'UTC',
    user_id: user_id != null ? makeUserId(user_id) : randUserId(),
  });
};

/** Beware! These values may not be representative. */
export const makeUser = (args: UserOrBotPropertiesArgs = Object.freeze({})): User =>
  deepFreeze({
    ...userOrBotProperties(args),

    is_bot: false,
    // bot_type omitted
    // bot_owner omitted

    is_guest: false,

    // profile_data omitted
  });

/** Beware! These values may not be representative. */
export const makeCrossRealmBot = (
  args: UserOrBotPropertiesArgs = Object.freeze({}),
): CrossRealmBot =>
  deepFreeze({
    ...userOrBotProperties(args),
    is_bot: true,
  });

export const realm: URL = new URL('https://zulip.example.org');

export const zulipVersion: ZulipVersion = new ZulipVersion('2.1.0-234-g7c3acf4');

export const zulipFeatureLevel = 1;

export const makeAccount = (
  args: {|
    user?: User,
    email?: string,
    realm?: URL,
    apiKey?: string,
    userId?: UserId | null,
    zulipFeatureLevel?: number | null,
    zulipVersion?: ZulipVersion | null,
    ackedPushToken?: string | null,
  |} = Object.freeze({}),
): Account => {
  const {
    user = makeUser({ name: randString() }),
    userId = user.user_id,
    email = user.email,
    realm: realmInner = realm,
    apiKey = randString() + randString(),
    zulipFeatureLevel: zulipFeatureLevelInner = zulipFeatureLevel,
    zulipVersion: zulipVersionInner = zulipVersion,
    ackedPushToken = null,
  } = args;
  return deepFreeze({
    realm: realmInner,
    userId,
    email,
    apiKey,
    zulipFeatureLevel: zulipFeatureLevelInner,
    zulipVersion: zulipVersionInner,
    ackedPushToken,
  });
};

const randUserGroupId: () => number = makeUniqueRandInt('user group IDs', 10000);
export const makeUserGroup = (extra?: $Rest<UserGroup, { ... }>): UserGroup => {
  const baseUserGroup = {
    description: 'My favorite group',
    id: randUserGroupId(),
    members: [randUserId(), randUserId(), randUserId()],
    name: 'Mobile app enthusiasts',
  };

  return deepFreeze({ ...baseUserGroup, ...extra });
};

export const selfUser: User = makeUser({ name: 'self' });
export const selfAccount: Account = makeAccount({
  user: selfUser,
  realm,
});
export const selfAuth: Auth = deepFreeze(authOfAccount(selfAccount));

export const otherUser: User = makeUser({ name: 'other' });
export const thirdUser: User = makeUser({ name: 'third' });

export const crossRealmBot: CrossRealmBot = makeCrossRealmBot({ name: 'bot' });

/* ========================================================================
 * Streams and subscriptions
 */

const randStreamId: () => number = makeUniqueRandInt('stream IDs', 1000);
export const makeStream = (
  args: {| name?: string, description?: string |} = Object.freeze({}),
): Stream => {
  const name = args.name ?? randString();
  const description = args.description ?? `On the ${randString()} of ${name}`;
  return deepFreeze({
    stream_id: randStreamId(),
    name,
    description,
    invite_only: false,
    is_announcement_only: false,
    history_public_to_subscribers: true,
  });
};

export const stream: Stream = makeStream({
  name: 'a stream',
  description: 'An example stream.',
});

/** A subscription, by default to eg.stream. */
export const makeSubscription = (
  args: {| stream?: Stream, in_home_view?: boolean |} = Object.freeze({}),
): Subscription => {
  const { stream: streamInner = stream, in_home_view } = args;
  return deepFreeze({
    ...streamInner,
    color: '#123456',
    in_home_view: in_home_view ?? true,
    pin_to_top: false,
    audible_notifications: false,
    desktop_notifications: false,
    email_address: '??? make this value representative before using in a test :)',
    is_old_stream: true,
    push_notifications: null,
    stream_weekly_traffic: 84,
  });
};

/** A subscription to eg.stream. */
export const subscription: Subscription = makeSubscription();

/* ========================================================================
 * Messages
 */

export const unicodeEmojiReaction: Reaction = deepFreeze({
  user_id: randUserId(),
  reaction_type: 'unicode_emoji',
  emoji_code: '1f44d',
  emoji_name: 'thumbs_up',
});

export const displayRecipientFromUser = (user: User): PmRecipientUser => {
  const { email, full_name, user_id: id } = user;
  return deepFreeze({
    email,
    full_name,
    id,
    is_mirror_dummy: false,
    short_name: '', // what is this, anyway?
  });
};

/** Boring properties common to all example Message objects. */
const messagePropertiesBase = deepFreeze({
  isOutbox: false,

  // match_content omitted
  // match_subject omitted

  // flags omitted

  edit_history: [],
  is_me_message: false,
  // last_edit_timestamp omitted
  reactions: [],
  submessages: [],
});

const messagePropertiesFromSender = (user: User) => {
  const { user_id: sender_id, email: sender_email, full_name: sender_full_name } = user;

  return deepFreeze({
    sender_domain: '',
    avatar_url: user.avatar_url,
    client: 'ExampleClient',
    gravatar_hash: 'd3adb33f',
    sender_email,
    sender_full_name,
    sender_id,
    sender_realm_str: 'zulip',
    sender_short_name: '',
  });
};

const randMessageId: () => number = makeUniqueRandInt('message ID', 10000000);

/**
 * A PM, by default a 1:1 from eg.otherUser to eg.selfUser.
 *
 * Beware! These values may not be representative.
 *
 * NB that the resulting value has no `flags` property.  This matches what
 * we expect in `state.messages`, but not some other contexts; see comment
 * on the `flags` property of `Message`.  For use in an `EVENT_NEW_MESSAGE`
 * action, pass to `mkActionEventNewMessage`.
 */
export const pmMessage = (args?: {|
  ...$Rest<PmMessage, { ... }>,
  sender?: User,
  recipients?: User[],
  sender_id?: number, // accept a plain number, for convenience in tests
|}): PmMessage => {
  // The `Object.freeze` is to work around a Flow issue:
  //   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  const {
    sender_id = undefined,
    sender = sender_id != null ? makeUser({ user_id: sender_id }) : otherUser,
    recipients = [otherUser, selfUser],
    ...extra
  } = args ?? Object.freeze({});

  const baseMessage: PmMessage = {
    ...messagePropertiesBase,
    ...messagePropertiesFromSender(sender),

    content: 'This is an example PM message.',
    content_type: 'text/markdown',
    // We don't sort the recipients, because they're inconsistently sorted
    // in real messages.  (See comments on the Message type.)
    display_recipient: recipients.map(displayRecipientFromUser),
    id: randMessageId(),
    subject: '',
    timestamp: 1556579160,
    type: 'private',
  };

  return deepFreeze({
    ...baseMessage,
    ...extra,
  });
};

export const pmMessageFromTo = (
  from: User,
  to: User[],
  extra?: $Rest<PmMessage, { ... }>,
): PmMessage => pmMessage({ sender: from, recipients: [from, ...to], ...extra });

const messagePropertiesFromStream = (stream1: Stream) => {
  const { stream_id, name: display_recipient } = stream1;
  return deepFreeze({
    display_recipient,
    stream_id,
  });
};

/**
 * A stream message, by default in eg.stream sent by eg.otherUser.
 *
 * Beware! These values may not be representative.
 *
 * NB that the resulting value has no `flags` property.  This matches what
 * we expect in `state.messages`, but not some other contexts; see comment
 * on the `flags` property of `Message`.  For use in an `EVENT_NEW_MESSAGE`
 * action, pass to `mkActionEventNewMessage`.
 */
export const streamMessage = (args?: {|
  ...$Rest<StreamMessage, { ... }>,
  stream?: Stream,
  sender?: User,
|}): StreamMessage => {
  // The `Object.freeze` is to work around a Flow issue:
  //   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  const { stream: streamInner = stream, sender = otherUser, ...extra } = args ?? Object.freeze({});

  const baseMessage: StreamMessage = {
    ...messagePropertiesBase,
    ...messagePropertiesFromSender(sender),
    ...messagePropertiesFromStream(streamInner),

    content: 'This is an example stream message.',
    content_type: 'text/markdown',
    id: randMessageId(),
    subject: 'example topic',
    subject_links: [],
    timestamp: 1556579727,
    type: 'stream',
  };

  return deepFreeze({ ...baseMessage, ...extra });
};

/** Construct a MessagesState from a list of messages. */
export const makeMessagesState = (messages: Message[]): MessagesState =>
  Immutable.Map(messages.map(m => [m.id, m]));

/* ========================================================================
 * Outbox messages
 *
 * (Only stream messages for now. Feel free to add PMs, if you need them.)
 */

/**
 * Properties in common among PM and stream outbox messages, with no
 *   interesting data.
 */
const outboxMessageBase: $Diff<OutboxBase, {| id: mixed, timestamp: mixed |}> = deepFreeze({
  isOutbox: true,
  isSent: false,
  avatar_url: selfUser.avatar_url,
  content: '<p>Test.</p>',
  // id: ...,
  markdownContent: 'Test.',
  reactions: [],
  sender_email: selfUser.email,
  sender_full_name: selfUser.full_name,
  sender_id: selfUser.user_id,
  // timestamp: ...,
});

/**
 * Create a stream outbox message from an interesting subset of its
 *   data.
 *
 * `.id` is always identical to `.timestamp` and should not be supplied.
 */
export const streamOutbox = (data: $Shape<$Diff<StreamOutbox, {| id: mixed |}>>): StreamOutbox => {
  const { timestamp } = data;

  const outputTimestamp = timestamp ?? makeTime() / 1000;
  return deepFreeze({
    ...outboxMessageBase,
    type: 'stream',
    display_recipient: stream.name,
    subject: 'test topic',

    ...data,
    id: outputTimestamp,
    timestamp: outputTimestamp,
  });
};

/* ========================================================================
 * Redux state
 */

const privateReduxStore = createStore(rootReducer);

/**
 * The global Redux state, at its initial value.
 *
 * See `plusReduxState` for a version of the state that incorporates
 * `selfUser` and other standard example data.
 */
export const baseReduxState: GlobalState = deepFreeze(privateReduxStore.getState());

/**
 * A global Redux state, with `baseReduxState` plus the given data.
 *
 * See `reduxStatePlus` for a version that automatically includes `selfUser`
 * and other standard example data.
 */
export const reduxState = (extra?: $Rest<GlobalState, { ... }>): GlobalState =>
  deepFreeze({
    ...baseReduxState,
    ...extra,
  });

/**
 * The global Redux state, reflecting standard example data like `selfUser`.
 *
 * This approximates what the state might look like at a time when the app
 * is showing its main UI: so when the user has logged into some account and
 * we have our usual server data for it.
 *
 * In particular:
 *  * The self-user is `selfUser`.
 *  * Users `otherUser` and `thirdUser` also exist.
 *  * The stream `stream` exists, with subscription `subscription`.
 *
 * More generally, each object in the Zulip app model -- a user, a stream,
 * etc. -- that this module exports as a constant value (rather than only as
 * a function to make a value) will typically appear here.
 *
 * That set will grow over time, so a test should never rely on
 * `plusReduxState` containing only the things it currently contains.  For
 * example, it should not assume there are only three users, even if that
 * happens to be true now.  If the test needs a user (or stream, etc.) that
 * isn't in this state, it should create the user privately for itself, with
 * a helper like `makeUser`.
 *
 * On the other hand, a test *can* rely on an item being here if it
 * currently is here.  So for example a test which uses `plusReduxState` can
 * assume it contains `otherUser`; it need not, and should not bother to,
 * add `otherUser` to the state.
 *
 * See `baseReduxState` for a minimal version of the state.
 */
export const plusReduxState: GlobalState = reduxState({
  accounts: [
    {
      ...selfAuth,
      userId: selfUser.user_id,
      ackedPushToken: null,
      zulipVersion,
      zulipFeatureLevel,
    },
  ],
  realm: { ...baseReduxState.realm, user_id: selfUser.user_id, email: selfUser.email },
  // TODO add crossRealmBot
  users: [selfUser, otherUser, thirdUser],
  streams: [stream],
  subscriptions: [subscription],
});

/**
 * A global Redux state, adding the given data to `plusReduxState`.
 *
 * This automatically includes standard example data like `selfUser` and
 * `otherUser`, so that there's no need to add those explicitly.  See
 * `plusReduxState` for details on what's included.
 *
 * See `reduxState` for a version starting from a minimal state.
 */
export const reduxStatePlus = (extra?: $Rest<GlobalState, { ... }>): GlobalState =>
  deepFreeze({ ...plusReduxState, ...extra });

export const realmState = (extra?: $Rest<RealmState, { ... }>): RealmState =>
  deepFreeze({
    ...baseReduxState.realm,
    ...extra,
  });

/* ========================================================================
 * Actions
 *
 * Complete actions which need no further data.
 */

export const action = Object.freeze({
  account_switch: (deepFreeze({
    type: ACCOUNT_SWITCH,
    index: 0,
  }): AccountSwitchAction),
  login_success: (deepFreeze({
    type: LOGIN_SUCCESS,
    realm: selfAccount.realm,
    email: selfAccount.email,
    apiKey: selfAccount.apiKey,
  }): LoginSuccessAction),
  realm_init: (deepFreeze({
    type: REALM_INIT,
    data: {
      last_event_id: 34,
      msg: '',
      queue_id: 1,
      alert_words: [],
      max_message_id: 100,
      muted_topics: [],
      muted_users: [],
      presences: {},
      max_icon_file_size: 3,
      realm_add_emoji_by_admins_only: true,
      realm_allow_community_topic_editing: true,
      realm_allow_edit_history: true,
      realm_allow_message_deleting: true,
      realm_allow_message_editing: true,
      realm_authentication_methods: { GitHub: true, Email: true, Google: true },
      realm_available_video_chat_providers: {},
      realm_bot_creation_policy: 3,
      realm_bot_domain: 'example.com',
      realm_create_stream_by_admins_only: true,
      realm_default_language: 'en',
      realm_default_twenty_four_hour_time: true,
      realm_description: 'description',
      realm_disallow_disposable_email_addresses: true,
      realm_email_auth_enabled: true,
      realm_email_changes_disabled: true,
      realm_google_hangouts_domain: '',
      realm_icon_source: 'U',
      realm_icon_url: 'example.com/some/path',
      realm_inline_image_preview: true,
      realm_inline_url_embed_preview: true,
      realm_invite_by_admins_only: true,
      realm_invite_required: true,
      realm_is_zephyr_mirror_realm: true,
      realm_mandatory_topics: true,
      realm_message_content_delete_limit_seconds: 3,
      realm_message_content_edit_limit_seconds: 3,
      realm_message_retention_days: 3,
      realm_name: 'Test',
      realm_name_changes_disabled: true,
      realm_notifications_stream_id: 3,
      realm_password_auth_enabled: true,
      realm_presence_disabled: true,
      realm_restricted_to_domain: true,
      realm_send_welcome_emails: true,
      realm_show_digest_email: true,
      realm_signup_notifications_stream_id: 3,
      realm_uri: selfAccount.realm.toString(),
      realm_video_chat_provider: 1,
      realm_waiting_period_threshold: 3,
      zulip_feature_level: 1,
      realm_emoji: {},
      realm_filters: [],
      avatar_source: 'G',
      avatar_url: null, // ideally would agree with selfUser.avatar_url
      avatar_url_medium: 'url',
      can_create_streams: false,
      cross_realm_bots: [],
      email: selfAccount.email, // aka selfUser.email
      enter_sends: true,
      full_name: selfUser.full_name,
      is_admin: selfUser.is_admin,
      realm_non_active_users: [],
      realm_users: [],
      user_id: selfUser.user_id,
      realm_user_groups: [],
      recent_private_conversations: [],
      streams: [],
      never_subscribed: [],
      subscriptions: [],
      unsubscribed: [],
      default_language: 'en',
      emojiset: 'google',
      emojiset_choices: {},
      high_contrast_mode: true,
      left_side_userlist: true,
      night_mode: true,
      timezone: selfUser.timezone ?? 'UTC',
      translate_emoticons: true,
      twenty_four_hour_time: true,
      default_desktop_notifications: true,
      enable_desktop_notifications: true,
      enable_digest_emails: true,
      enable_offline_email_notifications: true,
      enable_offline_push_notifications: true,
      enable_online_push_notifications: true,
      enable_sounds: true,
      enable_stream_desktop_notifications: true,
      enable_stream_email_notifications: true,
      enable_stream_push_notifications: true,
      enable_stream_sounds: true,
      message_content_in_email_notifications: true,
      pm_content_in_desktop_notifications: true,
      realm_name_in_notifications: true,
      unread_msgs: {
        streams: [],
        huddles: [],
        count: 0,
        pms: [],
        mentions: [],
      },
      user_status: {},
    },
    zulipVersion,
  }): RealmInitAction),
  message_fetch_start: (deepFreeze({
    type: MESSAGE_FETCH_START,
    narrow: HOME_NARROW,
    numBefore: 0,
    numAfter: 20,
  }): MessageFetchStartAction),
  message_fetch_complete: (deepFreeze({
    type: MESSAGE_FETCH_COMPLETE,
    messages: [],
    narrow: HOME_NARROW,
    anchor: 0,
    numBefore: 50,
    numAfter: 50,
    foundNewest: undefined,
    foundOldest: undefined,
    ownUserId: selfUser.user_id,
  }): MessageFetchCompleteAction),
  // If a given action is only relevant to a single test file, no need to
  // provide a generic example of it here; just define it there.
});

// Ensure every `eg.action.foo` is some well-typed action.
/* eslint-disable-next-line no-unused-expressions */
(action: {| [string]: Action |});

/* ========================================================================
 * Action factories
 *
 * Useful for action types where a static object of boilerplate data doesn't
 * suffice.  Generally this is true where (a) there's some boilerplate data
 * that's useful to supply here, but (b) there's some other places where a
 * given test will almost always need to fill in specific data of its own.
 *
 * For action types without (b), a static example value `eg.action.foo` is
 * enough.  For action types without (a), even that isn't necessary, because
 * each test might as well define the action values it needs directly.
 */

/**
 * An EVENT_NEW_MESSAGE action.
 *
 * The message argument can either have or omit a `flags` property; if
 * omitted, it defaults to empty.  (The `message` property on an
 * `EVENT_NEW_MESSAGE` action must have `flags`, while `Message` objects in
 * some other contexts must not.  See comments on `Message` for details.)
 */
export const mkActionEventNewMessage = (
  message: Message,
  args?: {| caughtUp?: CaughtUpState, local_message_id?: number, ownUserId?: UserId |},
): Action =>
  deepFreeze({
    type: EVENT_NEW_MESSAGE,
    id: 1001,
    caughtUp: {},
    ownUserId: selfUser.user_id,

    ...args,

    message: { ...message, flags: message.flags ?? [] },
  });

// If a given action is only relevant to a single test file, no need to
// provide a generic factory for it here; just define the test data there.

/* ========================================================================
 * Miscellaneous
 */

export const backgroundData: BackgroundData = deepFreeze({
  alertWords: [],
  allImageEmojiById: action.realm_init.data.realm_emoji,
  auth: selfAuth,
  debug: baseReduxState.session.debug,
  doNotMarkMessagesAsRead: baseReduxState.settings.doNotMarkMessagesAsRead,
  flags: baseReduxState.flags,
  mute: [],
  mutedUsers: Immutable.Map(),
  ownUser: selfUser,
  streams: getStreamsById(baseReduxState),
  streamsByName: getStreamsByName(baseReduxState),
  subscriptions: [],
  unread: baseReduxState.unread,
  theme: 'default',
  twentyFourHourTime: false,
});
