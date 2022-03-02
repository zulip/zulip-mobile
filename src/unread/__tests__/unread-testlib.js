/* @flow strict-local */

import { reducer } from '../unreadModel';
import type { UnreadState } from '../unreadModelTypes';
import type { Message, Stream } from '../../api/apiTypes';
import type { PerAccountState } from '../../reduxTypes';
import * as eg from '../../__tests__/lib/exampleData';

export const initialState: UnreadState = reducer(
  undefined,
  ({ type: eg.randString() }: $FlowFixMe),
  eg.baseReduxState,
);

export const stream0: Stream = eg.makeStream({ stream_id: 0, name: 'stream 0' });
export const stream2: Stream = eg.makeStream({ stream_id: 2, name: 'stream 2' });

const [user0, user1, user2, user3, user4, user5] = [0, 1, 2, 3, 4, 5].map(user_id =>
  eg.makeUser({ user_id }),
);

export const makeUnreadState = (
  globalState: PerAccountState,
  messages: $ReadOnlyArray<Message>,
): UnreadState =>
  messages.reduce(
    (state, message) => reducer(state, eg.mkActionEventNewMessage(message), globalState),
    initialState,
  );

export const selectorBaseState: UnreadState = (() => {
  // We take user1 to be self.
  // It might be convenient to convert this to the standard eg.selfUser,
  // and use eg.reduxStatePlus.  Until then, this just minimizes how much
  // we've had to do in order to adapt our pre-existing tests.
  const globalState = eg.reduxState({
    realm: { ...eg.baseReduxState.realm, user_id: user1.user_id },
    users: [user0, user1, user2, user3, user4, user5],
    streams: [stream0, stream2],
  });

  return makeUnreadState(globalState, [
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 1, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 2, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 3, flags: ['mentioned'] }),
    eg.streamMessage({ stream_id: 0, subject: 'another topic', id: 4 }),
    eg.streamMessage({ stream_id: 0, subject: 'another topic', id: 5 }),
    eg.streamMessage({ stream_id: 2, subject: 'some other topic', id: 6 }),
    eg.streamMessage({ stream_id: 2, subject: 'some other topic', id: 7 }),
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
  ]);
})();
