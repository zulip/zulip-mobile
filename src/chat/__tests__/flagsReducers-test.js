import flagsReducers from '../flagsReducers';
import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../../constants';

describe('flagsReducers', () => {
  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const initialState = {};
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        messages: [
          { id: 1 },
          { id: 2, flags: [] },
          { id: 3, flags: ['read'] },
        ],
      };
      const expectedState = {
        1: [],
        2: [],
        3: ['read'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const initialState = {
      1: [],
      3: ['read'],
    };
    const action = {
      type: MESSAGE_FETCH_SUCCESS,
      messages: [
        { id: 1, flags: ['read'] },
        { id: 2, flags: [] },
      ],
    };
    const expectedState = {
      1: ['read'],
      2: [],
      3: ['read'],
    };

    const actualState = flagsReducers(initialState, action);

    expect(actualState).toEqual(expectedState);
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('adds to store flags from new message', () => {
      const initialState = {
        1: [],
      };
      const action = {
        type: EVENT_NEW_MESSAGE,
        message: { id: 2, flags: [] },
      };
      const expectedState = {
        1: [],
        2: [],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add", adds flag to an empty state', () => {
      const initialState = {};
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add'
      };
      const expectedState = {
        1: ['starred'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists, do not duplicate', () => {
      const initialState = {
        1: ['starred'],
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add'
      };
      const expectedState = {
        1: ['starred'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const initialState = {
        1: ['starred'],
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'add'
      };
      const expectedState = {
        1: ['starred', 'read'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const initialState = {
        1: ['read'],
        2: ['starred']
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3],
        flag: 'starred',
        operation: 'add'
      };
      const expectedState = {
        1: ['read', 'starred'],
        2: ['starred'],
        3: ['starred'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const initialState = {
        1: ['read'],
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove'
      };
      const expectedState = {
        1: [],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const initialState = {
        1: [],
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove'
      };
      const expectedState = {
        1: [],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes flags from multiple messages', () => {
      const initialState = {
        1: ['read'],
        2: ['starred'],
        3: ['starred', 'read'],
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3, 4],
        flag: 'starred',
        operation: 'remove'
      };
      const expectedState = {
        1: ['read'],
        2: [],
        3: ['read'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MARK_MESSAGES_READ', () => {
    test('adds flag "read" to provided message ids', () => {
      const initialState = {
        1: ['read'],
        2: ['starred']
      };
      const action = {
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3],
      };
      const expectedState = {
        1: ['read'],
        2: ['starred', 'read'],
        3: ['read'],
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
