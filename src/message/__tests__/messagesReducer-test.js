import deepFreeze from 'deep-freeze';

import messagesReducer from '../messagesReducer';
import { FIRST_UNREAD_ANCHOR } from '../../constants';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';

describe('messagesReducer', () => {
  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = messagesReducer(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state producing a copy of messages', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2 },
      });
      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 3 },
      });
      const expectedState = {
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3 },
      };
      const newState = messagesReducer(initialState, action);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('EVENT_SUBMESSAGE', () => {
    test('if the message does not exist do not mutate the state', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2 },
      });
      const action = deepFreeze({
        type: EVENT_SUBMESSAGE,
        message_id: 3,
        submessage_id: 2,
      });
      const newState = messagesReducer(initialState, action);
      expect(newState).toBe(initialState);
    });

    test('if the message exists add the incoming data to `submessages`', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2, submessages: [{ id: 1 }] },
      });
      const action = deepFreeze({
        type: EVENT_SUBMESSAGE,
        content: '{hello: "world"}',
        message_id: 2,
        submessage_id: 2,
      });
      const expectedState = {
        1: { id: 1 },
        2: {
          id: 2,
          submessages: [
            { id: 1 },
            {
              id: 2,
              content: '{hello: "world"}',
              message_id: 2,
            },
          ],
        },
      };
      const newState = messagesReducer(initialState, action);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({ 1: { id: 1 } });
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageId: 2,
      });
      const newState = messagesReducer(initialState, action);
      expect(newState).toEqual(initialState);
    });
    test('if a message exists it is deleted', () => {
      const initialState = deepFreeze({ 1: { id: 1 }, 2: { id: 2 } });

      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageId: 2,
      });
      const expectedState = deepFreeze({ 1: { id: 1 } });
      const newState = messagesReducer(initialState, action);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('if a message does not exist no changes are made', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2 },
      });
      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
      });
      const newState = messagesReducer(initialState, action);
      expect(newState).toBe(initialState);
    });

    test('when a message exists in state, new state and new object is created with updated message in every key', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3, content: 'Old content' },
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
        1: { id: 1 },
        2: { id: 2 },
        3: {
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
      };
      const newState = messagesReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject but no new content only subject is updated', () => {
      const initialState = deepFreeze({
        1: {
          id: 1,
          content: 'Old content',
          subject: 'Old subject',
          last_edit_timestamp: 123,
          subject_links: [],
          edit_history: [],
        },
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
        1: {
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
      };

      const newState = messagesReducer(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject and a new content, update both and update edit history object', () => {
      const initialState = deepFreeze({
        1: {
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
        1: {
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
      };
      const newState = messagesReducer(initialState, action);
      expect(newState).not.toBe(initialState);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const initialState = deepFreeze({
        1: { id: 1, reactions: [] },
        2: { id: 2, reactions: [] },
      });
      const action = deepFreeze({
        type: EVENT_REACTION_ADD,
        message_id: 2,
        emoji_name: 'hello',
        user_id: 2,
      });
      const expectedState = {
        1: { id: 1, reactions: [] },
        2: { id: 2, reactions: [{ emoji_name: 'hello', user_id: 2 }] },
      };
      const actualState = messagesReducer(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_REMOVE', () => {
    test('if message does not contain reaction, no change is made', () => {
      const initialState = deepFreeze({
        1: { id: 1, reactions: [] },
      });
      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        message_id: 1,
        emoji_name: 'hello',
        user_id: 2,
      });
      const expectedState = {
        1: { id: 1, reactions: [] },
      };
      const actualState = messagesReducer(initialState, action);
      expect(actualState).toEqual(expectedState);
    });

    test('reaction is removed only from specified message, only for given user', () => {
      const initialState = deepFreeze({
        1: {
          id: 1,
          reactions: [
            { emoji_name: 'hello', user_id: 1 },
            { emoji_name: 'hello', user_id: 2 },
            { emoji_name: 'goodbye', user_id: 1 },
          ],
        },
      });
      const action = deepFreeze({
        type: EVENT_REACTION_REMOVE,
        message_id: 1,
        emoji_name: 'hello',
        user_id: 1,
      });
      const expectedState = {
        1: {
          id: 1,
          reactions: [{ emoji_name: 'hello', user_id: 2 }, { emoji_name: 'goodbye', user_id: 1 }],
        },
      };
      const actualState = messagesReducer(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('fetched messages are added to the state', () => {
      const initialState = deepFreeze({
        1: { id: 1 },
        2: { id: 2 },
        4: { id: 4 },
      });
      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [{ id: 3 }, { id: 4 }, { id: 5 }],
      });
      const expectedState = {
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3 },
        4: { id: 4 },
        5: { id: 5 },
      };
      const newState = messagesReducer(initialState, action);
      expect(newState).toEqual(expectedState);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR common messages are not replaced', () => {
      const commonMessages = { 2: { id: 2, timestamp: 4 }, 3: { id: 3, timestamp: 5 } };
      const initialState = deepFreeze({
        1: { id: 1, timestamp: 3 },
        ...commonMessages,
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: FIRST_UNREAD_ANCHOR,
        narrow: [],
        messages: [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }],
      });

      const newState = messagesReducer(initialState, action);

      expect(newState['2']).toEqual(commonMessages['2']);
      expect(newState['3']).toEqual(commonMessages['3']);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR deep equal is performed to separate common messages', () => {
      const commonMessages = { 2: { id: 2, timestamp: 4 }, 3: { id: 3, timestamp: 5 } };
      const changedMessages = { 4: { id: 4, timestamp: 6, subject: 'new topic' } };
      const initialState = deepFreeze({
        1: { id: 1, timestamp: 3 },
        ...commonMessages,
        4: { id: 4, timestamp: 6, subject: 'some topic' },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        anchor: FIRST_UNREAD_ANCHOR,
        narrow: [],
        messages: [{ id: 2, timestamp: 4 }, { id: 3, timestamp: 5 }, changedMessages['4']],
      });

      const expectedState = {
        ...commonMessages,
        ...changedMessages,
      };

      const newState = messagesReducer(initialState, action);

      expect(newState['2']).toEqual(expectedState['2']);
      expect(newState['3']).toEqual(expectedState['3']);
      expect(newState['4']).toEqual(expectedState['4']);
    });
  });
});
