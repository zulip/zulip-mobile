/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

import type { CrossRealmBot, Message, PmRecipientUser, Stream, User } from '../api/modelTypes';
import type { GlobalState } from '../reduxTypes';
import type { Account } from '../types';
import rootReducer from '../boot/reducers';

// TODO either fix Jest test-discovery patterns, or rename this file,
// so this dummy test isn't required.
describe('nothing', () => {
  test('nothing', () => {});
});

/** Return a string that's almost surely different every time. */
const randString = () =>
  Math.random()
    .toString(36)
    .substring(7);

/** Return an integer 0 <= N < end, roughly uniformly at random. */
const randInt = (end: number) => Math.floor(Math.random() * end);

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
const makeUser = (args: { name?: string } = {}): User => ({
  ...userOrBotProperties(args),

  is_bot: false,
  // bot_type omitted
  // bot_owner omitted

  is_guest: false,

  // profile_data omitted
});

/** Caveat emptor!  These values may not be representative. */
const makeCrossRealmBot = (args: { name?: string } = {}): CrossRealmBot => ({
  ...userOrBotProperties(args),
  is_bot: true,
});

const makeAccount = (user: User): Account => ({
  realm: 'https://zulip.example.org',
  email: user.email,
  apiKey: randString() + randString(),
  ackedPushToken: null,
});

const selfUser: User = makeUser({ name: 'self' });
const selfAccount: Account = makeAccount(selfUser);

const otherUser: User = makeUser({ name: 'other' });

const crossRealmBot: CrossRealmBot = makeCrossRealmBot({ name: 'bot' });

const stream: Stream = {
  stream_id: 34,
  description: 'An example stream.',
  name: 'a stream',
  invite_only: false,
  is_announcement_only: false,
  history_public_to_subscribers: true,
};

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
const pmMessage = (extra?: $Rest<Message, {}>): Message => {
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
const streamMessage = (extra?: $Rest<Message, {}>): Message => {
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

const baseReduxState: GlobalState = deepFreeze(privateReduxStore.getState());

const reduxState = (extra?: $Rest<GlobalState, {}>): GlobalState =>
  deepFreeze({
    ...baseReduxState,
    ...extra,
  });

export const eg = {
  makeUser,
  makeCrossRealmBot,
  selfUser,
  selfAccount,
  otherUser,
  crossRealmBot,
  stream,

  pmMessage,
  streamMessage,

  baseReduxState,
  reduxState,
};
