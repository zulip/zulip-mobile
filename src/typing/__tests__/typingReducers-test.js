import deepFreeze from 'deep-freeze';

import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../../actionConstants';
import typingReducers from '../typingReducers';
import { NULL_OBJECT } from '../../nullObjects';

describe('typingReducers', () => {
  describe('EVENT_TYPING_START', () => {
    test('adds sender as currently typing user', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'john@example.com': [1],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if user is already typing, no change', () => {
      const initialState = deepFreeze({
        'john@example.com': [1],
      });

      const action = deepFreeze({
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'john@example.com': [1],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if other people are typing in other narrows, add, do not affect them', () => {
      const initialState = deepFreeze({
        'john@example.com': [1],
      });

      const action = deepFreeze({
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'mark@example.com', user_id: 2 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'mark@example.com', user_id: 2 },
          { email: 'me@example.com', user_id: 3 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'john@example.com': [1],
        'john@example.com,mark@example.com': [2],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if another user is typing already, append new one', () => {
      const initialState = deepFreeze({
        'john@example.com,mark@example.com': [1],
      });

      const action = deepFreeze({
        type: EVENT_TYPING_START,
        op: 'start',
        sender: { email: 'mark@example.com', user_id: 2 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'mark@example.com', user_id: 2 },
          { email: 'me@example.com', user_id: 3 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'john@example.com,mark@example.com': [1, 2],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_TYPING_STOP', () => {
    test('if after removing, key is an empty list, key is removed', () => {
      const initialState = deepFreeze({
        'john@example.com': [1],
        'mark@example.com': [2],
      });

      const action = deepFreeze({
        type: EVENT_TYPING_STOP,
        op: 'stop',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'mark@example.com': [2],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if two people are typing, just one is removed', () => {
      const initialState = deepFreeze({
        'john@example.com': [1, 2],
      });

      const action = deepFreeze({
        type: EVENT_TYPING_STOP,
        op: 'stop',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {
        'john@example.com': [2],
      };

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if typing state does not exist, no change is made', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_TYPING_STOP,
        op: 'stop',
        sender: { email: 'john@example.com', user_id: 1 },
        recipients: [
          { email: 'john@example.com', user_id: 1 },
          { email: 'me@example.com', user_id: 2 },
        ],
        ownEmail: 'me@example.com',
      });

      const expectedState = {};

      const newState = typingReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
