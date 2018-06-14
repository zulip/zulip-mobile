import deepFreeze from 'deep-freeze';

import chatReducers from '../chatReducers';
import {
  homeNarrowStr,
  privateNarrow,
  allPrivateNarrowStr,
  groupNarrow,
  streamNarrow,
  topicNarrow,
} from '../../utils/narrow';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_TOPIC,
  EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
  EVENT_UPDATE_MESSAGE_CONTENT,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';

describe('chatReducers', () => {
  const privateNarrowStr = JSON.stringify(privateNarrow('mark@example.com'));
  const groupNarrowStr = JSON.stringify(groupNarrow(['mark@example.com', 'john@example.com']));
  const streamNarrowStr = JSON.stringify(streamNarrow('some stream'));
  const topicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some topic'));
  const anotherTopicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some another topic'));

  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = chatReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if not caught up in narrow, do not add message in home narrow', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
      });

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3, display_recipient: 'some stream', subject: 'some topic' },
        caughtUp: {},
      });

      const newState = chatReducers(initialState, action);

      const expectedState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
      });

      expect(newState).toEqual(expectedState);
    });

    test('appends message to state producing a copy of messages', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
      });

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3 },
        caughtUp: {
          [homeNarrowStr]: {
            older: false,
            newer: true,
          },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
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

    test('if new message is private or group add it to the "allPrivate" narrow', () => {
      const initialState = deepFreeze({
        [allPrivateNarrowStr]: [],
      });
      const message = {
        id: 1,
        type: 'private',
        display_recipient: [
          { email: 'me@example.com' },
          { email: 'a@a.com' },
          { email: 'b@b.com' },
        ],
      };
      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message,
        ownEmail: 'me@example.com',
        caughtUp: {
          [allPrivateNarrowStr]: { older: true, newer: true },
        },
      });
      const expectedState = {
        [allPrivateNarrowStr]: [message],
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('message sent to topic is stored correctly', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
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
          [homeNarrowStr]: {
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
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [topicNarrowStr]: [{ id: 2 }, message],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('message sent to self is stored correctly', () => {
      const narrowWithSelfStr = JSON.stringify(privateNarrow('me@example.com'));
      const initialState = deepFreeze({
        [homeNarrowStr]: [],
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
          [homeNarrowStr]: { older: false, newer: true },
          [narrowWithSelfStr]: { older: false, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [message],
        [narrowWithSelfStr]: [message],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('appends stream message to all cached narrows that match and are caught up', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [allPrivateNarrowStr]: [{ id: 1 }, { id: 2 }],
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
          [homeNarrowStr]: { older: false, newer: true },
          [streamNarrowStr]: { older: false, newer: true },
          [topicNarrowStr]: { older: false, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [allPrivateNarrowStr]: [{ id: 1 }, { id: 2 }],
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
        [homeNarrowStr]: [{ id: 1 }],
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
          [homeNarrowStr]: { older: false, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, message],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('appends private message to multiple cached narrows', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [allPrivateNarrowStr]: [{ id: 1 }, { id: 2 }],
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
          [homeNarrowStr]: { older: false, newer: true },
          [allPrivateNarrowStr]: { older: false, newer: true },
          [privateNarrowStr]: { older: false, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [allPrivateNarrowStr]: [{ id: 1 }, { id: 2 }, message],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
        [topicNarrowStr]: [{ id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }, { id: 4 }, message],
        [groupNarrowStr]: [{ id: 2 }, { id: 4 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('consider newer caughtUp only if message id is greater than newest one in the narrow', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 5 }, { id: 10 }],
      });

      const message = {
        id: 0,
      };
      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message,
        ownEmail: 'me@example.com',
        caughtUp: {
          [homeNarrowStr]: { older: false, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 5 }, { id: 10 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('consider older caughtUp only if message id is less than oldest one in the narrow', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 5 }, { id: 10 }],
      });

      const message = {
        id: 0,
      };
      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message,
        ownEmail: 'me@example.com',
        caughtUp: {
          [homeNarrowStr]: { older: true, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [message, { id: 5 }, { id: 10 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('if message id is in between add it irrespective of caughtUp', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 5 }, { id: 10 }],
      });

      const message = {
        id: 7,
      };
      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message,
        ownEmail: 'me@example.com',
        caughtUp: {
          [homeNarrowStr]: { older: true, newer: true },
        },
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 5 }, message, { id: 10 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
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
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }],
      });
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageId: 2,
      });
      const expectedState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 3 }],
        [privateNarrowStr]: [],
      });

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('update message event, update can be of 3 types EVENT_UPDATE_MESSAGE_TOPIC, EVENT_UPDATE_MESSAGE_CONTENT_TOPIC, EVENT_UPDATE_MESSAGE_CONTENT', () => {
    describe('EVENT_UPDATE_MESSAGE_TOPIC', () => {
      test('if a message does not exist no changes are made', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          [privateNarrowStr]: [],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_TOPIC,
          messageId: 3,
        });

        const newState = chatReducers(initialState, action);

        expect(newState).toBe(initialState);
      });

      test('when event contains a new subject but no new content only subject is updated', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              display_recipient: 'some stream',
              subject: 'Old subject',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
          [streamNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              subject: 'Old subject',
              sender_email: 'a@example.com',
              display_recipient: 'some stream',
              subject_links: [],
            },
          ],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_TOPIC,
          message_id: 1,
          subject: 'New topic',
          orig_subject: 'Old subject',
          edit_timestamp: 123,
          user_id: 5,
          caughtUp: {
            [homeNarrowStr]: { older: false, newer: true },
            [streamNarrowStr]: { older: false, newer: true },
          },
          ownEmail: 'a@example.com',
        });

        const expectedState = {
          [homeNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              display_recipient: 'some stream',
              subject: 'New topic',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
          [streamNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              display_recipient: 'some stream',
              subject: 'New topic',
              last_edit_timestamp: 123,
              edit_history: [
                {
                  prev_subject: 'Old subject',
                  timestamp: 123,
                  user_id: 5,
                },
              ],
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
        };

        const newState = chatReducers(initialState, action);

        expect(newState).not.toBe(initialState);
        expect(newState).toEqual(expectedState);
      });
    });

    describe('EVENT_UPDATE_MESSAGE_CONTENT_TOPIC', () => {
      test('if a message does not exist no changes are made', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          [privateNarrowStr]: [],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
          messageId: 3,
        });

        const newState = chatReducers(initialState, action);

        expect(newState).toBe(initialState);
      });

      test('when event contains a new subject and a new content, update both and update edit history object', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              display_recipient: 'some stream',
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
          [streamNarrowStr]: [
            {
              id: 1,
              content: 'Old content',
              display_recipient: 'some stream',
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
          type: EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
          message_id: 1,
          orig_rendered_content: '<p>Old content</p>',
          rendered_content: '<p>New content</p>',
          subject: 'New updated topic',
          orig_subject: 'New topic',
          prev_rendered_content_version: 1,
          edit_timestamp: 456,
          user_id: 5,
          subject_links: [],
          caughtUp: {
            [homeNarrowStr]: { older: false, newer: true },
            [streamNarrowStr]: { older: false, newer: true },
          },
        });

        const expectedState = {
          [homeNarrowStr]: [
            {
              id: 1,
              content: '<p>New content</p>',
              display_recipient: 'some stream',
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
          [streamNarrowStr]: [
            {
              id: 1,
              content: '<p>New content</p>',
              display_recipient: 'some stream',
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

      test('move message from one bucket to another in case of subject change', () => {
        const initialState = deepFreeze({
          [anotherTopicNarrowStr]: [
            {
              id: 4,
              display_recipient: 'some stream',
              subject: 'some another topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
          [topicNarrowStr]: [
            {
              id: 2,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
          message_id: 4,
          orig_rendered_content: '<p>Old content</p>',
          rendered_content: '<p>New content</p>',
          subject: 'some topic',
          orig_subject: 'some another topic',
          prev_rendered_content_version: 1,
          edit_timestamp: 456,
          user_id: 5,
          subject_links: [],
          caughtUp: {
            [topicNarrowStr]: { older: false, newer: true },
          },
        });

        const expectedState = deepFreeze({
          [anotherTopicNarrowStr]: [],
          [topicNarrowStr]: [
            {
              id: 2,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
            {
              id: 4,
              content: '<p>New content</p>',
              display_recipient: 'some stream',
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  prev_subject: 'some another topic',
                  timestamp: 456,
                  user_id: 5,
                },
              ],
              last_edit_timestamp: 456,
              sender_email: 'a@example.com',
              subject: 'some topic',
              subject_links: [],
            },
          ],
        });

        const newState = chatReducers(initialState, action);

        expect(newState).not.toBe(initialState);
        expect(newState).toEqual(expectedState);
      });

      test("place new message in the new bucket at it's correct position, i.e sort by message id", () => {
        const initialState = deepFreeze({
          [anotherTopicNarrowStr]: [
            {
              id: 4,
              display_recipient: 'some stream',
              subject: 'some another topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
          [topicNarrowStr]: [
            {
              id: 2,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
            {
              id: 5,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_CONTENT_TOPIC,
          message_id: 4,
          orig_rendered_content: '<p>Old content</p>',
          rendered_content: '<p>New content</p>',
          subject: 'some topic',
          orig_subject: 'some another topic',
          prev_rendered_content_version: 1,
          edit_timestamp: 456,
          user_id: 5,
          subject_links: [],
          caughtUp: {
            [topicNarrowStr]: { older: false, newer: true },
          },
        });

        const expectedState = deepFreeze({
          [anotherTopicNarrowStr]: [],
          [topicNarrowStr]: [
            {
              id: 2,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
            {
              id: 4,
              content: '<p>New content</p>',
              display_recipient: 'some stream',
              edit_history: [
                {
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  prev_subject: 'some another topic',
                  timestamp: 456,
                  user_id: 5,
                },
              ],
              last_edit_timestamp: 456,
              sender_email: 'a@example.com',
              subject: 'some topic',
              subject_links: [],
            },
            {
              id: 5,
              display_recipient: 'some stream',
              subject: 'some topic',
              sender_email: 'a@example.com',
              subject_links: [],
            },
          ],
        });

        const newState = chatReducers(initialState, action);

        expect(newState).not.toBe(initialState);
        expect(newState).toEqual(expectedState);
      });
    });

    describe('EVENT_UPDATE_MESSAGE_CONTENT', () => {
      test('if a message does not exist no changes are made', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          [privateNarrowStr]: [],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_CONTENT,
          messageId: 3,
        });

        const newState = chatReducers(initialState, action);

        expect(newState).toBe(initialState);
      });

      test('when a message exists in state, new state and new object is created with updated message in every key', () => {
        const initialState = deepFreeze({
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3, content: 'Old content' }],
          [privateNarrowStr]: [{ id: 3, content: 'Old content' }],
        });

        const action = deepFreeze({
          type: EVENT_UPDATE_MESSAGE_CONTENT,
          message_id: 3,
          orig_rendered_content: '<p>Old content</p>',
          rendered_content: '<p>New content</p>',
          edit_timestamp: 123,
          prev_rendered_content_version: 1,
          user_id: 5,
        });

        const expectedState = {
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
        };

        const newState = chatReducers(initialState, action);

        expect(newState).not.toBe(initialState);
        expect(newState).toEqual(expectedState);
      });
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1, reactions: [] }, { id: 2, reactions: [] }],
        [privateNarrowStr]: [{ id: 1, reactions: [] }],
      });

      const action = deepFreeze({
        type: EVENT_REACTION_ADD,
        messageId: 2,
        emoji: 'hello',
        user: {},
      });

      const expectedState = {
        [homeNarrowStr]: [
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
        [homeNarrowStr]: [{ id: 1, reactions: [] }],
      });

      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        messageId: 1,
        emoji: 'hello',
        user: {},
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1, reactions: [] }],
      };

      const actualState = chatReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('reaction is removed only from specified message, only for given user', () => {
      const initialState = deepFreeze({
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
      });

      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        messageId: 1,
        emoji: 'hello',
        user: { email: 'bob@example.com' },
      });

      const expectedState = {
        [homeNarrowStr]: [
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
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: privateNarrow('mark@example.com'),
        messages: [],
      });
      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [JSON.stringify(privateNarrow('mark@example.com'))]: [],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('no duplicate messages', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('added messages are sorted by id', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 2, timestamp: 3 }, { id: 1, timestamp: 3 }],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 4, timestamp: 2 }, { id: 3, timestamp: 1 }],
      });

      const expectedState = {
        [homeNarrowStr]: [
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
        [homeNarrowStr]: [{ id: 1, timestamp: 3 }, { id: 2, timestamp: 4 }],
      });

      const action = deepFreeze({
        anchor: 0,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('when anchor is Number.MAX_SAFE_INTEGER previous messages are replaced', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1, timestamp: 3 }, { id: 2, timestamp: 4 }],
      });

      const action = deepFreeze({
        anchor: Number.MAX_SAFE_INTEGER,
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        messages: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      });

      const expectedState = {
        [homeNarrowStr]: [{ id: 3, timestamp: 2 }, { id: 4, timestamp: 1 }],
      };

      const newState = chatReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('when anchor is 0 common messages are not replaced', () => {
      const commonMessages = [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }];
      const initialState = deepFreeze({
        [homeNarrowStr]: [{ id: 1, timestamp: 3 }, ...commonMessages],
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: 0,
        narrow: [],
        messages: [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }],
      });

      const newState = chatReducers(initialState, action);

      expect(newState[homeNarrowStr]).toEqual(commonMessages);
    });

    test('when anchor is 0 deep equal is performed to separate common messages', () => {
      const commonMessages = [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }];
      const changedMessage = { id: 4, timestamp: 6, subject: 'new topic' };
      const initialState = deepFreeze({
        [homeNarrowStr]: [
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
        [homeNarrowStr]: [...commonMessages, changedMessage],
      };

      const newState = chatReducers(initialState, action);

      expect(newState[homeNarrowStr]).toEqual(expectedState[homeNarrowStr]);
    });
  });
});
