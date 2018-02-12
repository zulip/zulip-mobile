import deepFreeze from 'deep-freeze';

import { getTopicsInActiveNarrow, getLastMessageTopic } from '../topicSelectors';
import { navStateWithNarrow } from '../../utils/testHelpers';
import { homeNarrow, streamNarrow } from '../../utils/narrow';

describe('getTopicsInActiveNarrow', () => {
  test('when no topics return an empty list', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual([]);
  });

  test('when there are topics in the active narrow, return them as string array', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('hello')),
      streams: [{ stream_id: 123, name: 'hello' }],
      topics: {
        123: [{ name: 'hi' }, { name: 'wow' }],
      },
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual(['hi', 'wow']);
  });
});

describe('getLastMessageTopic', () => {
  test('when no messages in narrow return an empty string', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      chat: {
        messages: {},
      },
    });

    const topic = getLastMessageTopic(state);

    expect(topic).toEqual('');
  });

  test('when one or more messages return the topic of the last one', () => {
    const narrow = streamNarrow('hello');
    const state = deepFreeze({
      ...navStateWithNarrow(narrow),
      chat: {
        messages: {
          [JSON.stringify(narrow)]: [{ id: 1 }, { id: 2, subject: 'some topic' }],
        },
      },
    });

    const topic = getLastMessageTopic(state);

    expect(topic).toEqual('some topic');
  });
});
