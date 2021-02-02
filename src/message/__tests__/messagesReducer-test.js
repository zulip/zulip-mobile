/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import type { Submessage } from '../../types';
import messagesReducer from '../messagesReducer';
import { FIRST_UNREAD_ANCHOR } from '../../anchor';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';
import { ALL_PRIVATE_NARROW, HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';
import { makeUserId } from '../../api/idTypes';

describe('messagesReducer', () => {
  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state, if any narrow is caught up to newest', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });
      const message3 = eg.streamMessage({ id: 3 });

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
        // `flags` is present in EVENT_NEW_MESSAGE; see note at Message.
        message: { ...message3, flags: [] },
      });
      const expectedState = eg.makeMessagesState([message1, message2, message3]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });

    test('does nothing, if no narrow is caught up to newest', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });
      const message3 = eg.streamMessage({ id: 3 });
      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: true,
            newer: false,
          },
        },
        // `flags` is present in EVENT_NEW_MESSAGE; see note at Message.
        message: { ...message3, flags: [] },
      });
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(prevState);
    });
  });

  describe('EVENT_SUBMESSAGE', () => {
    test('if the message does not exist do not mutate the state', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_SUBMESSAGE,
        message_id: 3,
        submessage_id: 2,
        sender_id: eg.otherUser.user_id,
        msg_type: 'widget',
        content: eg.randString(),
      });
      const newState = messagesReducer(prevState, action);
      expect(newState).toBe(prevState);
    });

    test('if the message exists add the incoming data to `submessages`', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({
        id: 2,
        submessages: [
          {
            id: 1,
            message_id: 2,
            sender_id: eg.otherUser.user_id,
            msg_type: 'widget', // only this type is currently available
            content: eg.randString(), // JSON string
          },
        ],
      });

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_SUBMESSAGE,
        message_id: message2.id,
        submessage_id: 2,
        sender_id: eg.otherUser.user_id,
        msg_type: 'widget',
        content: '{hello: "world"}',
      });
      const expectedState = eg.makeMessagesState([
        message1,
        {
          ...message2,
          submessages: [
            // We know message2 has `submessages`; we defined it that
            // way.
            // $FlowFixMe[incompatible-cast]
            ...(message2.submessages: $ReadOnlyArray<Submessage>),
            {
              id: 2,
              message_id: 2,
              sender_id: eg.otherUser.user_id,
              msg_type: 'widget',
              content: '{hello: "world"}',
            },
          ],
        },
      ]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const message1 = eg.streamMessage({ id: 1 });

      const prevState = eg.makeMessagesState([message1]);
      const action = deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [2] });
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(prevState);
      expect(newState).toBe(prevState);
    });

    test('if a message exists it is deleted', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [message2.id] });
      const expectedState = eg.makeMessagesState([message1]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });

    test('if multiple messages indicated, delete the ones that exist', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });
      const message3 = eg.streamMessage({ id: 3 });

      const prevState = eg.makeMessagesState([message1, message2, message3]);
      const action = deepFreeze({
        type: EVENT_MESSAGE_DELETE,
        messageIds: [message2.id, message3.id, 4],
      });
      const expectedState = eg.makeMessagesState([message1]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('if a message does not exist no changes are made', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });
      const message3 = eg.streamMessage({ id: 3 });

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE,
        edit_timestamp: Date.now() - 1000,
        message_id: message3.id,
        orig_content: eg.randString(),
        orig_rendered_content: eg.randString(),
        prev_rendered_content_version: 0,
        rendered_content: eg.randString(),
        subject_links: [],
        subject: eg.randString(),
        user_id: message3.sender_id,
      });
      const newState = messagesReducer(prevState, action);
      expect(newState).toBe(prevState);
    });

    test('when a message exists in state, it is updated', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });
      const message3Old = eg.streamMessage({ id: 3, content: '<p>Old content</p>' });
      const message3New = {
        ...message3Old,
        content: '<p>New content</p>',
        edit_history: [
          {
            prev_rendered_content: '<p>Old content</p>',
            prev_rendered_content_version: 1,
            timestamp: 123,
            user_id: message3Old.sender_id,
          },
        ],
        last_edit_timestamp: 123,
      };

      const prevState = eg.makeMessagesState([message1, message2, message3Old]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE,
        edit_timestamp: 123,
        message_id: message3New.id,
        orig_content: '<p>Old content</p>',
        orig_rendered_content: '<p>Old content</p>',
        prev_rendered_content_version: 1,
        rendered_content: '<p>New content</p>',
        subject_links: [],
        subject: message3New.subject,
        user_id: message3New.sender_id,
      });
      const expectedState = eg.makeMessagesState([message1, message2, message3New]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject but no new content only subject is updated', () => {
      const message1Old = eg.streamMessage({
        id: 1,
        content: 'Old content',
        subject: 'Old subject',
        last_edit_timestamp: 123,
        subject_links: [],
        edit_history: [],
      });
      const message1New = {
        ...message1Old,
        subject: 'New topic',
        last_edit_timestamp: 123,
        subject_links: [],
        edit_history: [
          {
            timestamp: 123,
            user_id: message1Old.sender_id,
            prev_subject: message1Old.subject,
            prev_rendered_content: message1Old.content,
            prev_rendered_content_version: 1,
          },
        ],
      };
      const prevState = eg.makeMessagesState([message1Old]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE,
        edit_timestamp: 123,
        message_id: message1New.id,
        orig_content: message1Old.content,
        orig_subject: message1Old.subject,
        orig_rendered_content: message1Old.content,
        prev_rendered_content_version: 1,
        rendered_content: message1New.content,
        subject_links: [],
        subject: message1New.subject,
        user_id: message1Old.sender_id,
      });
      const expectedState = eg.makeMessagesState([message1New]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject and a new content, update both and update edit history object', () => {
      const message1Old = eg.streamMessage({
        id: 1,
        content: '<p>Old content</p>',
        subject: 'Old subject',
        last_edit_timestamp: 123,
        subject_links: [],
        edit_history: [
          {
            prev_subject: 'Old subject',
            timestamp: 123,
            user_id: eg.otherUser.user_id,
          },
        ],
      });
      const message1New = {
        ...message1Old,
        content: '<p>New content</p>',
        subject: 'New updated topic',
        last_edit_timestamp: 456,
        subject_links: [],
        edit_history: [
          {
            prev_rendered_content: '<p>Old content</p>',
            prev_rendered_content_version: 1,
            prev_subject: 'Old subject',
            timestamp: 456,
            user_id: message1Old.sender_id,
          },
          ...message1Old.edit_history,
        ],
      };

      const prevState = eg.makeMessagesState([message1Old]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE,
        edit_timestamp: 456,
        message_id: message1Old.id,
        orig_content: message1Old.content,
        orig_rendered_content: message1Old.content,
        rendered_content: message1New.content,
        subject: message1New.subject,
        orig_subject: message1Old.subject,
        prev_rendered_content_version: 1,
        user_id: message1New.sender_id,
        subject_links: [],
      });
      const expectedState = eg.makeMessagesState([message1New]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const message1 = eg.streamMessage({ id: 1, reactions: [] });
      const message2 = eg.streamMessage({ id: 2, reactions: [] });
      const reaction = eg.unicodeEmojiReaction;

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_REACTION_ADD,
        message_id: message2.id,
        ...reaction,
      });
      const expectedState = eg.makeMessagesState([
        message1,
        {
          ...message2,
          reactions: [reaction],
        },
      ]);
      const actualState = messagesReducer(prevState, action);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_REMOVE', () => {
    test('if message does not contain reaction, no change is made', () => {
      const message1 = eg.streamMessage({ id: 1, reactions: [] });
      const reaction = eg.unicodeEmojiReaction;

      const prevState = eg.makeMessagesState([message1]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_REACTION_REMOVE,
        message_id: 1,
        ...reaction,
      });
      const expectedState = eg.makeMessagesState([message1]);
      const actualState = messagesReducer(prevState, action);
      expect(actualState).toEqual(expectedState);
    });

    test('reaction is removed only from specified message, only for given user', () => {
      const reaction1 = {
        ...eg.unicodeEmojiReaction,
        emoji_code: '1f44b',
        emoji_name: 'wave',
        user_id: makeUserId(1),
      };
      const reaction2 = {
        ...eg.unicodeEmojiReaction,
        emoji_code: '1f44b',
        emoji_name: 'wave',
        user_id: makeUserId(2),
      };
      const reaction3 = {
        ...eg.unicodeEmojiReaction,
        emoji_code: '1f6e0',
        emoji_name: 'working_on_it',
        user_id: makeUserId(1),
      };

      const message1 = eg.streamMessage({ id: 1, reactions: [reaction1, reaction2, reaction3] });
      const prevState = eg.makeMessagesState([message1]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_REACTION_REMOVE,
        message_id: message1.id,
        ...reaction1,
      });
      const expectedState = eg.makeMessagesState([
        { ...message1, reactions: [reaction2, reaction3] },
      ]);
      const actualState = messagesReducer(prevState, action);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('fetched messages are added to the state', () => {
      const message1 = eg.pmMessage({ id: 1 });
      const message2 = eg.pmMessage({ id: 2 });
      const message3 = eg.pmMessage({ id: 3 });
      const message4 = eg.pmMessage({ id: 4 });
      const message5 = eg.pmMessage({ id: 5 });

      const prevState = eg.makeMessagesState([message1, message2, message3]);
      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [message3, message4, message5],
        narrow: ALL_PRIVATE_NARROW,
        anchor: FIRST_UNREAD_ANCHOR,
        numBefore: 50,
        numAfter: 50,
        foundOldest: false,
        foundNewest: false,
        ownUserId: eg.selfUser.user_id,
      });
      const expectedState = eg.makeMessagesState([
        message1,
        message2,
        message3,
        message4,
        message5,
      ]);
      const newState = messagesReducer(prevState, action);
      expect(newState).toEqual(expectedState);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR common messages are not replaced', () => {
      const message1 = eg.streamMessage({ id: 1, timestamp: 3 });
      const message2 = eg.streamMessage({ id: 2, timestamp: 4 });
      const message3 = eg.streamMessage({ id: 3, timestamp: 5 });
      const prevState = eg.makeMessagesState([message1, message2, message3]);

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [message2, message3],
        narrow: HOME_NARROW,
        anchor: FIRST_UNREAD_ANCHOR,
        numBefore: 50,
        numAfter: 50,
        foundOldest: false,
        foundNewest: false,
        ownUserId: eg.selfUser.user_id,
      });

      const newState = messagesReducer(prevState, action);

      expect(newState.get(message2.id)).toEqual(message2);
      expect(newState.get(message3.id)).toEqual(message3);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR deep equal is performed to separate common messages', () => {
      const message1 = eg.streamMessage({ id: 1, timestamp: 3 });
      const message2 = eg.streamMessage({ id: 2, timestamp: 4 });
      const message3 = eg.streamMessage({ id: 3, timestamp: 5 });
      const message4Old = eg.streamMessage({ id: 4, timestamp: 6, subject: 'some topic' });
      const message4New = { ...message4Old, subject: 'new topic' };

      const prevState = eg.makeMessagesState([message1, message2, message3, message4Old]);
      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [message2, message3, message4New],
        narrow: HOME_NARROW,
        anchor: FIRST_UNREAD_ANCHOR,
        numBefore: 50,
        numAfter: 50,
        foundOldest: false,
        foundNewest: false,
        ownUserId: eg.selfUser.user_id,
      });
      const newState = messagesReducer(prevState, action);
      expect(newState.get(message2.id)).toEqual(message2);
      expect(newState.get(message3.id)).toEqual(message3);
      expect(newState.get(message4New.id)).toEqual(message4New);
    });
  });
});
