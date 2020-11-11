/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import narrowsReducer from '../narrowsReducer';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  privateNarrow,
  ALL_PRIVATE_NARROW_STR,
  groupNarrow,
  streamNarrow,
  topicNarrow,
  STARRED_NARROW_STR,
} from '../../utils/narrow';
import {
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../../anchor';
import * as eg from '../../__tests__/lib/exampleData';

describe('narrowsReducer', () => {
  const privateNarrowStr = JSON.stringify(privateNarrow('mark@example.com'));
  const groupNarrowStr = JSON.stringify(groupNarrow(['mark@example.com', 'john@example.com']));
  const streamNarrowStr = JSON.stringify(streamNarrow('some stream'));
  const topicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some topic'));

  describe('EVENT_NEW_MESSAGE', () => {
    test('if not caught up in narrow, do not add message in home narrow', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const message = eg.streamMessage({
        id: 3,
        display_recipient: 'some stream',
        subject: 'some topic',
        flags: [],
      });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        type: EVENT_NEW_MESSAGE,
        message,
        caughtUp: {},
      });

      const newState = narrowsReducer(initialState, action);

      const expectedState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      expect(newState).toEqual(expectedState);
    });

    test('appends message to state producing a copy of messages', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const message = eg.streamMessage({ id: 3, flags: [] });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message,
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: false,
            newer: true,
          },
        },
      });

      const expectedState = {
        [HOME_NARROW_STR]: [1, 2, 3],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('if new message key does not exist do not create it', () => {
      const initialState = deepFreeze({
        [topicNarrowStr]: [1, 2],
      });

      const message = eg.streamMessage({
        id: 3,
        flags: [],
        display_recipient: 'stream',
        subject: 'topic',
      });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message,
        caughtUp: {},
      });

      const newState = narrowsReducer(initialState, action);

      const expectedState = {
        [topicNarrowStr]: [1, 2],
      };
      expect(newState).toEqual(expectedState);
    });
  });

  test('if new message is private or group add it to the "allPrivate" narrow', () => {
    const initialState = deepFreeze({
      [ALL_PRIVATE_NARROW_STR]: [],
    });
    const message = eg.pmMessage({
      id: 1,
      display_recipient: [{ email: 'me@example.com' }, { email: 'a@a.com' }, { email: 'b@b.com' }],
      flags: [],
    });
    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      message,
      ownEmail: 'me@example.com',
      caughtUp: {
        [ALL_PRIVATE_NARROW_STR]: { older: true, newer: true },
      },
    });
    const expectedState = {
      [ALL_PRIVATE_NARROW_STR]: [1],
    };

    const actualState = narrowsReducer(initialState, action);

    expect(actualState).toEqual(expectedState);
  });

  test('message sent to topic is stored correctly', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [1, 2],
      [topicNarrowStr]: [2],
    });

    const message = eg.streamMessage({
      id: 3,
      flags: [],
      display_recipient: 'some stream',
      subject: 'some topic',
    });

    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      message,
      caughtUp: {
        [HOME_NARROW_STR]: {
          older: false,
          newer: false,
        },
        [topicNarrowStr]: {
          older: false,
          newer: true,
        },
      },
    });
    const expectedState = {
      [HOME_NARROW_STR]: [1, 2],
      [topicNarrowStr]: [2, message.id],
    };

    const newState = narrowsReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('message sent to self is stored correctly', () => {
    const narrowWithSelfStr = JSON.stringify(privateNarrow('me@example.com'));
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [],
      [narrowWithSelfStr]: [],
    });

    const message = eg.pmMessage({
      id: 1,
      display_recipient: [{ email: 'me@example.com' }],
      flags: [],
    });

    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      ownEmail: 'me@example.com',
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
        [narrowWithSelfStr]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [message.id],
      [narrowWithSelfStr]: [message.id],
    };

    const newState = narrowsReducer(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends stream message to all cached narrows that match and are caught up', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [1, 2],
      [ALL_PRIVATE_NARROW_STR]: [1, 2],
      [streamNarrowStr]: [2, 3],
      [topicNarrowStr]: [2, 3],
      [privateNarrowStr]: [2, 4],
      [groupNarrowStr]: [2, 4],
    });

    const message = eg.streamMessage({
      id: 5,
      flags: [],
      display_recipient: 'some stream',
      subject: 'some topic',
    });

    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
        [streamNarrowStr]: { older: false, newer: true },
        [topicNarrowStr]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [1, 2, message.id],
      [ALL_PRIVATE_NARROW_STR]: [1, 2],
      [streamNarrowStr]: [2, 3, message.id],
      [topicNarrowStr]: [2, 3, message.id],
      [privateNarrowStr]: [2, 4],
      [groupNarrowStr]: [2, 4],
    };

    const newState = narrowsReducer(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('does not append stream message to not cached narrows', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [1],
    });

    const message = eg.streamMessage({ id: 3, flags: [] });

    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [1, message.id],
    };

    const newState = narrowsReducer(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends private message to multiple cached narrows', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [1, 2],
      [ALL_PRIVATE_NARROW_STR]: [1, 2],
      [streamNarrowStr]: [2, 3],
      [topicNarrowStr]: [2, 3],
      [privateNarrowStr]: [2, 4],
      [groupNarrowStr]: [2, 4],
    });

    const message = eg.pmMessage({
      id: 5,
      flags: [],
      sender: eg.selfUser,
      display_recipient: [eg.displayRecipientFromUser(eg.selfUser), { email: 'mark@example.com' }],
    });

    const action = deepFreeze({
      ...eg.eventNewMessageActionBase,
      message,
      caughtUp: Object.fromEntries(
        Object.keys(initialState).map(key => [key, { older: false, newer: true }]),
      ),
    });

    const expectedState = {
      [HOME_NARROW_STR]: [1, 2, message.id],
      [ALL_PRIVATE_NARROW_STR]: [1, 2, message.id],
      [streamNarrowStr]: [2, 3],
      [topicNarrowStr]: [2, 3],
      [privateNarrowStr]: [2, 4, message.id],
      [groupNarrowStr]: [2, 4],
    };

    const newState = narrowsReducer(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
        [privateNarrowStr]: [],
      });

      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageIds: [3],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toBe(initialState);
    });

    test('if a message exists in one or more narrows delete it from there', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2, 3],
        [privateNarrowStr]: [2],
      });
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageIds: [2],
      });
      const expectedState = deepFreeze({
        [HOME_NARROW_STR]: [1, 3],
        [privateNarrowStr]: [],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if multiple messages indicated, delete the ones that exist', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2, 3],
        [privateNarrowStr]: [2],
      });
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageIds: [2, 3, 4],
      });
      const expectedState = deepFreeze({
        [HOME_NARROW_STR]: [1],
        [privateNarrowStr]: [],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_START', () => {
    test('if fetching for a search narrow, ignore', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: [{ operator: 'search', operand: 'some query' }],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, it's fully possible:
      // MESSAGE_FETCH_START applies the identity function to the
      // state (i.e., it doesn't do anything to it). Reversing that
      // effect is also done with the identity function.
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {
          older: true,
          newer: true,
        },
      });

      const messageFetchStartAction = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: HOME_NARROW,
      });

      const state1 = narrowsReducer(initialState, messageFetchStartAction);

      const messageFetchErrorAction = deepFreeze({
        type: MESSAGE_FETCH_ERROR,
        narrow: HOME_NARROW,
        error: new Error(),
      });

      const finalState = narrowsReducer(state1, messageFetchErrorAction);

      expect(finalState).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('if no messages returned still create the key in state', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2, 3],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 2,
        narrow: privateNarrow('mark@example.com'),
        messages: [],
        numBefore: 100,
        numAfter: 100,
        foundNewest: false,
        foundOldest: false,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [1, 2, 3],
        [JSON.stringify(privateNarrow('mark@example.com'))]: [],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('no duplicate messages', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2, 3],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 2,
        narrow: [],
        messages: [
          eg.streamMessage({ id: 2 }),
          eg.streamMessage({ id: 3 }),
          eg.streamMessage({ id: 4 }),
        ],
        numBefore: 100,
        numAfter: 100,
        foundNewest: false,
        foundOldest: false,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [1, 2, 3, 4],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('added messages are sorted by id', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 2,
        narrow: [],
        messages: [
          eg.streamMessage({ id: 3, timestamp: 2 }),
          eg.streamMessage({ id: 4, timestamp: 1 }),
        ],
        numBefore: 100,
        numAfter: 100,
        foundNewest: false,
        foundOldest: false,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [1, 2, 3, 4],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR previous messages are replaced', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        anchor: FIRST_UNREAD_ANCHOR,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [
          eg.streamMessage({ id: 3, timestamp: 2 }),
          eg.streamMessage({ id: 4, timestamp: 1 }),
        ],
        numBefore: 100,
        numAfter: 100,
        foundNewest: false,
        foundOldest: false,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [3, 4],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('when anchor is LAST_MESSAGE_ANCHOR previous messages are replaced', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        anchor: LAST_MESSAGE_ANCHOR,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [
          eg.streamMessage({ id: 3, timestamp: 2 }),
          eg.streamMessage({ id: 4, timestamp: 1 }),
        ],
        numBefore: 100,
        numAfter: 0,
        foundNewest: true,
        foundOldest: false,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [3, 4],
      };

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if fetched messages are from a search narrow, ignore them', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        narrow: [{ operator: 'search', operand: 'some query' }],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    const allMessages = {
      // Flow doesn't like number literals as keys...but it also wants
      // them to be numbers. See https://github.com/facebook/flow/issues/380.
      [1]: eg.streamMessage({ id: 1 }) /* eslint-disable-line no-useless-computed-key */,
      [2]: eg.streamMessage({ id: 2 }) /* eslint-disable-line no-useless-computed-key */,
      [4]: eg.streamMessage({ id: 4 }) /* eslint-disable-line no-useless-computed-key */,
    };

    test('Do nothing if the is:starred narrow has not been fetched', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        id: 1,
        allMessages,
        all: false,
        flag: 'starred',
        operation: 'add',
        messages: [4, 2],
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });

    test("Do nothing if action.flag is not 'starred'", () => {
      const initialState = deepFreeze({
        [STARRED_NARROW_STR]: [1, 2],
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        id: 1,
        all: false,
        allMessages,
        operation: 'add',
        messages: [1],
        flag: 'read',
      });

      const newState = narrowsReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });

    test(
      'Adds, while maintaining chronological order, '
        + 'newly starred messages to the is:starred narrow',
      () => {
        const initialState = deepFreeze({
          [STARRED_NARROW_STR]: [1, 3, 5],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_FLAGS,
          id: 1,
          allMessages,
          all: false,
          flag: 'starred',
          operation: 'add',
          messages: [4, 2],
        });

        const expectedState = {
          [STARRED_NARROW_STR]: [1, 2, 3, 4, 5],
        };

        const newState = narrowsReducer(initialState, action);

        expect(newState).toEqual(expectedState);
      },
    );

    test(
      'Removes, while maintaining chronological order, '
        + 'newly unstarred messages from the is:starred narrow',
      () => {
        const initialState = deepFreeze({
          [STARRED_NARROW_STR]: [1, 2, 3, 4, 5],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_FLAGS,
          id: 1,
          allMessages,
          all: false,
          flag: 'starred',
          operation: 'remove',
          messages: [4, 2],
        });

        const expectedState = {
          [STARRED_NARROW_STR]: [1, 3, 5],
        };

        const newState = narrowsReducer(initialState, action);

        expect(newState).toEqual(expectedState);
      },
    );
  });
});
