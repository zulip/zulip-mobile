import messagesReducers from '../messagesReducers';
import {
  CHAT_FETCHED_MESSAGES,
  CHAT_SET_MESSAGES,
  EVENT_NEW_MESSAGE,
} from '../../constants';

describe('messagesReducers', () => {
  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = messagesReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('CHAT_SET_MESSAGES', () => {
    test('replaces state with a copy of given messages', () => {
      const initialState = [];
      const messages = [{ id: 1 }, { id: 2 }];
      const action = { type: CHAT_SET_MESSAGES, messages };
      const newState = messagesReducers(initialState, action);
      expect(newState).toEqual(messages);
      expect(newState).not.toBe(initialState);
    });
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

  describe('CHAT_FETCHED_MESSAGES', () => {
    test('when shouldAppend is true, adds messages to the end of existing ones', () => {
      const initialState = [{ id: 1 }, { id: 2 }];
      const action = {
        type: CHAT_FETCHED_MESSAGES,
        shouldAppend: true,
        messages: [{ id: 3 }, { id: 4 }],
      };
      const newState = messagesReducers(initialState, action);
      expect(newState).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      expect(newState).not.toBe(initialState);
    });

    test('when shouldAppend is false, adds messages in front of existing ones', () => {
      const initialState = [{ id: 1 }, { id: 2 }];
      const action = {
        type: CHAT_FETCHED_MESSAGES,
        shouldAppend: false,
        messages: [{ id: 3 }, { id: 4 }],
      };
      const newState = messagesReducers(initialState, action);
      expect(newState).toEqual([{ id: 3 }, { id: 4 }, { id: 1 }, { id: 2 }]);
      expect(newState).not.toBe(initialState);
    });
  });
});
