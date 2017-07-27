import deepFreeze from 'deep-freeze';

import unreadReducers from '../unreadReducers';
import { REALM_INIT, ACCOUNT_SWITCH } from '../../actionConstants';

describe('unreadReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze(['some_stream']);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        streams: [],
        huddles: [],
        pms: [],
        mentions: [],
      };

      const actualState = unreadReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs" key replaces the current state ', () => {
      const initialState = deepFreeze({
        streams: [],
        huddles: [],
        pms: [],
        mentions: [],
      });

      const unreadMsgsData = {
        streams: [
          {
            stream_id: 1,
            topic: 'some topic',
            unread_message_ids: [1, 2, 3],
          },
        ],
        huddles: [],
        pms: [],
        mentions: [],
      };

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: unreadMsgsData,
        },
      });

      const actualState = unreadReducers(initialState, action);

      expect(actualState).toBe(unreadMsgsData);
    });
  });
});
