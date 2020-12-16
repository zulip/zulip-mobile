/* @flow strict-local */
import Immutable from 'immutable';

import { usersOfKey, keyOfExactUsers, reducer } from '../pmConversationsModel';
import * as eg from '../../__tests__/lib/exampleData';
import { makeUserId } from '../../api/idTypes';

describe('usersOfKey', () => {
  for (const [desc, ids] of [
    ['self-1:1', []],
    ['other 1:1 PM', [123]],
    ['group PM', [123, 345, 567]],
  ]) {
    test(desc, () => {
      expect(usersOfKey(keyOfExactUsers(ids.map(makeUserId)))).toEqual(ids);
    });
  }
});

describe('reducer', () => {
  const initialState = reducer(undefined, ({ type: eg.randString() }: $FlowFixMe));
  const someKey = keyOfExactUsers([eg.makeUser().user_id]);
  const someState = { map: Immutable.Map([[someKey, 123]]), sorted: Immutable.List([someKey]) };

  describe('REALM_INIT', () => {
    test('no data (old server)', () => {
      /* eslint-disable-next-line no-unused-vars */
      const { recent_private_conversations, ...rest } = eg.action.realm_init.data;
      expect(reducer(someState, { ...eg.action.realm_init, data: rest })).toEqual(initialState);
    });

    test('works in normal case', () => {
      // Includes self-1:1, other 1:1, and group PM thread.
      // Out of order.
      const recent_private_conversations = [
        { user_ids: [], max_message_id: 234 },
        { user_ids: [makeUserId(1)], max_message_id: 123 },
        { user_ids: [2, 1].map(makeUserId), max_message_id: 345 }, // user_ids out of order
      ];
      const expected = {
        map: Immutable.Map([['', 234], ['1', 123], ['1,2', 345]]),
        sorted: Immutable.List(['1,2', '', '1']),
      };
      expect(
        reducer(someState, {
          ...eg.action.realm_init,
          data: { ...eg.action.realm_init.data, recent_private_conversations },
        }),
      ).toEqual(expected);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    const [user1, user2] = [eg.makeUser({ user_id: 1 }), eg.makeUser({ user_id: 2 })];
    const msg = (id, otherUsers) => eg.pmMessageFromTo(eg.selfUser, otherUsers, { id });
    const action = messages => ({ ...eg.action.message_fetch_complete, messages });

    test('works', () => {
      let state = initialState;
      state = reducer(
        state,
        action([msg(45, [user1]), msg(123, [user1, user2]), eg.streamMessage(), msg(234, [user1])]),
      );
      expect(state).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 123]]),
        sorted: Immutable.List(['1', '1,2']),
      });

      const newState = reducer(state, action([eg.streamMessage()]));
      expect(newState).toBe(state);

      state = reducer(
        state,
        action([
          msg(345, [user2]),
          msg(159, [user2]),
          msg(456, [user1, user2]),
          msg(102, [user1, user2]),
        ]),
      );
      expect(state).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 456], ['2', 345]]),
        sorted: Immutable.List(['1,2', '2', '1']),
      });
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    const actionGeneral = message => ({ ...eg.eventNewMessageActionBase, message });
    const [user1, user2] = [eg.makeUser({ user_id: 1 }), eg.makeUser({ user_id: 2 })];
    const action = (id, otherUsers) =>
      actionGeneral(eg.pmMessageFromTo(eg.selfUser, otherUsers, { id }));

    // We'll start from here to test various updates.
    const baseState = (() => {
      let state = initialState;
      state = reducer(state, action(234, [user1]));
      state = reducer(state, action(123, [user1, user2]));
      return state;
    })();

    test('(check base state)', () => {
      // This is here mostly for checked documentation of what's in
      // baseState, to help in reading the other test cases.
      expect(baseState).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 123]]),
        sorted: Immutable.List(['1', '1,2']),
      });
    });

    test('stream message -> do nothing', () => {
      const state = reducer(baseState, actionGeneral(eg.streamMessage()));
      expect(state).toBe(baseState);
    });

    test('new conversation, newest message', () => {
      const state = reducer(baseState, action(345, [user2]));
      expect(state).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 123], ['2', 345]]),
        sorted: Immutable.List(['2', '1', '1,2']),
      });
    });

    test('new conversation, not newest message', () => {
      const state = reducer(baseState, action(159, [user2]));
      expect(state).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 123], ['2', 159]]),
        sorted: Immutable.List(['1', '2', '1,2']),
      });
    });

    test('existing conversation, newest message', () => {
      const state = reducer(baseState, action(345, [user1, user2]));
      expect(state).toEqual({
        map: Immutable.Map([['1', 234], ['1,2', 345]]),
        sorted: Immutable.List(['1,2', '1']),
      });
    });

    test('existing newest conversation, newest message', () => {
      const state = reducer(baseState, action(345, [user1]));
      expect(state).toEqual({
        map: Immutable.Map([['1', 345], ['1,2', 123]]),
        sorted: Immutable.List(['1', '1,2']),
      });
      expect(state.sorted).toBe(baseState.sorted);
    });

    test('existing conversation, not newest in conversation', () => {
      const state = reducer(baseState, action(102, [user1, user2]));
      expect(state).toBe(baseState);
    });
  });
});
