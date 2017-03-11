import flagsReducers from '../flagsReducers';
import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
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
    test('TODO1', () => {
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

    test('TODO2', () => {
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
  });

  test('TODO3', () => {
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

  test('TODO4', () => {
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

  test('TODO5', () => {
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

  test('TODO6', () => {
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

  test('TODO7', () => {
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
