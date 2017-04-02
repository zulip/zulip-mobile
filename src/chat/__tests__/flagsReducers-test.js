import flagsReducers from '../flagsReducers';
import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
  ACCOUNT_SWITCH,
} from '../../constants';

describe('flagsReducers', () => {
  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const initialState = {};
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        messages: [{ id: 1 }, { id: 2, flags: [] }, { id: 3, flags: ['read'] }],
      };
      const expectedState = {
        read: {
          3: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const initialState = {
      read: {
        3: true,
      },
    };
    const action = {
      type: MESSAGE_FETCH_SUCCESS,
      messages: [{ id: 1, flags: ['read'] }, { id: 2, flags: [] }],
    };
    const expectedState = {
      read: {
        1: true,
        3: true,
      },
    };

    const actualState = flagsReducers(initialState, action);

    expect(actualState).toEqual(expectedState);
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('when no flags key is passed, do not fail, do nothing', () => {
      const initialState = {};
      const action = {
        type: EVENT_NEW_MESSAGE,
        message: { id: 2 },
      };
      const expectedState = {};

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds to store flags from new message', () => {
      const initialState = {};
      const action = {
        type: EVENT_NEW_MESSAGE,
        message: { id: 2, flags: ['read'] },
      };
      const expectedState = {
        read: {
          2: true,
        },
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
        operation: 'add',
      };
      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists, do not duplicate', () => {
      const initialState = {
        starred: {
          1: true,
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add',
      };
      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const initialState = {
        starred: {
          1: true,
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'add',
      };
      const expectedState = {
        starred: {
          1: true,
        },
        read: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const initialState = {
        read: {
          1: true,
        },
        starred: {
          2: true,
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3],
        flag: 'starred',
        operation: 'add',
      };
      const expectedState = {
        read: {
          1: true,
        },
        starred: {
          1: true,
          2: true,
          3: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const initialState = {
        read: {
          1: true,
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      };
      const expectedState = {
        read: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const initialState = {};
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      };
      const expectedState = {
        read: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes flags from multiple messages', () => {
      const initialState = {
        read: {
          1: true,
          3: true,
        },
        starred: {
          1: true,
          3: true,
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3, 4],
        flag: 'starred',
        operation: 'remove',
      };
      const expectedState = {
        read: {
          1: true,
          3: true,
        },
        starred: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MARK_MESSAGES_READ', () => {
    test('adds flag "read" to provided message ids', () => {
      const initialState = {
        read: {
          1: true,
        },
        starred: {
          1: true,
        },
      };
      const action = {
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3],
      };
      const expectedState = {
        read: {
          1: true,
          2: true,
          3: true,
        },
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets to initial state', () => {
      const prevState = {
        read: { 1: true },
        starred: { 1: true },
      };
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = {
        read: {},
      };

      const actualState = flagsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
