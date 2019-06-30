/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import recentPmConversationsReducer from '../recentPmConversationsReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('recentPmConversationsReducer', () => {
  describe('EVENT_NEW_MESSAGE', () => {
    test('reorder correctly upon receiving a new message', () => {
      const users = [eg.makeUser({ name: 'john' }), eg.makeUser({ name: 'mark' })];
      const newMessage = eg.pmMessageFromTo(users[1], [eg.selfUser], { id: 2 });
      const initialState = deepFreeze([
        { max_message_id: 1, user_ids: [users[0].user_id] },
        { max_message_id: 0, user_ids: [users[1].user_id] },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: newMessage,
      });

      expect(recentPmConversationsReducer(initialState, action)).toEqual([
        { max_message_id: 2, user_ids: [users[1].user_id] },
        { max_message_id: 1, user_ids: [users[0].user_id] },
      ]);
    });
  });
});
