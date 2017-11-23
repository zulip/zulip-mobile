import deepFreeze from 'deep-freeze';

import { getTopicsInActiveNarrow } from '../topicSelectors';
import { homeNarrow, streamNarrow } from '../../utils/narrow';

describe('getTopicsInActiveNarrow', () => {
  test('when no topics return an empty list', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual([]);
  });

  test('when there are topics in the active narrow, return them as string array', () => {
    const state = deepFreeze({
      chat: {
        narrow: streamNarrow('hello'),
      },
      streams: [{ stream_id: 123, name: 'hello' }],
      topics: {
        123: [{ topic: 'hi' }, { topic: 'wow' }],
      },
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual(['hi', 'wow']);
  });
});
