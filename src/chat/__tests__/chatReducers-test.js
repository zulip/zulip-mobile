import deepFreeze from 'deep-freeze';

import chatReducers from '../chatReducers';
import {
  HOME_NARROW_STR,
  privateNarrow,
  ALL_PRIVATE_NARROW_STR,
  groupNarrow,
  streamNarrow,
  topicNarrow,
} from '../../utils/narrow';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';
import { LAST_MESSAGE_ANCHOR } from '../../constants';

describe('chatReducers', () => {
  const privateNarrowStr = JSON.stringify(privateNarrow('mark@example.com'));
  const groupNarrowStr = JSON.stringify(groupNarrow(['mark@example.com', 'john@example.com']));
  const streamNarrowStr = JSON.stringify(streamNarrow('some stream'));
  const topicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some topic'));

  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = chatReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if not caught up in narrow, do not add message in home narrow', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      });

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3, display_recipient: 'some stream', subject: 'some topic' },
        caughtUp: {},
      });

      const newState = chatReducers(initialState, action);

      const expectedState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      });

      expect(newState).toEqual(expectedState);
    });

    test('appends message to state producing a copy of messages', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      });

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3 },
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: false,
            newer: true,
          },
        },
      });

      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('if new message key does not exist do not create it', () => {
      const initialState = deepFreeze({
        [JSON.stringify(topicNarrow('some stream', 'some topic'))]: [{ id: 1 }, { id: 2 }],
      });

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3, type: 'stream', display_recipient: 'stream', subject: 'topic' },
        caughtUp: {},
      });

      const newState = chatReducers(initialState, action);

      const expectedState = {
        [JSON.stringify(topicNarrow('some stream', 'some topic'))]: [{ id: 1 }, { id: 2 }],
      };
      expect(newState).toEqual(expectedState);
    });
  });

  test('if new message is private or group add it to the "allPrivate" narrow', () => {
    const initialState = deepFreeze({
      [ALL_PRIVATE_NARROW_STR]: [],
    });
    const message = {
      id: 1,
      type: 'private',
      display_recipient: [{ email: 'me@example.com' }, { email: 'a@a.com' }, { email: 'b@b.com' }],
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
      message,
      ownEmail: 'me@example.com',
      caughtUp: {
        [ALL_PRIVATE_NARROW_STR]: { older: true, newer: true },
      },
    });
    const expectedState = {
      [ALL_PRIVATE_NARROW_STR]: [message],
    };

    const actualState = chatReducers(initialState, action);

    expect(actualState).toEqual(expectedState);
  });

  test('message sent to topic is stored correctly', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [topicNarrowStr]: [{ id: 2 }],
    });
    const message = {
      id: 3,
      type: 'stream',
      display_recipient: 'some stream',
      subject: 'some topic',
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
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
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [topicNarrowStr]: [{ id: 2 }, message],
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('message sent to self is stored correctly', () => {
    const narrowWithSelfStr = JSON.stringify(privateNarrow('me@example.com'));
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [],
      [narrowWithSelfStr]: [],
    });

    const message = {
      id: 1,
      display_recipient: [{ email: 'me@example.com' }],
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
      ownEmail: 'me@example.com',
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
        [narrowWithSelfStr]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [message],
      [narrowWithSelfStr]: [message],
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends stream message to all cached narrows that match and are caught up', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [ALL_PRIVATE_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
      [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
      [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
      [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
    });

    const message = {
      id: 5,
      type: 'stream',
      display_recipient: 'some stream',
      subject: 'some topic',
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
        [streamNarrowStr]: { older: false, newer: true },
        [topicNarrowStr]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, message],
      [ALL_PRIVATE_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [streamNarrowStr]: [{ id: 2 }, { id: 3 }, message],
      [topicNarrowStr]: [{ id: 2 }, { id: 3 }, message],
      [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
      [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('does not append stream message to not cached narrows', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [{ id: 1 }],
    });

    const message = {
      id: 3,
      type: 'stream',
      display_recipient: 'stream name',
      subject: 'some topic',
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
      message,
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [{ id: 1 }, message],
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends private message to multiple cached narrows', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [ALL_PRIVATE_NARROW_STR]: [{ id: 1 }, { id: 2 }],
      [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
      [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
      [privateNarrowStr]: [{ id: 2 }, { id: 4 }],
      [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
    });

    const message = {
      id: 5,
      type: 'private',
      sender_email: 'someone@example.com',
      display_recipient: [{ email: 'me@example.com' }, { email: 'mark@example.com' }],
    };
    const action = deepFreeze({
      type: EVENT_NEW_MESSAGE,
      message,
      ownEmail: 'me@example.com',
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
        [ALL_PRIVATE_NARROW_STR]: { older: false, newer: true },
        [privateNarrowStr]: { older: false, newer: true },
      },
    });

    const expectedState = {
      [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, message],
      [ALL_PRIVATE_NARROW_STR]: [{ id: 1 }, { id: 2 }, message],
      [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
      [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
      [privateNarrowStr]: [{ id: 2 }, { id: 4 }, message],
      [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
    };

    const newState = chatReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
        [privateNarrowStr]: [],
      });

      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageId: 3,
      });

      const newState = chatReducers(initialState, action);

      expect(newState).toBe(initialState);
    });

    test('if a message exists in one or more narrows delete it from there', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }],
      });
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageId: 2,
      });
      const expectedState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 3 }],
        [privateNarrowStr]: [],
      });

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }],
        [privateNarrowStr]: [],
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
      });

      const newState = chatReducers(initialState, action);

      expect(newState).toBe(initialState);
    });

    test('when a message exists in state, new state and new object is created with updated message in every key', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3, content: 'Old content' }],
        [privateNarrowStr]: [{ id: 3, content: 'Old content' }],
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE,
        message_id: 3,
        orig_rendered_content: '<p>Old content</p>',
        rendered_content: '<p>New content</p>',
        edit_timestamp: 123,
        prev_rendered_content_version: 1,
        user_id: 5,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
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
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject but no new content only subject is updated', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, content: 'Old content', subject: 'Old subject' }],
        [privateNarrowStr]: [{ id: 1, content: 'Old content', subject: 'Old subject' }],
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE,
        message_id: 1,
        subject: 'New topic',
        orig_subject: 'Old subject',
        edit_timestamp: 123,
        user_id: 5,
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
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
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject and a new content, update both and update edit history object', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [
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
      });

      const action = deepFreeze({
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
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
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
      };

      const newState = chatReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, reactions: [] }, { id: 2, reactions: [] }],
        [privateNarrowStr]: [{ id: 1, reactions: [] }],
      });

      const action = deepFreeze({
        type: EVENT_REACTION_ADD,
        message_id: 2,
        emoji_name: 'hello',
        user: {},
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
          { id: 1, reactions: [] },
          { id: 2, reactions: [{ emoji_name: 'hello', user: {} }] },
        ],
        [privateNarrowStr]: [{ id: 1, reactions: [] }],
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_REMOVE', () => {
    test('if message does not contain reaction, no change is made', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, reactions: [] }],
      });

      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        message_id: 1,
        emoji_name: 'hello',
        user: {},
      });

      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 1, reactions: [] }],
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('reaction is removed only from specified message, only for given user', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [
          {
            id: 1,
            reactions: [
              { emoji_name: 'hello', user: { email: 'bob@example.com' } },
              { emoji_name: 'hello', user: { email: 'mark@example.com' } },
              { emoji_name: 'goodbye', user: { email: 'bob@example.com' } },
            ],
          },
        ],
      });

      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        message_id: 1,
        emoji_name: 'hello',
        user: { email: 'bob@example.com' },
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
          {
            id: 1,
            reactions: [
              { emoji_name: 'hello', user: { email: 'mark@example.com' } },
              { emoji_name: 'goodbye', user: { email: 'bob@example.com' } },
            ],
          },
        ],
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('if no messages returned still create the key in state', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: privateNarrow('mark@example.com'),
        messages: [],
      });
      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [JSON.stringify(privateNarrow('mark@example.com'))]: [],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('no duplicate messages', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      });

      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('added messages are sorted by id', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 2, timestamp: 3 }, { id: 1, timestamp: 3 }],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 4, timestamp: 2 }, { id: 3, timestamp: 1 }],
      });

      const expectedState = {
        [HOME_NARROW_STR]: [
          { id: 1, timestamp: 3 },
          { id: 2, timestamp: 3 },
          { id: 3, timestamp: 1 },
          { id: 4, timestamp: 2 },
        ],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('when anchor is 0 previous messages are replaced', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, timestamp: 3 }, { id: 2, timestamp: 4 }],
      });

      const action = deepFreeze({
        anchor: 0,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      });

      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('when anchor is LAST_MESSAGE_ANCHOR previous messages are replaced', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, timestamp: 3 }, { id: 2, timestamp: 4 }],
      });

      const action = deepFreeze({
        anchor: LAST_MESSAGE_ANCHOR,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      });

      const expectedState = {
        [HOME_NARROW_STR]: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('when anchor is 0 common messages are not replaced', () => {
      const commonMessages = [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }];
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [{ id: 1, timestamp: 3 }, ...commonMessages],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 0,
        narrow: [],
        messages: [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }],
      });

      const newState = chatReducers(initialState, action);

      expect(newState[HOME_NARROW_STR]).toEqual(commonMessages);
    });

    test('when anchor is 0 deep equal is performed to separate common messages', () => {
      const commonMessages = [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }];
      const changedMessage = { id: 4, timestamp: 6, subject: 'new topic' };
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: [
          { id: 1, timestamp: 3 },
          ...commonMessages,
          { id: 4, timestamp: 6, subject: 'some topic' },
        ],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 0,
        narrow: [],
        messages: [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }, changedMessage],
      });

      const expectedState = {
        [HOME_NARROW_STR]: [...commonMessages, changedMessage],
      };

      const newState = chatReducers(initialState, action);

      expect(newState[HOME_NARROW_STR]).toEqual(expectedState[HOME_NARROW_STR]);
    });
  });
});
