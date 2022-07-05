/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import type { Submessage } from '../../types';
import messagesReducer from '../messagesReducer';
import { FIRST_UNREAD_ANCHOR } from '../../anchor';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
} from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';
import { ALL_PRIVATE_NARROW, HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';
import { makeUserId } from '../../api/idTypes';
import { randString } from '../../utils/misc';

describe('messagesReducer', () => {
  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state, if any narrow is caught up to newest', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = eg.mkActionEventNewMessage(message3, {
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });
      const expectedState = eg.makeMessagesState([message1, message2, message3]);
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });

    test('does nothing, if no narrow is caught up to newest', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();
      const prevState = eg.makeMessagesState([message1, message2]);
      const action = eg.mkActionEventNewMessage(message3, {
        caughtUp: {
          [HOME_NARROW_STR]: {
            older: true,
            newer: false,
          },
        },
      });
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
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
        content: randString(),
      });
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toBe(prevState);
    });

    test('if the message exists add the incoming data to `submessages`', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage({
        id: 2,
        submessages: [
          {
            id: 1,
            message_id: 2,
            sender_id: eg.otherUser.user_id,
            msg_type: 'widget', // only this type is currently available
            content: randString(), // JSON string
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
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const message1 = eg.streamMessage({ id: 1 });

      const prevState = eg.makeMessagesState([message1]);
      const action = deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [2] });
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(prevState);
      expect(newState).toBe(prevState);
    });

    test('if a message exists it is deleted', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [message2.id] });
      const expectedState = eg.makeMessagesState([message1]);
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
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
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    const mkAction = args => {
      const {
        message,
        rendering_only = false,
        message_ids = [message.id],
        propagate_mode = 'change_one',
        user_id = message.sender_id,
        edit_timestamp = message.timestamp + 1,
        ...restArgs
      } = args;
      return eg.mkActionEventUpdateMessage({
        rendering_only,
        message_id: message.id,
        message_ids,
        propagate_mode,
        user_id,
        edit_timestamp,
        is_me_message: false,
        ...restArgs,
      });
    };

    const mkMoveAction = args => {
      const { message, ...restArgs } = args;
      return mkAction({
        message,
        // stream_id and orig_subject are always present when either
        // the stream or the topic was changed.
        stream_id: message.stream_id,
        orig_subject: message.subject,
        ...restArgs,
      });
    };

    test('if a message does not exist no changes are made', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();

      const prevState = eg.makeMessagesState([message1, message2]);
      const action = mkAction({
        edit_timestamp: Date.now() - 1000,
        message: message3,
        orig_content: randString(),
        orig_rendered_content: randString(),
        prev_rendered_content_version: 0,
        rendered_content: randString(),
        content: randString(),
      });
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toBe(prevState);
    });

    describe('move', () => {
      test('edited topic', () => {
        const message = eg.streamMessage();
        const newTopic = `${message.subject}abc`;
        const action = mkMoveAction({ message, subject: newTopic, edit_timestamp: 1000 });
        expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
          eg.makeMessagesState([
            {
              ...message,
              subject: newTopic,
              edit_history: [
                {
                  user_id: message.sender_id,
                  timestamp: 1000,
                  prev_topic: 'example topic',
                  topic: 'example topicabc',
                },
              ],
              last_edit_timestamp: 1000,
            },
          ]),
        );
      });

      test('other messages in conversation are unaffected', () => {
        const topic = 'some topic';
        const message1 = eg.streamMessage({ subject: topic });
        const message2 = eg.streamMessage({ subject: topic });
        const message3 = eg.streamMessage({ subject: topic });
        const newTopic = 'some revised topic';
        const action = mkMoveAction({
          message: message1,
          message_ids: [message1.id, message2.id],
          subject: newTopic,
          edit_timestamp: 1000,
        });
        expect(
          messagesReducer(
            eg.makeMessagesState([message1, message2, message3]),
            action,
            eg.plusReduxState,
          ),
        ).toEqual(
          eg.makeMessagesState([
            {
              ...message1,
              subject: newTopic,
              edit_history: [
                {
                  user_id: message1.sender_id,
                  timestamp: 1000,
                  prev_topic: 'some topic',
                  topic: 'some revised topic',
                },
              ],
              last_edit_timestamp: 1000,
            },
            {
              ...message2,
              subject: newTopic,
              edit_history: [
                {
                  user_id: message2.sender_id,
                  timestamp: 1000,
                  prev_topic: 'some topic',
                  topic: 'some revised topic',
                },
              ],
            },
            message3,
          ]),
        );
      });

      test('new stream', () => {
        const message = eg.streamMessage();
        const action = mkMoveAction({
          message,
          new_stream_id: eg.otherStream.stream_id,
          edit_timestamp: 1000,
        });
        expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
          eg.makeMessagesState([
            {
              ...message,
              stream_id: eg.otherStream.stream_id,
              display_recipient: eg.otherStream.name,
              edit_history: [
                {
                  user_id: message.sender_id,
                  timestamp: 1000,
                  prev_stream: message.stream_id,
                  stream: eg.otherStream.stream_id,
                },
              ],
              last_edit_timestamp: 1000,
            },
          ]),
        );
      });

      test('new stream + edited topic', () => {
        const message = eg.streamMessage();
        const newTopic = `${message.subject}abc`;
        const action = mkMoveAction({
          message,
          new_stream_id: eg.otherStream.stream_id,
          subject: newTopic,
          edit_timestamp: 1000,
        });
        expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
          eg.makeMessagesState([
            {
              ...message,
              stream_id: eg.otherStream.stream_id,
              display_recipient: eg.otherStream.name,
              subject: newTopic,
              edit_history: [
                {
                  user_id: message.sender_id,
                  timestamp: 1000,
                  prev_stream: message.stream_id,
                  stream: eg.otherStream.stream_id,
                  prev_topic: 'example topic',
                  topic: 'example topicabc',
                },
              ],
              last_edit_timestamp: 1000,
            },
          ]),
        );
      });

      test('new, unknown stream', () => {
        const message = eg.streamMessage();
        const unknownStream = eg.makeStream();
        const action = mkMoveAction({
          message,
          new_stream_id: unknownStream.stream_id,
          edit_timestamp: 1000,
        });
        expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
          eg.makeMessagesState([
            {
              ...message,
              stream_id: unknownStream.stream_id,
              display_recipient: 'unknown',
              edit_history: [
                {
                  user_id: message.sender_id,
                  timestamp: 1000,
                  prev_stream: message.stream_id,
                  stream: unknownStream.stream_id,
                },
              ],
              last_edit_timestamp: 1000,
            },
          ]),
        );
      });

      test('multiple messages moved in one event', () => {
        const message0 = eg.streamMessage({ stream: eg.stream, subject: 'old topic' });
        const message1 = eg.streamMessage({ stream: eg.stream, subject: 'old topic' });
        const message2 = eg.streamMessage({ stream: eg.stream, subject: 'old topic' });

        const action = mkMoveAction({
          user_id: eg.thirdUser.user_id,
          edit_timestamp: 1000,
          message: message0,
          message_ids: [message0.id, message1.id, message2.id],
          propagate_mode: 'change_later',
          new_stream_id: eg.otherStream.stream_id,
          subject: 'new topic',
        });

        expect(
          messagesReducer(
            eg.makeMessagesState([message0, message1, message2]),
            action,
            eg.plusReduxState,
          ),
        ).toEqual(
          eg.makeMessagesState(
            [{ ...message0, last_edit_timestamp: 1000 }, message1, message2].map(m => ({
              ...m,
              stream_id: eg.otherStream.stream_id,
              display_recipient: eg.otherStream.name,
              subject: 'new topic',
              edit_history: [
                {
                  user_id: eg.thirdUser.user_id,
                  timestamp: 1000,
                  prev_stream: eg.stream.stream_id,
                  stream: eg.otherStream.stream_id,
                  prev_topic: 'old topic',
                  topic: 'new topic',
                },
              ],
            })),
          ),
        );
      });

      test("edited one message's content + multiple messages moved in one event", () => {
        const message0 = eg.streamMessage({
          stream: eg.stream,
          subject: 'old topic',
          content: '<p>Old content</p>',
        });
        const message1 = eg.streamMessage({ stream: eg.stream, subject: 'old topic' });
        const message2 = eg.streamMessage({ stream: eg.stream, subject: 'old topic' });

        const action = mkMoveAction({
          user_id: eg.thirdUser.user_id,
          edit_timestamp: 1000,

          // content edit (to apply to just one message)
          message: message0,
          orig_content: 'Old content',
          orig_rendered_content: '<p>Old content</p>',
          prev_rendered_content_version: 1,
          content: 'New content',
          rendered_content: '<p>New content</p>',

          // move (to apply to all messages in `message_ids`)
          message_ids: [message0.id, message1.id, message2.id],
          propagate_mode: 'change_later',
          new_stream_id: eg.otherStream.stream_id,
          subject: 'new topic',
        });

        expect(
          messagesReducer(
            eg.makeMessagesState([message0, message1, message2]),
            action,
            eg.plusReduxState,
          ),
        ).toEqual(
          eg.makeMessagesState([
            {
              ...message0,
              content: '<p>New content</p>',
              stream_id: eg.otherStream.stream_id,
              display_recipient: eg.otherStream.name,
              subject: 'new topic',
              edit_history: [
                {
                  user_id: eg.thirdUser.user_id,
                  timestamp: 1000,
                  prev_content: 'Old content',
                  prev_rendered_content: '<p>Old content</p>',
                  prev_rendered_content_version: 1,
                  prev_stream: eg.stream.stream_id,
                  stream: eg.otherStream.stream_id,
                  prev_topic: 'old topic',
                  topic: 'new topic',
                },
              ],
              last_edit_timestamp: 1000,
            },
            ...[message1, message2].map(m => ({
              ...m,
              stream_id: eg.otherStream.stream_id,
              display_recipient: eg.otherStream.name,
              subject: 'new topic',
              edit_history: [
                {
                  user_id: eg.thirdUser.user_id,
                  timestamp: 1000,
                  prev_stream: eg.stream.stream_id,
                  stream: eg.otherStream.stream_id,
                  prev_topic: 'old topic',
                  topic: 'new topic',
                },
              ],
            })),
          ]),
        );
      });
    });

    test('when a message exists in state, it is updated', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3Old = eg.streamMessage({ content: '<p>Old content</p>' });
      const message3New = {
        ...message3Old,
        content: '<p>New content</p>',
        last_edit_timestamp: 123,
        edit_history: [
          {
            prev_content: message3Old.content,
            prev_rendered_content: message3Old.content,
            prev_rendered_content_version: 1,
            timestamp: 123,
            user_id: message3Old.sender_id,
          },
        ],
      };

      const prevState = eg.makeMessagesState([message1, message2, message3Old]);
      const action = mkAction({
        edit_timestamp: 123,
        message: message3New,
        orig_content: '<p>Old content</p>',
        orig_rendered_content: '<p>Old content</p>',
        prev_rendered_content_version: 1,
        rendered_content: '<p>New content</p>',
        content: 'New content',
      });
      const expectedState = eg.makeMessagesState([message1, message2, message3New]);
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject but no new content only subject is updated', () => {
      const message1Old = eg.streamMessage({
        content: 'Old content',
        subject: 'Old topic',
        last_edit_timestamp: 123,
        edit_history: [],
      });
      const message1New = {
        ...message1Old,
        subject: 'New topic',
        last_edit_timestamp: 123,
        edit_history: [
          {
            prev_topic: message1Old.subject,
            timestamp: 123,
            topic: 'New topic',
            user_id: message1Old.sender_id,
          },
        ],
      };
      const prevState = eg.makeMessagesState([message1Old]);
      const action = mkMoveAction({
        edit_timestamp: 123,
        message: message1Old,
        subject: message1New.subject,
      });
      const expectedState = eg.makeMessagesState([message1New]);
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
    });

    test('when event contains a new subject and a new content, update both', () => {
      const message1Old = eg.streamMessage({
        content: '<p>Old content</p>',
        subject: 'Old topic',
        last_edit_timestamp: 123,
      });
      const message1New = {
        ...message1Old,
        content: '<p>New content</p>',
        subject: 'New updated topic',
        last_edit_timestamp: 456,
        edit_history: [
          {
            prev_content: message1Old.content,
            prev_rendered_content: message1Old.content,
            prev_rendered_content_version: 1,
            prev_topic: message1Old.subject,
            timestamp: 456,
            topic: 'New updated topic',
            user_id: message1Old.sender_id,
          },
        ],
      };

      const prevState = eg.makeMessagesState([message1Old]);
      const action = mkMoveAction({
        edit_timestamp: 456,
        message: message1Old,
        orig_content: message1Old.content,
        orig_rendered_content: message1Old.content,
        rendered_content: message1New.content,
        content: message1New.content,
        subject: message1New.subject,
        prev_rendered_content_version: 1,
      });
      const expectedState = eg.makeMessagesState([message1New]);
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState).toEqual(expectedState);
    });

    test('handle stealth server-edit (for inline URL previews)', () => {
      const message = eg.streamMessage({
        content: 'Some content',
        edit_history: [],
      });
      const messageAfter = {
        ...message,
        content: 'Some content with an inline URL preview',
        // edit_history still empty
      };
      const action = mkAction({
        rendering_only: true,
        message,
        orig_content: message.content,
        orig_rendered_content: message.content,
        content: messageAfter.content,
        rendered_content: messageAfter.content,
        prev_rendered_content_version: 1,
      });
      expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
        eg.makeMessagesState([messageAfter]),
      );
    });

    test('handle stealth server-edit, after a real edit', () => {
      const message = eg.streamMessage({
        content: 'Some content, edited',
        edit_history: [
          { user_id: eg.otherUser.user_id, timestamp: 123, prev_rendered_content: 'Some content' },
        ],
        last_edit_timestamp: 123,
      });
      const messageAfter = {
        ...message,
        content: 'Some content, edited, plus a URL preview ',
        // still has last_edit_timestamp, rather than clobbering with
        // undefined from action.edit_timestamp
      };
      const action = mkAction({
        rendering_only: true,
        message,
        orig_content: message.content,
        orig_rendered_content: message.content,
        content: messageAfter.content,
        rendered_content: messageAfter.content,
        prev_rendered_content_version: 1,
      });
      expect(messagesReducer(eg.makeMessagesState([message]), action, eg.plusReduxState)).toEqual(
        eg.makeMessagesState([messageAfter]),
      );
    });

    describe('edit_history not covered above', () => {
      describe('sequential updates', () => {
        const initialContent = 'Old content';
        const initialRenderedContent = `<p>${initialContent}</p>`;
        const initialTopic = 'Old topic';

        const afterNoUpdates = eg.streamMessage({
          content: initialRenderedContent,
          subject: initialTopic,
          edit_history: undefined,
        });

        const senderId = afterNoUpdates.sender_id;

        const update1Content = 'New content';
        const update1RenderedContent = `<p>${update1Content}</p>`;
        const update1Topic = 'New updated topic';

        const update1Action = mkMoveAction({
          edit_timestamp: 456,
          message: afterNoUpdates,
          orig_content: initialContent,
          orig_rendered_content: initialRenderedContent,
          rendered_content: update1RenderedContent,
          content: update1Content,
          subject: update1Topic,
          prev_rendered_content_version: 1,
        });

        const afterUpdate1 = {
          ...afterNoUpdates,
          content: update1RenderedContent,
          subject: update1Topic,
          last_edit_timestamp: 456,
          edit_history: [
            {
              prev_content: initialContent,
              prev_rendered_content: initialRenderedContent,
              prev_rendered_content_version: 1,
              prev_topic: initialTopic,
              timestamp: 456,
              topic: update1Topic,
              user_id: senderId,
            },
          ],
        };

        const update2Content = 'New content 2';
        const update2RenderedContent = `<p>${update2Content}</p>`;
        const update2Topic = 'New updated topic 2';

        const update2Action = mkMoveAction({
          edit_timestamp: 567,
          message: afterUpdate1,
          orig_content: update1Content,
          orig_rendered_content: update1RenderedContent,
          rendered_content: update2RenderedContent,
          content: update2Content,
          subject: update2Topic,
          prev_rendered_content_version: 1,
        });

        const afterUpdate2 = {
          ...afterUpdate1,
          content: update2RenderedContent,
          subject: update2Topic,
          last_edit_timestamp: 567,
          edit_history: [
            {
              prev_content: update1Content,
              prev_rendered_content: update1RenderedContent,
              prev_rendered_content_version: 1,
              prev_topic: update1Topic,
              timestamp: 567,
              topic: update2Topic,
              user_id: senderId,
            },
            {
              prev_content: initialContent,
              prev_rendered_content: initialRenderedContent,
              prev_rendered_content_version: 1,
              prev_topic: initialTopic,
              timestamp: 456,
              topic: update1Topic,
              user_id: senderId,
            },
          ],
        };

        test('on never-edited message, creates one-item array', () => {
          expect(
            messagesReducer(
              eg.makeMessagesState([afterNoUpdates]),
              update1Action,
              eg.plusReduxState,
            ),
          ).toEqual(eg.makeMessagesState([afterUpdate1]));
        });

        test('on once-edited message, adds item at start of array', () => {
          expect(
            messagesReducer(eg.makeMessagesState([afterUpdate1]), update2Action, eg.plusReduxState),
          ).toEqual(eg.makeMessagesState([afterUpdate2]));
        });
      });

      test("don't touch it if we dropped it", () => {
        const message1Old = eg.streamMessage({
          content: '<p>Old content</p>',
          subject: 'Old topic',
          edit_history: null,
        });
        const prevState = eg.makeMessagesState([message1Old]);
        const action = mkMoveAction({
          edit_timestamp: 456,
          message: message1Old,
          orig_content: message1Old.content,
          orig_rendered_content: message1Old.content,
          rendered_content: '<p>New content</p>',
          content: 'New content',
          subject: 'New updated topic',
          prev_rendered_content_version: 1,
        });
        const newState = messagesReducer(prevState, action, eg.plusReduxState);
        const newMessage = newState.get(message1Old.id);
        expect(newMessage).not.toBeUndefined();
        expect(newState.get(message1Old.id)?.edit_history).toBe(null);
      });
    });
  });

  describe('EVENT_REACTION_ADD', () => {
    test('on event received, add reaction to message with given id', () => {
      const message1 = eg.streamMessage({ reactions: [] });
      const message2 = eg.streamMessage({ reactions: [] });
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
      const actualState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REACTION_REMOVE', () => {
    test('if message does not contain reaction, no change is made', () => {
      const message1 = eg.streamMessage({ reactions: [] });
      const reaction = eg.unicodeEmojiReaction;

      const prevState = eg.makeMessagesState([message1]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_REACTION_REMOVE,
        message_id: message1.id,
        ...reaction,
      });
      const expectedState = eg.makeMessagesState([message1]);
      const actualState = messagesReducer(prevState, action, eg.plusReduxState);
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

      const message1 = eg.streamMessage({ reactions: [reaction1, reaction2, reaction3] });
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
      const actualState = messagesReducer(prevState, action, eg.plusReduxState);
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
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
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

      const newState = messagesReducer(prevState, action, eg.plusReduxState);

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
      const newState = messagesReducer(prevState, action, eg.plusReduxState);
      expect(newState.get(message2.id)).toEqual(message2);
      expect(newState.get(message3.id)).toEqual(message3);
      expect(newState.get(message4New.id)).toEqual(message4New);
    });
  });
});
