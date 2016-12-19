import messagesReducers from '../chatReducers';
import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
} from '../../constants';

describe('chatReducers', () => {
  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = messagesReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state producing a copy of messages', () => {
      const initialState = [{ id: 1 }, { id: 2 }];
      const action = { type: EVENT_NEW_MESSAGE, message: { id: 3 } };
      const newState = messagesReducers(initialState, action);
      expect(newState).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('if message is not shown, do not change state', () => {
      const initialState = [{ id: 1 }, { id: 2 }];
      const action = { type: EVENT_UPDATE_MESSAGE, messageId: 3 };
      const newState = messagesReducers(initialState, action);
      expect(newState).toBe(initialState);
    });

    test('when a message exists in state, new state and new object is created with updated message', () => {
      const initialState = [{ id: 1 }, { id: 2 }, { id: 3, content: 'Old content' }];
      const action = {
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
        newContent: 'New content',
        editTimestamp: 123,
      };
      const newState = messagesReducers(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(initialState[2]).not.toBe(newState[2]);
      expect(newState).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3, content: 'New content', edit_timestamp: 123 }
      ]);
    });
  });

  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('when new messages with already existing messages come, they are merged and not duplicated', () => {
      const initialState = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        shouldAppend: false,
        messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      };
      const newState = messagesReducers(initialState, action);
      expect(newState).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      expect(newState).not.toBe(initialState);
    });

    test('when shouldAppend is false, adds messages in front of existing ones', () => {
      const initialState = [
        { id: 1, timestamp: 3 },
        { id: 2, timestamp: 4 },
      ];
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        shouldAppend: false,
        messages: [
          { id: 3, timestamp: 2 },
          { id: 4, timestamp: 1 },
        ],
      };
      const expectedMessages = [
        { id: 4, timestamp: 1 },
        { id: 3, timestamp: 2 },
        { id: 1, timestamp: 3 },
        { id: 2, timestamp: 4 },
      ];

      const newState = messagesReducers(initialState, action);

      expect(newState).toEqual(expectedMessages);
      expect(newState).not.toBe(initialState);
    });
  });
});
