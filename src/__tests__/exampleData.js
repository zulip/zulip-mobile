/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

import type { CrossRealmBot, Message, PmRecipientUser, Stream, User } from '../api/modelTypes';
import type { GlobalState, RealmState } from '../reduxTypes';
import type { Auth, Account } from '../types';
import { ACCOUNT_SWITCH, LOGIN_SUCCESS } from '../actionConstants';
import rootReducer from '../boot/reducers';
import { authOfAccount } from '../account/accountMisc';

// TODO either fix Jest test-discovery patterns, or rename this file,
// so this dummy test isn't required.
describe('nothing', () => {
  test('nothing', () => {});
});

/** Return an integer 0 <= N < end, roughly uniformly at random. */
const randInt = (end: number) => Math.floor(Math.random() * end);

/** Return a string that's almost surely different every time. */
const randString = () => randInt(2 ** 54).toString(36);

const userOrBotProperties = ({ name: _name }) => {
  const name = _name !== undefined ? _name : randString();
  const capsName = name.substring(0, 1).toUpperCase() + name.substring(1);
  return {
    avatar_url: `https://zulip.example.org/yo/avatar-${name}.png`,

    date_joined: `2014-04-${randInt(30)
      .toString()
      .padStart(2, '0')}`,

    email: `${name}@example.org`,
    full_name: `${capsName} User`,
    is_admin: false,
    timezone: 'UTC',
    user_id: randInt(10000),
  };
};

/** Caveat emptor!  These values may not be representative. */
export const makeUser = (args: { name?: string } = {}): User => ({
  ...userOrBotProperties(args),

  is_bot: false,
  // bot_type omitted
  // bot_owner omitted

  is_guest: false,

  // profile_data omitted
});

/** Caveat emptor!  These values may not be representative. */
export const makeCrossRealmBot = (args: { name?: string } = {}): CrossRealmBot => ({
  ...userOrBotProperties(args),
  is_bot: true,
});

const makeAccount = (user: User): Account => ({
  realm: 'https://zulip.example.org',
  email: user.email,
  apiKey: randString() + randString(),
  ackedPushToken: null,
});

export const selfUser: User = makeUser({ name: 'self' });
export const selfAccount: Account = makeAccount(selfUser);
export const selfAuth: Auth = authOfAccount(selfAccount);

export const otherUser: User = makeUser({ name: 'other' });

export const crossRealmBot: CrossRealmBot = makeCrossRealmBot({ name: 'bot' });

export const makeStream = (args: { name?: string, description?: string } = {}): Stream => {
  const name = args.name !== undefined ? args.name : randString();
  const description =
    args.description !== undefined ? args.description : `On the ${randString()} of ${name}`;
  return {
    stream_id: randInt(1000),
    name,
    description,
    invite_only: false,
    is_announcement_only: false,
    history_public_to_subscribers: true,
  };
};

export const stream: Stream = makeStream({
  name: 'a stream',
  description: 'An example stream.',
});

const displayRecipientFromUser = (user: User): PmRecipientUser => {
  const { email, full_name, user_id: id } = user;
  return {
    email,
    full_name,
    id,
    is_mirror_dummy: false,
    short_name: '', // what is this, anyway?
  };
};

/** Boring properties common to all example Message objects. */
const messagePropertiesBase = {
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
};

const messagePropertiesFromSender = (user: User) => {
  const {
    avatar_url,
    user_id: sender_id,
    email: sender_email,
    full_name: sender_full_name,
  } = otherUser;

  return {
    sender_domain: '',

    avatar_url,
    client: 'ExampleClient',
    gravatar_hash: 'd3adb33f',
    sender_email,
    sender_full_name,
    sender_id,
    sender_realm_str: 'zulip',
    sender_short_name: '',
  };
};

/** Caveat emptor!  These values may not be representative. */
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

  return { ...baseMessage, ...extra };
};

const messagePropertiesFromStream = (stream1: Stream) => {
  const { stream_id, name: display_recipient } = stream1;
  return {
    recipient_id: 2567,
    display_recipient,
    stream_id,
  };
};

/** Caveat emptor!  These values may not be representative. */
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

  return { ...baseMessage, ...extra };
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
});
