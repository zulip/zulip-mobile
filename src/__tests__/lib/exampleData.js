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
  UserStatus,
} from '../../api/modelTypes';
import { randString, randInt } from '../../utils/misc';
import { makeUserId } from '../../api/idTypes';
import type { InitialData } from '../../api/apiTypes';
import { EventTypes, type UpdateMessageEvent } from '../../api/eventTypes';
import { CreateWebPublicStreamPolicy } from '../../api/permissionsTypes';
import type {
  AccountSwitchAction,
  LoginSuccessAction,
  RegisterCompleteAction,
  MessageFetchStartAction,
  MessageFetchCompleteAction,
  Action,
  PerAccountAction,
  PerAccountState,
  GlobalState,
  CaughtUpState,
  MessagesState,
  RealmState,
} from '../../reduxTypes';
import type { Auth, Account, StreamOutbox } from '../../types';
import { dubJointState } from '../../reduxTypes';
import { UploadedAvatarURL } from '../../utils/avatar';
import type { AvatarURL } from '../../utils/avatar';
import { ZulipVersion } from '../../utils/zulipVersion';
import {
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  REGISTER_COMPLETE,
  EVENT_NEW_MESSAGE,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  EVENT_UPDATE_MESSAGE,
} from '../../actionConstants';
import rootReducer from '../../boot/reducers';
import { authOfAccount } from '../../account/accountMisc';
import { HOME_NARROW } from '../../utils/narrow';
import { type BackgroundData, getBackgroundData } from '../../webview/backgroundData';
import { getDebug, getGlobalSettings } from '../../directSelectors';
import { messageMoved } from '../../api/misc';

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
  user_id?: number, // accept a plain number, for convenience in tests
  email?: string,
  full_name?: string,
  avatar_url?: AvatarURL,
|};

/**
 * An avatar URL, containing the given tag to make it recognizable in debugging.
 *
 * Beware!  This value may not be representative.
 */
const makeAvatarUrl = (tag: string) =>
  // Internally the UploadedAvatarURL mutates itself for memoization.
  // That conflicts with the deepFreeze we do for tests; so construct it
  // here with a full-blown URL object in the first place to prevent that.
  new UploadedAvatarURL(new URL(`https://zulip.example.org/yo/avatar-${tag}.png`));

const randUserId: () => UserId = (mk => () => makeUserId(mk()))(
  makeUniqueRandInt('user IDs', 10000),
);
const userOrBotProperties = (args: UserOrBotPropertiesArgs) => {
  const user_id = args.user_id != null ? makeUserId(args.user_id) : randUserId();
  const randName = randString();
  return deepFreeze({
    avatar_url: args.avatar_url ?? makeAvatarUrl(user_id.toString()),
    avatar_version: 0,

    date_joined: `2014-04-${randInt(30)
      .toString()
      .padStart(2, '0')}`,

    email: args.email ?? `${randName}@example.org`,
    full_name: args.full_name ?? `${randName} User`,
    is_admin: false,
    timezone: 'UTC',
    user_id,
  });
};

/** Beware! These values may not be representative. */
export const makeUser = (args: UserOrBotPropertiesArgs = Object.freeze({})): User =>
  deepFreeze({
    ...userOrBotProperties(args),

    is_bot: false,
    bot_type: null,
    // bot_owner omitted

    is_guest: false,
    profile_data: {},
  });

/** Beware! These values may not be representative. */
export const makeCrossRealmBot = (
  args: UserOrBotPropertiesArgs = Object.freeze({}),
): CrossRealmBot =>
  deepFreeze({
    ...userOrBotProperties(args),
    is_bot: true,

    bot_type: 1,
  });

export const userStatusEmojiUnicode: $PropertyType<UserStatus, 'status_emoji'> = deepFreeze({
  reaction_type: 'unicode_emoji',
  emoji_code: '1f44d',
  emoji_name: 'thumbs_up',
});

export const userStatusEmojiZulipExtra: $PropertyType<UserStatus, 'status_emoji'> = deepFreeze({
  reaction_type: 'zulip_extra_emoji',
  emoji_code: 'zulip',
  emoji_name: 'zulip',
});

export const userStatusEmojiRealm: $PropertyType<UserStatus, 'status_emoji'> = deepFreeze({
  reaction_type: 'realm_emoji',
  emoji_code: '80',
  emoji_name: 'github_parrot',
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
    lastDismissedServerPushSetupNotice?: Date | null,
  |} = Object.freeze({}),
): Account => {
  const {
    user = makeUser(),
    userId = user.user_id,
    email = user.email,
    realm: realmInner = realm,
    apiKey = randString() + randString(),
    zulipFeatureLevel: zulipFeatureLevelInner = zulipFeatureLevel,
    zulipVersion: zulipVersionInner = zulipVersion,
    ackedPushToken = null,
    lastDismissedServerPushSetupNotice = null,
  } = args;
  return deepFreeze({
    realm: realmInner,
    userId,
    email,
    apiKey,
    zulipFeatureLevel: zulipFeatureLevelInner,
    zulipVersion: zulipVersionInner,
    ackedPushToken,
    lastDismissedServerPushSetupNotice,
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

export const selfUser: User = makeUser({
  full_name: 'Self User',
  email: 'self@example.org',
  avatar_url: makeAvatarUrl('self'),
});
export const selfAccount: Account = makeAccount({ user: selfUser, realm });
export const selfAuth: Auth = deepFreeze(authOfAccount(selfAccount));

export const otherUser: User = makeUser({
  full_name: 'Other User',
  email: 'other@example.org',
  avatar_url: makeAvatarUrl('other'),
});
export const thirdUser: User = makeUser({
  full_name: 'Third User',
  email: 'third@example.org',
  avatar_url: makeAvatarUrl('third'),
});

export const crossRealmBot: CrossRealmBot = makeCrossRealmBot({
  full_name: 'Bot User',
  email: 'bot@example.org',
  avatar_url: makeAvatarUrl('bot'),
});

/* ========================================================================
 * Streams and subscriptions
 */

const randStreamId: () => number = makeUniqueRandInt('stream IDs', 1000);
export const makeStream = (
  args: {|
    stream_id?: number,
    name?: string,
    description?: string,
    invite_only?: boolean,
    is_web_public?: boolean,
    history_public_to_subscribers?: boolean,
  |} = Object.freeze({}),
): Stream => {
  const name = args.name ?? randString();
  return deepFreeze({
    stream_id: args.stream_id ?? randStreamId(),
    name,
    description: args.description ?? `On the ${randString()} of ${name}`,
    rendered_description: args.description ?? `<p>On the ${randString()} of ${name}</p>`,
    invite_only: args.invite_only ?? false,
    is_announcement_only: false,
    is_web_public: args.is_web_public ?? false,
    history_public_to_subscribers: args.history_public_to_subscribers ?? true,
    first_message_id: null,
  });
};

export const stream: Stream = makeStream({
  name: 'a stream',
  description: 'An example stream.',
});
export const otherStream: Stream = makeStream({
  name: 'another stream',
  description: 'Another example stream.',
});

/** A subscription, by default to eg.stream. */
export const makeSubscription = (
  args: {|
    stream?: Stream,
    in_home_view?: boolean,
    pin_to_top?: boolean,
    push_notifications?: boolean,
    color?: string,
  |} = Object.freeze({}),
): Subscription => {
  const { stream: streamInner = stream } = args;
  return deepFreeze({
    ...streamInner,
    color: args.color ?? '#123456',
    in_home_view: args.in_home_view ?? true,
    pin_to_top: args.pin_to_top ?? false,
    audible_notifications: false,
    desktop_notifications: false,
    email_address: '??? make this value representative before using in a test :)',
    is_old_stream: true,
    push_notifications: args.push_notifications ?? null,
    stream_weekly_traffic: 84,
  });
};

/** A subscription to eg.stream. */
export const subscription: Subscription = makeSubscription();

/** A subscription to eg.otherStream. */
export const otherSubscription: Subscription = makeSubscription({ stream: otherStream });

/* ========================================================================
 * Messages
 */

export const unicodeEmojiReaction: Reaction = deepFreeze({
  user_id: randUserId(),
  reaction_type: 'unicode_emoji',
  emoji_code: '1f44d',
  emoji_name: 'thumbs_up',
});

export const zulipExtraEmojiReaction: Reaction = deepFreeze({
  user_id: randUserId(),
  reaction_type: 'zulip_extra_emoji',
  emoji_code: 'zulip',
  emoji_name: 'zulip',
});

export const realmEmojiReaction: Reaction = deepFreeze({
  user_id: randUserId(),
  reaction_type: 'realm_emoji',
  emoji_code: '80',
  emoji_name: 'github_parrot',
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
    avatar_url: user.avatar_url,
    client: 'ExampleClient',
    sender_email,
    sender_full_name,
    sender_id,
    sender_realm_str: 'zulip',
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
  recipients?: $ReadOnlyArray<User>,
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

    content: '<p>This is an example PM message.</p>',
    content_type: 'text/html',
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
  to: $ReadOnlyArray<User>,
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

    content: '<p>This is an example stream message.</p>',
    content_type: 'text/html',
    id: randMessageId(),
    subject: 'example topic',
    topic_links: ([]: {| text: string, url: string |}[]),
    timestamp: 1556579727,
    type: 'stream',
  };

  return deepFreeze({ ...baseMessage, ...extra });
};

/** Construct a MessagesState from a list of messages. */
export const makeMessagesState = (messages: $ReadOnlyArray<Message>): MessagesState =>
  Immutable.Map(messages.map(m => [m.id, m]));

/* ========================================================================
 * Outbox messages
 *
 * (Only stream messages for now. Feel free to add PMs, if you need them.)
 */

/**
 * Boring properties common across example outbox messages.
 */
const outboxMessageBase = deepFreeze({
  isOutbox: true,
  isSent: false,
  avatar_url: selfUser.avatar_url,
  content: '<p>Test.</p>',
  markdownContent: 'Test.',
  reactions: [],
  sender_email: selfUser.email,
  sender_full_name: selfUser.full_name,
  sender_id: selfUser.user_id,
});

/**
 * Create a stream outbox message from an interesting subset of its
 *   data.
 *
 * `.id` is always identical to `.timestamp` and should not be supplied.
 */
export const streamOutbox = (data: $Rest<StreamOutbox, { id: mixed, ... }>): StreamOutbox => {
  const { timestamp } = data;

  const outputTimestamp = timestamp ?? makeTime() / 1000;
  return deepFreeze({
    ...outboxMessageBase,
    type: 'stream',
    display_recipient: stream.name,
    stream_id: stream.stream_id,
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
// TODO(#5006): Split this (and its friends below) into global and
//   per-account versions.  (This may be easiest to do after actually
//   migrating settings and session to split them per-account vs global, so
//   that the global and per-account states have disjoint sets of
//   properties.)
// For now, the intersection type (with `&`) says this value can be used as
// either kind of state.
export const baseReduxState: GlobalState & PerAccountState = dubJointState(
  deepFreeze(privateReduxStore.getState()),
);

/**
 * A global Redux state, with `baseReduxState` plus the given data.
 *
 * See `reduxStatePlus` for a version that automatically includes `selfUser`
 * and other standard example data.
 */
export const reduxState = (extra?: $Rest<GlobalState, { ... }>): GlobalState & PerAccountState =>
  dubJointState(
    deepFreeze({
      ...(baseReduxState: GlobalState),
      ...extra,
    }),
  );

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
export const plusReduxState: GlobalState & PerAccountState = reduxState({
  accounts: [
    {
      ...selfAuth,
      userId: selfUser.user_id,
      ackedPushToken: null,
      zulipVersion,
      zulipFeatureLevel,
      lastDismissedServerPushSetupNotice: null,
    },
  ],
  realm: {
    ...baseReduxState.realm,
    user_id: selfUser.user_id,
    email: selfUser.email,
    crossRealmBots: [crossRealmBot],
    emoji: {
      [realmEmojiReaction.emoji_code]: {
        deactivated: false,
        code: realmEmojiReaction.emoji_code,
        name: realmEmojiReaction.emoji_name,
        source_url: `/user_avatars/2/emoji/images/${realmEmojiReaction.emoji_code}.gif`,
      },
    },
  },
  users: [selfUser, otherUser, thirdUser],
  streams: [stream, otherStream],
  subscriptions: [subscription, otherSubscription],
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
export const reduxStatePlus = (
  extra?: $Rest<GlobalState, { ... }>,
  // $FlowFixMe[not-an-object]
): GlobalState & PerAccountState =>
  dubJointState(deepFreeze({ ...(plusReduxState: GlobalState), ...extra }));

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

  /**
   * A minimal well-typed REGISTER_COMPLETE action from a recent server.
   *
   * Beware!  The data here may not be representative.  Generally each test
   * should specify the particular properties that it cares about.
   *
   * See also `eg.mkActionRegisterComplete`, for combining this data with
   * test-specific other data.
   */
  register_complete: (deepFreeze({
    type: REGISTER_COMPLETE,
    data: {
      // InitialDataBase
      last_event_id: 34,
      msg: '',
      queue_id: '1',
      zulip_feature_level: 1,
      zulip_version: zulipVersion.raw(),

      // InitialDataAlertWords
      alert_words: [],

      // InitialDataCustomProfileFields
      custom_profile_fields: [],

      // InitialDataMessage
      max_message_id: 100,

      // InitialDataMutedTopics
      muted_topics: [],

      // InitialDataMutedUsers
      muted_users: [],

      // InitialDataPresence
      presences: {},

      // InitialDataRealm
      development_environment: false,
      event_queue_longpoll_timeout_seconds: 600,
      // jitsi_server_url omitted
      max_avatar_file_size_mib: 3,
      max_file_upload_size_mib: 3,
      max_icon_file_size_mib: 3,
      max_logo_file_size_mib: 3,
      max_message_length: 10000,
      max_stream_description_length: 500,
      max_stream_name_length: 100,
      max_topic_length: 50,
      password_min_length: 8,
      password_min_guesses: 3,
      realm_add_custom_emoji_policy: 3,
      realm_allow_edit_history: true,
      realm_allow_message_editing: true,
      realm_authentication_methods: { GitHub: true, Email: true, Google: true },
      realm_available_video_chat_providers: {},
      realm_avatar_changes_disabled: false,
      realm_bot_creation_policy: 3,
      realm_bot_domain: 'example.com',
      realm_community_topic_editing_limit_seconds: 600,
      realm_create_private_stream_policy: 3,
      realm_create_public_stream_policy: 3,
      realm_create_web_public_stream_policy: CreateWebPublicStreamPolicy.ModeratorOrAbove,
      realm_default_code_block_language: 'python',
      realm_default_external_accounts: {
        github: {
          name: 'GitHub',
          text: 'GitHub',
          hint: 'Enter your GitHub username',
          url_pattern: 'https://github.com/%(username)s',
        },
      },
      realm_default_language: 'en',
      realm_delete_own_message_policy: 3,
      realm_description: 'description',
      realm_digest_emails_enabled: true,
      realm_digest_weekday: 2,
      realm_disallow_disposable_email_addresses: true,
      realm_edit_topic_policy: 3,
      realm_email_address_visibility: 3,
      realm_email_auth_enabled: true,
      realm_email_changes_disabled: true,
      realm_emails_restricted_to_domains: false,
      realm_enable_spectator_access: true,
      realm_giphy_rating: 3,
      realm_icon_source: 'U',
      realm_icon_url: 'example.com/some/path',
      realm_inline_image_preview: true,
      realm_inline_url_embed_preview: true,
      realm_invite_required: true,
      realm_invite_to_realm_policy: 3,
      realm_invite_to_stream_policy: 3,
      realm_is_zephyr_mirror_realm: true,
      realm_logo_source: 'D',
      realm_logo_url: '',
      realm_mandatory_topics: true,
      realm_message_content_allowed_in_email_notifications: true,
      realm_message_content_delete_limit_seconds: 3,
      realm_message_content_edit_limit_seconds: 3,
      realm_message_retention_days: 3,
      realm_move_messages_between_streams_policy: 3,
      realm_name: 'Test',
      realm_name_changes_disabled: true,
      realm_night_logo_source: 'D',
      realm_night_logo_url: '',
      realm_notifications_stream_id: 3,
      realm_org_type: 0,
      realm_password_auth_enabled: true,
      realm_plan_type: 3,
      realm_presence_disabled: true,
      realm_private_message_policy: 3,
      realm_push_notifications_enabled: true,
      realm_send_welcome_emails: true,
      realm_signup_notifications_stream_id: 3,
      realm_upload_quota_mib: 10,
      realm_user_group_edit_policy: 3,
      realm_uri: selfAccount.realm.toString(),
      realm_video_chat_provider: 1,
      realm_waiting_period_threshold: 3,
      realm_want_advertise_in_communities_directory: false,
      realm_wildcard_mention_policy: 3,
      server_avatar_changes_disabled: false,
      server_generation: 3,
      server_inline_image_preview: true,
      server_inline_url_embed_preview: true,
      server_name_changes_disabled: false,
      server_needs_upgrade: false,
      server_web_public_streams_enabled: true,
      settings_send_digest_emails: true,
      upgrade_text_for_wide_organization_logo: '',
      zulip_plan_is_not_limited: false,

      // InitialDataRealmEmoji
      realm_emoji: {},

      // InitialDataRealmFilters
      realm_filters: [],

      // InitialDataRealmUser
      realm_users: [],
      realm_non_active_users: [],
      avatar_source: 'G',
      avatar_url_medium: 'url',
      avatar_url: null, // ideally would agree with selfUser.avatar_url
      can_create_streams: false, // new servers don't send, but we fill in
      can_create_public_streams: false,
      can_create_private_streams: false,
      can_create_web_public_streams: false,
      can_subscribe_other_users: false,
      can_invite_others_to_realm: false,
      is_admin: selfUser.is_admin,
      is_owner: false,
      is_billing_admin: selfUser.is_billing_admin,
      is_moderator: false,
      is_guest: false,
      user_id: selfUser.user_id,
      email: selfAccount.email, // aka selfUser.email
      delivery_email: selfUser.email,
      full_name: selfUser.full_name,
      cross_realm_bots: [],

      // InitialDataRealmUserGroups
      realm_user_groups: [],

      // InitialDataRecentPmConversations
      recent_private_conversations: [],

      // InitialDataStream
      streams: [],

      // InitialDataSubscription
      never_subscribed: [],
      subscriptions: [],
      unsubscribed: [],

      // InitialDataUpdateMessageFlags
      unread_msgs: {
        streams: [],
        huddles: [],
        pms: [],
        mentions: [],
        count: 0,
      },

      // InitialDataUserSettings
      user_settings: {
        twenty_four_hour_time: true,
        dense_mode: true,
        starred_message_counts: true,
        fluid_layout_width: false,
        high_contrast_mode: false,
        color_scheme: 3,
        translate_emoticons: true,
        display_emoji_reaction_users: true,
        default_language: 'en',
        default_view: 'recent_topics',
        escape_navigates_to_default_view: true,
        left_side_userlist: false,
        emojiset: 'google',
        demote_inactive_streams: 2,
        timezone: selfUser.timezone ?? 'UTC',
        enter_sends: false,
        enable_drafts_synchronization: true,
        enable_stream_desktop_notifications: false,
        enable_stream_email_notifications: false,
        enable_stream_push_notifications: false,
        enable_stream_audible_notifications: false,
        notification_sound: 'zulip',
        enable_desktop_notifications: true,
        enable_sounds: true,
        email_notifications_batching_period_seconds: 120,
        enable_offline_email_notifications: true,
        enable_offline_push_notifications: true,
        enable_online_push_notifications: true,
        enable_digest_emails: true,
        enable_marketing_emails: true,
        enable_login_emails: false,
        message_content_in_email_notifications: true,
        pm_content_in_desktop_notifications: true,
        wildcard_mentions_notify: true,
        desktop_icon_count_display: 1,
        realm_name_in_notifications: false,
        presence_enabled: true,
        available_notification_sounds: ['zulip'],
        emojiset_choices: [{ key: 'google', text: 'Google modern' }],
        send_private_typing_notifications: true,
        send_stream_typing_notifications: true,
        send_read_receipts: true,
      },

      // InitialDataUserStatus
      user_status: {},
    },
  }): RegisterCompleteAction),

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
    foundNewest: false,
    foundOldest: false,
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
 * A REGISTER_COMPLETE action.
 *
 * The result will be based on `eg.action.register_complete`, but with the
 * additional data given in the argument.
 */
export const mkActionRegisterComplete = (extra: {|
  ...$Rest<InitialData, { ... }>,
  unread_msgs?: $Rest<$PropertyType<InitialData, 'unread_msgs'>, { ... }>,
|}): PerAccountAction => {
  const { unread_msgs, ...rest } = extra;
  return deepFreeze({
    ...action.register_complete,
    data: {
      ...action.register_complete.data,
      ...rest,
      unread_msgs: {
        ...action.register_complete.data.unread_msgs,
        ...unread_msgs,
      },
    },
  });
};

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
): PerAccountAction =>
  deepFreeze({
    type: EVENT_NEW_MESSAGE,
    id: 1001,
    caughtUp: {},
    ownUserId: selfUser.user_id,

    ...args,

    message: { ...message, flags: message.flags ?? [] },
  });

/**
 * An EVENT_UPDATE_MESSAGE action.
 */
export const mkActionEventUpdateMessage = (args: {|
  ...$Rest<UpdateMessageEvent, { id: mixed, type: mixed, flags?: mixed }>,
|}): PerAccountAction => {
  const event = {
    id: 1,
    type: EventTypes.update_message,
    flags: [],
    ...args,
  };
  return {
    type: EVENT_UPDATE_MESSAGE,
    event,
    move: messageMoved(event),
  };
};

// If a given action is only relevant to a single test file, no need to
// provide a generic factory for it here; just define the test data there.

/* ========================================================================
 * Miscellaneous
 */

/**
 * A BackgroundData value corresponding mostly to baseReduxState.
 *
 * Includes a few elements of plusReduxState, where necessary for
 * constructing a valid BackgroundData.
 */
export const baseBackgroundData: BackgroundData = deepFreeze(
  getBackgroundData(
    reduxState({
      accounts: plusReduxState.accounts,
      realm: { ...baseReduxState.realm, user_id: plusReduxState.realm.user_id },
      users: [selfUser],
    }),
    getGlobalSettings(baseReduxState),
    getDebug(baseReduxState),
  ),
);

/** A BackgroundData value corresponding to plusReduxState. */
export const plusBackgroundData: BackgroundData = deepFreeze(
  getBackgroundData(plusReduxState, getGlobalSettings(plusReduxState), getDebug(plusReduxState)),
);
