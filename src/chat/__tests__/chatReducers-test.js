import { REHYDRATE } from 'redux-persist/constants';
import deepFreeze from 'deep-freeze';

import chatReducers from '../chatReducers';
import {
  homeNarrow,
  privateNarrow,
  groupNarrow,
  streamNarrow,
  topicNarrow,
  specialNarrow,
} from '../../utils/narrow';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';

describe('chatReducers', () => {
  const homeNarrowStr = JSON.stringify(homeNarrow());
  const privateNarrowStr = JSON.stringify(privateNarrow('mark@example.com'));
  const groupNarrowStr = JSON.stringify(groupNarrow(['mark@example.com', 'john@example.com']));
  const streamNarrowStr = JSON.stringify(streamNarrow('some stream'));
  const topicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some topic'));
  const allPrivateMessagesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = chatReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('SWITCH_NARROW', () => {
    test('changes active narrow', () => {
      const initialState = {
        narrow: [],
      };
      deepFreeze(initialState);

      const action = {
        type: SWITCH_NARROW,
        narrow: streamNarrow('some stream'),
      };
      deepFreeze(action);

      const expectedState = {
        narrow: streamNarrow('some stream'),
        caughtUp: { older: false, newer: false },
        fetching: { older: false, newer: false },
        editMessage: null,
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state producing a copy of messages', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_NEW_MESSAGE,
        message: { id: 3 },
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  test('Message sent to self is stored correctly', () => {
    const narrowWithSelfStr = JSON.stringify(privateNarrow('me@example.com'));
    const initialState = {
      messages: {
        [homeNarrowStr]: [],
        [narrowWithSelfStr]: [],
      },
    };
    deepFreeze(initialState);

    const message = {
      id: 1,
      display_recipient: [{ email: 'me@example.com' }],
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      ownEmail: 'me@example.com',
      message,
    };
    deepFreeze(action);

    const expectedState = {
      messages: {
        [homeNarrowStr]: [message],
        [narrowWithSelfStr]: [message],
      },
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends stream message to all cached narrows that match', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [allPrivateMessagesNarrowStr]: [{ id: 1 }, { id: 2 }],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
        [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
        [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
      },
    };
    deepFreeze(initialState);

    const message = {
      id: 3,
      type: 'stream',
      display_recipient: 'some stream',
      subject: 'some topic',
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message,
    };
    deepFreeze(action);

    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [allPrivateMessagesNarrowStr]: [{ id: 1 }, { id: 2 }],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }, message],
        [topicNarrowStr]: [{ id: 2 }, { id: 3 }, message],
        [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
        [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
      },
    };

    const newState = chatReducers(initialState, action);

    expect(newState.messages).toEqual(expectedState.messages);
    expect(newState).not.toBe(initialState);
  });

  test('does not append stream message to not cached narrows', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }],
      },
    };
    deepFreeze(initialState);

    const message = {
      id: 3,
      type: 'stream',
      display_recipient: 'stream name',
      subject: 'some topic',
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message,
    };
    deepFreeze(action);

    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, message],
      },
    };

    const newState = chatReducers(initialState, action);

    expect(newState.messages).toEqual(expectedState.messages);
    expect(newState).not.toBe(initialState);
  });

  test('appends private message to multiple cached narrows', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [allPrivateMessagesNarrowStr]: [{ id: 1 }, { id: 2 }],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
        [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
        [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
      },
    };
    deepFreeze(initialState);

    const message = {
      id: 5,
      type: 'private',
      sender_email: 'someone@example.com',
      display_recipient: [{ email: 'me@example.com' }, { email: 'mark@example.com' }],
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message,
      ownEmail: 'me@example.com',
    };
    deepFreeze(action);

    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [allPrivateMessagesNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
        [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }, { id: 4 }, message],
        [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
      },
    };

    const newState = chatReducers(initialState, action);

    expect(newState.messages).toEqual(expectedState.messages);
    expect(newState).not.toBe(initialState);
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          [privateNarrowStr]: [],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
      };
      deepFreeze(action);

      const newState = chatReducers(initialState, action);

      expect(newState.messages).toEqual(initialState.messages);
    });

    test('when a message exists in state, new state and new object is created with updated message in every key', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3, content: 'Old content' }],
          [privateNarrowStr]: [{ id: 3, content: 'Old content' }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_UPDATE_MESSAGE,
        message_id: 3,
        orig_rendered_content: '<p>Old content</p>',
        rendered_content: '<p>New content</p>',
        edit_timestamp: 123,
        prev_rendered_content_version: 1,
        user_id: 5,
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            { id: 1 },
            { id: 2 },
            {
              id: 3,
              content: '<p>New content</p>',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
          [privateNarrowStr]: [
            {
              id: 3,
              content: '<p>New content</p>',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState.messages).toEqual(expectedState.messages);
    });

    test('when event contains a new subject but no new content only subject is updated', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1, content: 'Old content', subject: 'Old subject' }],
          [privateNarrowStr]: [{ id: 1, content: 'Old content', subject: 'Old subject' }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_UPDATE_MESSAGE,
        message_id: 1,
        subject: 'New topic',
        orig_subject: 'Old subject',
        edit_timestamp: 123,
        user_id: 5,
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              subject: 'New topic',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
          [privateNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              subject: 'New topic',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState.messages).toEqual(expectedState.messages);
    });

    test('when event contains a new subject and a new content, update both and update edit history object', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              subject: 'New topic',
              last_edit_timestamp: 123,
              subject_links: [],
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
          [privateNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              subject: 'New topic',
              last_edit_timestamp: 123,
              subject_links: [],
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_UPDATE_MESSAGE,
        message_id: 1,
        orig_rendered_content: '<p>Old content</p>',
        rendered_content: '<p>New content</p>',
        subject: 'New updated topic',
        orig_subject: 'New topic',
        prev_rendered_content_version: 1,
        edit_timestamp: 456,
        user_id: 5,
        subject_links: [],
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            {
              id: 1,
              content: '<p>New content</p>',
              subject: 'New updated topic',
              last_edit_timestamp: 456,
              subject_links: [],
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  prev_subject: 'New topic',
                  timestamp: 456,
                  user_id: 5,
                },
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
          [privateNarrowStr]: [
            {
              id: 1,
              content: '<p>New content</p>',
              subject: 'New updated topic',
              last_edit_timestamp: 456,
              subject_links: [],
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  prev_subject: 'New topic',
                  timestamp: 456,
                  user_id: 5,
                },
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
            },
          ],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState.messages).toEqual(expectedState.messages);
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1, reactions: [] }, { id: 2, reactions: [] }],
          [privateNarrowStr]: [{ id: 1, reactions: [] }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_REACTION_ADD,
        messageId: 2,
        emoji: 'hello',
        user: {},
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            { id: 1, reactions: [] },
            { id: 2, reactions: [{ emoji_name: 'hello', user: {} }] },
          ],
          [privateNarrowStr]: [{ id: 1, reactions: [] }],
        },
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_REMOVE', () => {
    test('if message does not contain reaction, no change is made', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1, reactions: [] }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_REACTION_REMOVE,
        messageId: 1,
        emoji: 'hello',
        user: {},
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [{ id: 1, reactions: [] }],
        },
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('reaction is removed only from specified message, only for given user', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [
            {
              id: 1,
              reactions: [
                { emoji_name: 'hello', user: { email: 'bob@example.com' } },
                { emoji_name: 'hello', user: { email: 'mark@example.com' } },
                { emoji_name: 'goodbye', user: { email: 'bob@example.com' } },
              ],
            },
          ],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: EVENT_REACTION_REMOVE,
        messageId: 1,
        emoji: 'hello',
        user: { email: 'bob@example.com' },
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            {
              id: 1,
              reactions: [
                { emoji_name: 'hello', user: { email: 'mark@example.com' } },
                { emoji_name: 'goodbye', user: { email: 'bob@example.com' } },
              ],
            },
          ],
        },
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('no duplicate messages', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        narrow: [],
        messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [{ id: 4 }, { id: 1 }, { id: 2 }, { id: 3 }],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState.messages).toEqual(expectedState.messages);
      expect(newState).not.toBe(initialState);
    });

    test('added messages are sorted by timestamp', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1, timestamp: 3 }, { id: 2, timestamp: 4 }],
        },
      };
      deepFreeze(initialState);

      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        narrow: [],
        messages: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      };
      deepFreeze(action);

      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            { id: 4, timestamp: 1 },
            { id: 3, timestamp: 2 },
            { id: 1, timestamp: 3 },
            { id: 2, timestamp: 4 },
          ],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState.messages).toEqual(expectedState.messages);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('REHYDRATE', () => {
    test('when initial fetch is needed, home narrow messages cache is emptied', () => {
      const initialState = {};
      deepFreeze(initialState);

      const action = {
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '123' }],
          chat: {
            fetching: { older: true, newer: true },
            caughtUp: { older: false, newer: false },
            narrow: streamNarrow('some stream'),
            messages: {
              [homeNarrowStr]: [{ id: 4 }, { id: 1 }, { id: 2 }, { id: 3 }],
              [streamNarrowStr]: [{ id: 6 }, { id: 9 }, { id: 7 }, { id: 5 }],
            },
          },
        },
      };
      deepFreeze(action);

      const expectedState = {
        fetching: { older: true, newer: true },
        caughtUp: { older: false, newer: false },
        narrow: streamNarrow('some stream'),
        messages: {
          [homeNarrowStr]: [],
          [streamNarrowStr]: [{ id: 6 }, { id: 9 }, { id: 7 }, { id: 5 }],
        },
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
