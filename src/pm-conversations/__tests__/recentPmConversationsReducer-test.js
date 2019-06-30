/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import recentPmConversationsReducer from '../recentPmConversationsReducer';
import { EVENT_NEW_MESSAGE } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';

describe('recentPmConversationsReducer', () => {
  describe('EVENT_NEW_MESSAGE', () => {
    test('reorder correctly upon recieving a new message', () => {
      const users = [eg.makeUser({ name: 'john' }), eg.makeUser({ name: 'mark' })];
      const newMessage = eg.pmMessage({
        id: 2,
        display_recipient: [eg.displayRecipientFromUser(users[1])],
      });
      const initialState = deepFreeze([
        { max_message_id: 1, user_ids: [users[0].user_id] },
        { max_message_id: 0, user_ids: [users[1].user_id] },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: newMessage,
        id: 0,
        caughtUp: {},
        ownEmail: '',
      });

      expect(recentPmConversationsReducer(initialState, action)).toEqual([
        { max_message_id: 2, user_ids: [users[1].user_id] },
        { max_message_id: 1, user_ids: [users[0].user_id] },
      ]);
    });
  });
});
