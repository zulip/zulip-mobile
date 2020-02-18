/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

import type { CrossRealmBot, Message, PmRecipientUser, Stream, User } from '../api/modelTypes';
import type { Action, GlobalState, RealmState } from '../reduxTypes';
import type { Auth, Account } from '../types';
import { ACCOUNT_SWITCH, LOGIN_SUCCESS, REALM_INIT } from '../actionConstants';
import rootReducer from '../boot/reducers';
import { authOfAccount } from '../account/accountMisc';

// TODO either fix Jest test-discovery patterns, or rename this file,
// so this dummy test isn't required.
describe('nothing', () => {
  test('nothing', () => {});
});

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
const randString = () => randInt(2 ** 54).toString(36);

const randUserId: () => number = makeUniqueRandInt('user IDs', 10000);
const userOrBotProperties = ({ name: _name }) => {
  const name = _name ?? randString();
  const capsName = name.substring(0, 1).toUpperCase() + name.substring(1);
  return deepFreeze({
    avatar_url: `https://zulip.example.org/yo/avatar-${name}.png`,

    date_joined: `2014-04-${randInt(30)
      .toString()
      .padStart(2, '0')}`,

    email: `${name}@example.org`,
    full_name: `${capsName} User`,
    is_admin: false,
    timezone: 'UTC',
    user_id: randUserId(),
  });
};

/** Beware! These values may not be representative. */
export const makeUser = (args: { name?: string } = {}): User =>
  deepFreeze({
    ...userOrBotProperties(args),

    is_bot: false,
    // bot_type omitted
    // bot_owner omitted

    is_guest: false,

    // profile_data omitted
  });

/** Beware! These values may not be representative. */
export const makeCrossRealmBot = (args: { name?: string } = {}): CrossRealmBot =>
  deepFreeze({
    ...userOrBotProperties(args),
    is_bot: true,
  });

const makeAccount = (user: User): Account =>
  deepFreeze({
    realm: 'https://zulip.example.org',
    email: user.email,
    apiKey: randString() + randString(),
    ackedPushToken: null,
  });

export const selfUser: User = makeUser({ name: 'self' });
export const selfAccount: Account = makeAccount(selfUser);
export const selfAuth: Auth = deepFreeze(authOfAccount(selfAccount));

export const otherUser: User = makeUser({ name: 'other' });

export const crossRealmBot: CrossRealmBot = makeCrossRealmBot({ name: 'bot' });

const randStreamId: () => number = makeUniqueRandInt('stream IDs', 1000);
export const makeStream = (args: { name?: string, description?: string } = {}): Stream => {
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

const displayRecipientFromUser = (user: User): PmRecipientUser => {
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
  subject_links: [],
  submessages: [],
});

const messagePropertiesFromSender = (user: User) => {
  const {
    avatar_url,
    user_id: sender_id,
    email: sender_email,
    full_name: sender_full_name,
  } = otherUser;

  return deepFreeze({
    sender_domain: '',

    avatar_url,
    client: 'ExampleClient',
    gravatar_hash: 'd3adb33f',
    sender_email,
    sender_full_name,
    sender_id,
    sender_realm_str: 'zulip',
    sender_short_name: '',
  });
};

/** Beware! These values may not be representative. */
export const pmMessage = (extra?: $Rest<Message, {}>): Message => {
  const baseMessage: Message = {
    ...messagePropertiesBase,
    ...messagePropertiesFromSender(otherUser),

    content: 'This is an example PM message.',
    content_type: 'text/markdown',
    display_recipient: [displayRecipientFromUser(selfUser)],
    id: 1234567,
    recipient_id: 2342,
    stream_id: -1,
    subject: '',
    timestamp: 1556579160,
    type: 'private',
  };

  return deepFreeze({ ...baseMessage, ...extra });
};

const messagePropertiesFromStream = (stream1: Stream) => {
  const { stream_id, name: display_recipient } = stream1;
  return deepFreeze({
    recipient_id: 2567,
    display_recipient,
    stream_id,
  });
};

/** Beware! These values may not be representative. */
export const streamMessage = (extra?: $Rest<Message, {}>): Message => {
  const baseMessage: Message = {
    ...messagePropertiesBase,
    ...messagePropertiesFromSender(otherUser),
    ...messagePropertiesFromStream(stream),

    content: 'This is an example stream message.',
    content_type: 'text/markdown',
    id: 1234789,
    subject: 'example topic',
    timestamp: 1556579727,
    type: 'stream',
  };

  return deepFreeze({ ...baseMessage, ...extra });
};

const privateReduxStore = createStore(rootReducer);

export const baseReduxState: GlobalState = deepFreeze(privateReduxStore.getState());

export const reduxState = (extra?: $Rest<GlobalState, {}>): GlobalState =>
  deepFreeze({
    ...baseReduxState,
    ...extra,
  });

export const realmState = (extra?: $Rest<RealmState, {}>): RealmState =>
  deepFreeze({
    ...baseReduxState.realm,
    ...extra,
  });

export const action = deepFreeze({
  account_switch: {
    type: ACCOUNT_SWITCH,
    index: 0,
  },
  login_success: {
    type: LOGIN_SUCCESS,
    realm: selfAccount.realm,
    email: selfAccount.email,
    apiKey: selfAccount.apiKey,
  },
  realm_init: {
    type: REALM_INIT,
    data: {
      last_event_id: 34,
      msg: '',
      queue_id: 1,
      alert_words: [],
      max_message_id: 100,
      muted_topics: [],
      presences: {},
      max_icon_file_size: 3,
      realm_add_emoji_by_admins_only: true,
      realm_allow_community_topic_editing: true,
      realm_allow_edit_history: true,
      realm_allow_message_deleting: true,
      realm_allow_message_editing: true,
      realm_authentication_methods: { GitHub: true, Email: true, Google: true },
      realm_available_video_chat_providers: [],
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
      realm_uri: selfAccount.realm,
      realm_video_chat_provider: 'google',
      realm_waiting_period_threshold: 3,
      realm_emoji: {},
      realm_filters: [],
      avatar_source: 'G',
      avatar_url: null,
      avatar_url_medium: 'url',
      can_create_streams: false,
      cross_realm_bots: [],
      email: selfAccount.email,
      enter_sends: true,
      full_name: 'Full name',
      is_admin: false,
      realm_non_active_users: [],
      realm_users: [],
      user_id: 4,
      realm_user_groups: [],
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
      timezone: '',
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
  },
});

// Ensure every `eg.action.foo` is some well-typed action.  (We don't simply
// annotate `action` itself, because we want to keep the information of
// which one has which specific type.)
/* eslint-disable-next-line no-unused-expressions */
(action: { [string]: Action });
