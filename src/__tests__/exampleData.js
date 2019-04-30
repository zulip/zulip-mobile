/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

import type { Message, PmRecipientUser, Stream, User } from '../api/modelTypes';
import type { GlobalState } from '../reduxTypes';
import rootReducer from '../boot/reducers';

// TODO either fix Jest test-discovery patterns, or rename this file,
// so this dummy test isn't required.
describe('nothing', () => {
  test('nothing', () => {});
});

/** Caveat emptor!  These values may not be representative. */
const selfUser: User = {
  avatar_url: 'https://zulip.example.org/an/avatar.png',
  // bot_type omitted
  // bot_owner omitted

  date_joined: '2014-04-01',

  email: 'user@example.org',
  full_name: 'Self User',

  is_admin: false,
  is_bot: false,

  is_guest: false,

  // profile_data omitted

  timezone: 'UTC',
  user_id: 123,
};

/** Caveat emptor!  These values may not be representative. */
const otherUser: User = {
  avatar_url: 'https://zulip.example.org/an/other-avatar.png',
  // bot_type omitted
  // bot_owner omitted

  date_joined: '2014-04-01',

  email: 'other@example.org',
  full_name: 'Other User',

  is_admin: false,
  is_bot: false,

  is_guest: false,

  // profile_data omitted

  timezone: 'Pacific/Chatham', // i.e. UTC+1245 / UTC+1345 :-D
  user_id: 234,
};

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
  selfUser,
  otherUser,
  stream,

  pmMessage,
  streamMessage,

  reduxState,
};
