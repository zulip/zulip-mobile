import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../../constants';
import typingReducers from '../typingReducers';

describe('typingReducers', () => {
  describe('EVENT_TYPING_START', () => {
    test('adds sender as currently typing user', () => {
      const initialState = {};
      const action = {
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {
        'john@example.com': { user_id: 1, email: 'john@example.com' },
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if user is already typing, no change', () => {
      const initialState = {
        'john@example.com': 'john@example.com',
      };
      const action = {
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {
        'john@example.com': { user_id: 1, email: 'john@example.com' },
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if other people are typing in other narrows, add, do not affect them', () => {
      const initialState = {
        'john@example.com': { user_id: 1, email: 'john@example.com' },
      };
      const action = {
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'mark@example.com', user_id: 2 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'mark@example.com', user_id: 2 },
          { email: 'me@example.com', user_id: 3 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {
        'john@example.com': { user_id: 1, email: 'john@example.com' },
        'john@example.com,mark@example.com': { user_id: 2, email: 'mark@example.com' },
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if another user is typing already, replace him with new one', () => {
      const initialState = {
        'john@example.com,mark@example.com': 'john@example.com',
      };
      const action = {
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'mark@example.com', user_id: 2 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'mark@example.com', user_id: 2 },
          { email: 'me@example.com', user_id: 3 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {
        'john@example.com,mark@example.com': { user_id: 2, email: 'mark@example.com' },
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_TYPING_STOP', () => {
    test('if key with recipient exists it is removed', () => {
      const initialState = {
        'john@example.com': 'john@example.com',
        'mark@example.com': 'mark@example.com',
      };
      const action = {
        type: EVENT_TYPING_STOP,
        op: 'stop',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {
        'mark@example.com': 'mark@example.com',
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if typing state does not exist, no change is made', () => {
      const initialState = {};
      const action = {
        type: EVENT_TYPING_STOP,
        op: 'stop',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        selfEmail: 'me@example.com',
      };
      const expectedState = {};

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
