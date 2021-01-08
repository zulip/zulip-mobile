/* @flow strict-local */

import type { Message } from '../../types';
import { reducer } from '../unreadModel';
import * as eg from '../../__tests__/lib/exampleData';

export const initialState = reducer(undefined, ({ type: eg.randString() }: $FlowFixMe));

export const mkMessageAction = (message: Message) => ({
  ...eg.eventNewMessageActionBase,
  message: { ...message, flags: message.flags ?? [] },
});

export const stream0 = { ...eg.makeStream({ name: 'stream 0' }), stream_id: 0 };
export const stream2 = { ...eg.makeStream({ name: 'stream 2' }), stream_id: 2 };

const [user0, user1, user2, user3, user4, user5] = [0, 1, 2, 3, 4, 5].map(user_id =>
  eg.makeUser({ user_id }),
);

export const selectorBaseState = (() => {
  let state = initialState;
  for (const message of [
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 1, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 2, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 3, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'another topic', id: 4 }),
    eg.streamMessage({ stream_id: 0, subject: 'another topic', id: 5 }),
    eg.streamMessage({ stream_id: 2, subject: 'some other topic', id: 6 }),
    eg.streamMessage({ stream_id: 2, subject: 'some other topic', id: 7 }),
    // We take user1 to be self.
    eg.pmMessageFromTo(user0, [user1], { id: 11 }),
    eg.pmMessageFromTo(user0, [user1], { id: 12 }),
    eg.pmMessageFromTo(user2, [user1], { id: 13 }),
    eg.pmMessageFromTo(user2, [user1], { id: 14 }),
    eg.pmMessageFromTo(user2, [user1], { id: 15 }),
    eg.pmMessageFromTo(user2, [user1, user3], { id: 21 }),
    eg.pmMessageFromTo(user2, [user1, user3], { id: 22 }),
    eg.pmMessageFromTo(user4, [user1, user5], { id: 23 }),
    eg.pmMessageFromTo(user4, [user1, user5], { id: 24 }),
    eg.pmMessageFromTo(user4, [user1, user5], { id: 25 }),
  ]) {
    state = reducer(state, mkMessageAction(message));
  }
  return state;
})();
