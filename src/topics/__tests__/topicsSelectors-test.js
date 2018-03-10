import deepFreeze from 'deep-freeze';

import { getTopicsforNarrow, getLastMessageTopic } from '../topicSelectors';
import { homeNarrow, streamNarrow } from '../../utils/narrow';

describe('getTopicsforNarrow', () => {
  test('when no topics return an empty list', () => {
    const state = deepFreeze({});

    const topics = getTopicsforNarrow(homeNarrow)(state);

    expect(topics).toEqual([]);
  });

  test('when there are topics in the active narrow, return them as string array', () => {
    const state = deepFreeze({
      streams: [{ stream_id: 123, name: 'hello' }],
      topics: {
        123: [{ name: 'hi' }, { name: 'wow' }],
      },
    });

    const topics = getTopicsforNarrow(streamNarrow('hello'))(state);

    expect(topics).toEqual(['hi', 'wow']);
  });
});

describe('getLastMessageTopic', () => {
  test('when no messages in narrow return an empty string', () => {
    const state = deepFreeze({
      messages: {},
    });

    const topic = getLastMessageTopic(homeNarrow)(state);

    expect(topic).toEqual('');
  });

  test('when one or more messages return the topic of the last one', () => {
    const narrow = streamNarrow('hello');
    const state = deepFreeze({
      messages: {
        [JSON.stringify(narrow)]: [{ id: 1 }, { id: 2, subject: 'some topic' }],
      },
    });

    const topic = getLastMessageTopic(narrow)(state);

    expect(topic).toEqual('some topic');
  });
});
