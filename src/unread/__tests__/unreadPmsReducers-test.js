import deepFreeze from 'deep-freeze';

import unreadPmsReducers from '../unreadPmsReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  MARK_MESSAGES_READ,
  //  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';

describe('unreadPmsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.pms" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: {
            streams: [{}, {}],
            huddles: [{}, {}, {}],
            pms: [
              {
                sender_id: 1,
                unread_message_ids: [1, 2, 4, 5],
              },
            ],
            mentions: [1, 2, 3],
          },
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 4, 5],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
        },
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not private, return original state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'stream',
          sender_id: 1,
        },
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id does not exist, append to state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 1,
          display_recipient: [{ email: 'john@example.com' }, { email: 'me@example.com' }],
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if sender id does not exist, append to state as new sender', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 2,
          display_recipient: [{ email: 'john@example.com' }, { email: 'me@example.com' }],
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: 2,
          unread_message_ids: [4],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MARK_MESSAGES_READ', () => {
    test('when ids are not contained already, do not change the state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3],
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message ids exist in state, remove them', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4, 5],
        },
        {
          sender_id: 2,
          unread_message_ids: [6, 7],
        },
      ]);

      const action = deepFreeze({
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3, 6, 7],
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [4, 5],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  // describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
  //   test('when operation is "add" and flag is "read" adds message id to state', () => {
  //     const initialState = deepFreeze([]);
  //
  //     const action = {
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1, 2, 3],
  //       flag: 'read',
  //       operation: 'add',
  //     };
  //
  //     const expectedState = [
  //       {
  //         sender_id: 1,
  //         unread_message_ids: [1, 2, 3, 4, 5],
  //       },
  //     ];
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toEqual(expectedState);
  //   });
  //
  //   test('if flag already exists do not mutate state', () => {
  //     const initialState = deepFreeze([1]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1],
  //       flag: 'read',
  //       operation: 'add',
  //     });
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toBe(initialState);
  //   });
  //
  //   test('if other flags exist, adds new one to the list', () => {
  //     const initialState = deepFreeze([]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1],
  //       flag: 'read',
  //       operation: 'add',
  //     });
  //
  //     const expectedState = [1];
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toEqual(expectedState);
  //   });
  //
  //   test('adds flags for multiple messages', () => {
  //     const initialState = deepFreeze([]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1],
  //       flag: 'starred',
  //       operation: 'add',
  //     });
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toBe(initialState);
  //   });
  //
  //   test('when operation is "remove" removes a flag from message', () => {
  //     const initialState = deepFreeze([1]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1],
  //       flag: 'read',
  //       operation: 'remove',
  //     });
  //
  //     const expectedState = [];
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toEqual(expectedState);
  //   });
  //
  //   test('if flag does not exist, do nothing', () => {
  //     const initialState = deepFreeze([]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1],
  //       flag: 'read',
  //       operation: 'remove',
  //     });
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toBe(initialState);
  //   });
  //
  //   test('removes flags from multiple messages', () => {
  //     const initialState = deepFreeze([1, 2, 3, 4, 5]);
  //
  //     const action = deepFreeze({
  //       type: EVENT_UPDATE_MESSAGE_FLAGS,
  //       messages: [1, 2, 3, 6, 7],
  //       flag: 'read',
  //       operation: 'remove',
  //     });
  //
  //     const expectedState = [4, 5];
  //
  //     const actualState = unreadPmsReducers(initialState, action);
  //
  //     expect(actualState).toEqual(expectedState);
  //   });
  // });
});
