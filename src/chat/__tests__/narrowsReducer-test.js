/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import Immutable from 'immutable';

import narrowsReducer from '../narrowsReducer';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  pm1to1NarrowFromUser,
  ALL_PRIVATE_NARROW_STR,
  pmNarrowFromUsersUnsafe,
  streamNarrow,
  topicNarrow,
  STARRED_NARROW_STR,
  keyFromNarrow,
  SEARCH_NARROW,
} from '../../utils/narrow';
import {
  MESSAGE_FETCH_ERROR,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../../anchor';
import * as eg from '../../__tests__/lib/exampleData';

describe('narrowsReducer', () => {
  const privateNarrowStr = keyFromNarrow(pm1to1NarrowFromUser(eg.otherUser));
  const groupNarrowStr = keyFromNarrow(pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]));
  const streamNarrowStr = keyFromNarrow(streamNarrow(eg.stream.stream_id));
  const egTopic = eg.streamMessage().subject;
  const topicNarrowStr = keyFromNarrow(topicNarrow(eg.stream.stream_id, egTopic));

  describe('EVENT_NEW_MESSAGE', () => {
    test('if not caught up in narrow, do not add message in home narrow', () => {
      const message = eg.streamMessage({ id: 3, flags: [] });

      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      expect(narrowsReducer(prevState, eg.mkActionEventNewMessage(message))).toEqual(
        Immutable.Map([[HOME_NARROW_STR, [1, 2]]]),
      );
    });

    test('appends message to state producing a copy of messages', () => {
      const message = eg.streamMessage({ id: 3, flags: [] });

      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      const newState = narrowsReducer(
        prevState,
        eg.mkActionEventNewMessage(message, {
          caughtUp: { [HOME_NARROW_STR]: { older: false, newer: true } },
        }),
      );
      expect(newState).toEqual(Immutable.Map([[HOME_NARROW_STR, [1, 2, 3]]]));
      expect(newState).not.toBe(prevState);
    });

    test('if new message key does not exist do not create it', () => {
      const message = eg.streamMessage({ id: 3, flags: [], stream: eg.makeStream() });

      const prevState = Immutable.Map([[topicNarrowStr, [1, 2]]]);
      expect(narrowsReducer(prevState, eg.mkActionEventNewMessage(message))).toEqual(
        Immutable.Map([[topicNarrowStr, [1, 2]]]),
      );
    });
  });

  test('if new message is private or group add it to the "allPrivate" narrow', () => {
    const message = eg.pmMessage({
      id: 1,
      recipients: [eg.selfUser, eg.otherUser, eg.thirdUser],
      flags: [],
    });

    const prevState = Immutable.Map([[ALL_PRIVATE_NARROW_STR, []]]);
    expect(
      narrowsReducer(
        prevState,
        eg.mkActionEventNewMessage(message, {
          caughtUp: { [ALL_PRIVATE_NARROW_STR]: { older: true, newer: true } },
        }),
      ),
    ).toEqual(Immutable.Map([[ALL_PRIVATE_NARROW_STR, [1]]]));
  });

  test('message sent to topic is stored correctly', () => {
    const message = eg.streamMessage({ id: 3, flags: [] });

    const prevState = Immutable.Map([
      [HOME_NARROW_STR, [1, 2]],
      [topicNarrowStr, [2]],
    ]);
    expect(
      narrowsReducer(
        prevState,
        eg.mkActionEventNewMessage(message, {
          caughtUp: {
            [HOME_NARROW_STR]: { older: false, newer: false },
            [topicNarrowStr]: { older: false, newer: true },
          },
        }),
      ),
    ).toEqual(
      Immutable.Map([
        [HOME_NARROW_STR, [1, 2]],
        [topicNarrowStr, [2, message.id]],
      ]),
    );
  });

  test('message sent to self is stored correctly', () => {
    const narrowWithSelfStr = keyFromNarrow(pm1to1NarrowFromUser(eg.selfUser));
    const message = eg.pmMessage({
      id: 1,
      sender: eg.selfUser,
      recipients: [eg.selfUser],
      flags: [],
    });

    const prevState = Immutable.Map([
      [HOME_NARROW_STR, []],
      [narrowWithSelfStr, []],
    ]);
    const newState = narrowsReducer(
      prevState,
      eg.mkActionEventNewMessage(message, {
        caughtUp: {
          [HOME_NARROW_STR]: { older: false, newer: true },
          [narrowWithSelfStr]: { older: false, newer: true },
        },
      }),
    );
    expect(newState).toEqual(
      Immutable.Map([
        [HOME_NARROW_STR, [message.id]],
        [narrowWithSelfStr, [message.id]],
      ]),
    );
    expect(newState).not.toBe(prevState);
  });

  test('appends stream message to all cached narrows that match and are caught up', () => {
    const message = eg.streamMessage({ id: 5, flags: [] });

    const prevState = Immutable.Map([
      [HOME_NARROW_STR, [1, 2]],
      [ALL_PRIVATE_NARROW_STR, [1, 2]],
      [streamNarrowStr, [2, 3]],
      [topicNarrowStr, [2, 3]],
      [privateNarrowStr, [2, 4]],
      [groupNarrowStr, [2, 4]],
    ]);
    const newState = narrowsReducer(
      prevState,
      eg.mkActionEventNewMessage(message, {
        caughtUp: {
          [HOME_NARROW_STR]: { older: false, newer: true },
          [streamNarrowStr]: { older: false, newer: true },
          [topicNarrowStr]: { older: false, newer: true },
        },
      }),
    );
    expect(newState).toEqual(
      Immutable.Map([
        [HOME_NARROW_STR, [1, 2, message.id]],
        [ALL_PRIVATE_NARROW_STR, [1, 2]],
        [streamNarrowStr, [2, 3, message.id]],
        [topicNarrowStr, [2, 3, message.id]],
        [privateNarrowStr, [2, 4]],
        [groupNarrowStr, [2, 4]],
      ]),
    );
    expect(newState).not.toBe(prevState);
  });

  test('does not append stream message to not cached narrows', () => {
    const message = eg.streamMessage({ id: 3, flags: [] });

    const prevState = Immutable.Map([[HOME_NARROW_STR, [1]]]);
    const newState = narrowsReducer(
      prevState,
      eg.mkActionEventNewMessage(message, {
        caughtUp: { [HOME_NARROW_STR]: { older: false, newer: true } },
      }),
    );
    expect(newState).toEqual(Immutable.Map([[HOME_NARROW_STR, [1, message.id]]]));
    expect(newState).not.toBe(prevState);
  });

  test('appends private message to multiple cached narrows', () => {
    const message = eg.pmMessage({
      id: 5,
      flags: [],
      sender: eg.selfUser,
      recipients: [eg.selfUser, eg.otherUser],
    });

    const prevState = Immutable.Map([
      [HOME_NARROW_STR, [1, 2]],
      [ALL_PRIVATE_NARROW_STR, [1, 2]],
      [streamNarrowStr, [2, 3]],
      [topicNarrowStr, [2, 3]],
      [privateNarrowStr, [2, 4]],
      [groupNarrowStr, [2, 4]],
    ]);
    const newState = narrowsReducer(
      prevState,
      eg.mkActionEventNewMessage(message, {
        caughtUp: prevState.map(_ => ({ older: false, newer: true })).toObject(),
      }),
    );
    expect(newState).toEqual(
      Immutable.Map([
        [HOME_NARROW_STR, [1, 2, message.id]],
        [ALL_PRIVATE_NARROW_STR, [1, 2, message.id]],
        [streamNarrowStr, [2, 3]],
        [topicNarrowStr, [2, 3]],
        [privateNarrowStr, [2, 4, message.id]],
        [groupNarrowStr, [2, 4]],
      ]),
    );
    expect(newState).not.toBe(prevState);
  });

  describe('EVENT_MESSAGE_DELETE', () => {
    test('if a message does not exist no changes are made', () => {
      const prevState = Immutable.Map([
        [HOME_NARROW_STR, [1, 2]],
        [privateNarrowStr, []],
      ]);
      expect(
        narrowsReducer(prevState, deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [3] })),
      ).toBe(prevState);
    });

    test('if a message exists in one or more narrows delete it from there', () => {
      const prevState = Immutable.Map([
        [HOME_NARROW_STR, [1, 2, 3]],
        [privateNarrowStr, [2]],
      ]);
      expect(
        narrowsReducer(prevState, deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [2] })),
      ).toEqual(
        Immutable.Map([
          [HOME_NARROW_STR, [1, 3]],
          [privateNarrowStr, []],
        ]),
      );
    });

    test('if multiple messages indicated, delete the ones that exist', () => {
      const prevState = Immutable.Map([
        [HOME_NARROW_STR, [1, 2, 3]],
        [privateNarrowStr, [2]],
      ]);
      expect(
        narrowsReducer(
          prevState,
          deepFreeze({ type: EVENT_MESSAGE_DELETE, messageIds: [2, 3, 4] }),
        ),
      ).toEqual(
        Immutable.Map([
          [HOME_NARROW_STR, [1]],
          [privateNarrowStr, []],
        ]),
      );
    });
  });

  describe('MESSAGE_FETCH_START', () => {
    test('if fetching for a search narrow, ignore', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      expect(
        narrowsReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_start, narrow: SEARCH_NARROW('some query') }),
        ),
      ).toEqual(prevState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, it's fully possible:
      // MESSAGE_FETCH_START applies the identity function to the
      // state (i.e., it doesn't do anything to it). Reversing that
      // effect is also done with the identity function.

      const narrow1 = pm1to1NarrowFromUser(eg.otherUser);
      const narrow2 = pm1to1NarrowFromUser(eg.thirdUser);

      // Include some other narrow to test that the reducer doesn't go mess
      // something up there.
      const initialState = Immutable.Map([[keyFromNarrow(narrow1), [1, 2]]]);
      expect(
        [
          deepFreeze({ ...eg.action.message_fetch_start, narrow: narrow2 }),
          deepFreeze({ type: MESSAGE_FETCH_ERROR, narrow: narrow2, error: new Error() }),
        ].reduce(narrowsReducer, initialState),
      ).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('if no messages returned still create the key in state', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2, 3]]]);
      expect(
        narrowsReducer(prevState, {
          ...eg.action.message_fetch_complete,
          narrow: pm1to1NarrowFromUser(eg.otherUser),
          messages: [],
        }),
      ).toEqual(
        Immutable.Map([
          [HOME_NARROW_STR, [1, 2, 3]],
          [keyFromNarrow(pm1to1NarrowFromUser(eg.otherUser)), []],
        ]),
      );
    });

    test('no duplicate messages', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2, 3]]]);
      const newState = narrowsReducer(prevState, {
        ...eg.action.message_fetch_complete,
        narrow: HOME_NARROW,
        anchor: 2,
        messages: [
          eg.streamMessage({ id: 2 }),
          eg.streamMessage({ id: 3 }),
          eg.streamMessage({ id: 4 }),
        ],
      });
      expect(newState).toEqual(Immutable.Map([[HOME_NARROW_STR, [1, 2, 3, 4]]]));
      expect(newState).not.toBe(prevState);
    });

    test('added messages are sorted by id', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      const newState = narrowsReducer(prevState, {
        ...eg.action.message_fetch_complete,
        narrow: HOME_NARROW,
        anchor: 2,
        messages: [
          eg.streamMessage({ id: 3, timestamp: 2 }),
          eg.streamMessage({ id: 4, timestamp: 1 }),
        ],
      });
      expect(newState).toEqual(Immutable.Map([[HOME_NARROW_STR, [1, 2, 3, 4]]]));
      expect(newState).not.toBe(prevState);
    });

    test('when anchor is FIRST_UNREAD_ANCHOR previous messages are replaced', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      expect(
        narrowsReducer(prevState, {
          ...eg.action.message_fetch_complete,
          narrow: HOME_NARROW,
          anchor: FIRST_UNREAD_ANCHOR,
          messages: [
            eg.streamMessage({ id: 3, timestamp: 2 }),
            eg.streamMessage({ id: 4, timestamp: 1 }),
          ],
        }),
      ).toEqual(Immutable.Map([[HOME_NARROW_STR, [3, 4]]]));
    });

    test('when anchor is LAST_MESSAGE_ANCHOR previous messages are replaced', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      const action = {
        ...eg.action.message_fetch_complete,
        narrow: HOME_NARROW,
        anchor: LAST_MESSAGE_ANCHOR,
        messages: [
          eg.streamMessage({ id: 3, timestamp: 2 }),
          eg.streamMessage({ id: 4, timestamp: 1 }),
        ],
      };
      expect(narrowsReducer(prevState, action)).toEqual(Immutable.Map([[HOME_NARROW_STR, [3, 4]]]));
    });

    test('if fetched messages are from a search narrow, ignore them', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      expect(
        narrowsReducer(prevState, {
          ...eg.action.message_fetch_complete,
          narrow: SEARCH_NARROW('some query'),
        }),
      ).toEqual(prevState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    const mkAction = args => {
      const { messages, ...restArgs } = args;
      const message = messages[0];
      return eg.mkActionEventUpdateMessage({
        message_id: message.id,
        message_ids: messages.map(m => m.id),
        stream_id: message.stream_id,
        orig_subject: message.subject,
        ...restArgs,
      });
    };

    const mkKey = (stream, topic) =>
      topic !== undefined
        ? keyFromNarrow(topicNarrow(stream.stream_id, topic))
        : keyFromNarrow(streamNarrow(stream.stream_id));

    const topic1 = 'topic foo';
    const topic2 = 'topic bar';
    // const message1a = eg.streamMessage({ subject: topic1, id: 1 });
    const message1b = eg.streamMessage({ subject: topic1, id: 2 });
    // const message1c = eg.streamMessage({ subject: topic1, id: 3 });
    // const message2a = eg.streamMessage({ subject: topic2, id: 4 });

    test('new topic, same stream', () => {
      expect(
        narrowsReducer(
          Immutable.Map([
            [mkKey(eg.stream, topic1), [1, 2, 3]],
            [mkKey(eg.stream, topic2), [4]],
            [mkKey(eg.stream), [1, 2, 3, 4]],
          ]),
          mkAction({ messages: [message1b], subject: topic2 }),
        ),
      ).toEqual(
        Immutable.Map([
          [mkKey(eg.stream, topic1), [1, 3]], // removed from old topic narrow
          // new topic narrow gets cleared
          [mkKey(eg.stream), [1, 2, 3, 4]], // stream narrow unchanged
        ]),
      );
    });

    test('same topic, new stream', () => {
      expect(
        narrowsReducer(
          Immutable.Map([
            [mkKey(eg.stream, topic1), [1, 2, 3]],
            [mkKey(eg.stream), [1, 2, 3]],
            [mkKey(eg.otherStream, topic1), [4]],
            [mkKey(eg.otherStream), [4]],
          ]),
          mkAction({ messages: [message1b], new_stream_id: eg.otherStream.stream_id }),
        ),
      ).toEqual(
        Immutable.Map([
          [mkKey(eg.stream, topic1), [1, 3]], // removed from old topic narrow
          [mkKey(eg.stream), [1, 3]], // removed from old stream narrow
          // new topic narrow and stream narrow both cleared
        ]),
      );
    });

    // Try to keep these tests corresponding closely to those for the
    // caughtUp reducer.  (In the future these should really be a single
    // sub-reducer.)
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    const allMessages = eg.makeMessagesState([
      eg.streamMessage({ id: 1 }),
      eg.streamMessage({ id: 2 }),
      eg.streamMessage({ id: 4 }),
    ]);

    test('Do nothing if the is:starred narrow has not been fetched', () => {
      const prevState = Immutable.Map([[HOME_NARROW_STR, [1, 2]]]);
      expect(
        narrowsReducer(
          prevState,
          deepFreeze({
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            id: 1,
            allMessages,
            all: false,
            flag: 'starred',
            op: 'add',
            messages: [4, 2],
          }),
        ),
      ).toEqual(prevState);
    });

    test("Do nothing if action.flag is not 'starred'", () => {
      const prevState = Immutable.Map([[STARRED_NARROW_STR, [1, 2]]]);
      expect(
        narrowsReducer(
          prevState,
          deepFreeze({
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            id: 1,
            all: false,
            allMessages,
            op: 'add',
            messages: [1],
            flag: 'read',
          }),
        ),
      ).toEqual(prevState);
    });

    test(
      'Adds, while maintaining chronological order, '
        + 'newly starred messages to the is:starred narrow',
      () => {
        const prevState = Immutable.Map([[STARRED_NARROW_STR, [1, 3, 5]]]);
        expect(
          narrowsReducer(
            prevState,
            deepFreeze({
              type: EVENT_UPDATE_MESSAGE_FLAGS,
              id: 1,
              allMessages,
              all: false,
              flag: 'starred',
              op: 'add',
              messages: [4, 2],
            }),
          ),
        ).toEqual(Immutable.Map([[STARRED_NARROW_STR, [1, 2, 3, 4, 5]]]));
      },
    );

    test(
      'Removes, while maintaining chronological order, '
        + 'newly unstarred messages from the is:starred narrow',
      () => {
        const prevState = Immutable.Map([[STARRED_NARROW_STR, [1, 2, 3, 4, 5]]]);
        expect(
          narrowsReducer(
            prevState,
            deepFreeze({
              type: EVENT_UPDATE_MESSAGE_FLAGS,
              id: 1,
              allMessages,
              all: false,
              flag: 'starred',
              op: 'remove',
              messages: [4, 2],
            }),
          ),
        ).toEqual(Immutable.Map([[STARRED_NARROW_STR, [1, 3, 5]]]));
      },
    );
  });
});
