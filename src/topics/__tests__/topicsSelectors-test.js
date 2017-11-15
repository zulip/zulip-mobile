import deepFreeze from 'deep-freeze';

import { getTopicsInActiveNarrow } from '../topicSelectors';
import { homeNarrow, streamNarrow } from '../../utils/narrow';

describe('getTopicsInActiveNarrow', () => {
  test('when ', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual([]);
  });

  test('when do', () => {
    const state = deepFreeze({
      chat: {
        narrow: streamNarrow('hello'),
      },
      streams: [{ stream_id: 123, name: 'hello' }],
      topics: {
        123: ['hi', 'wow'],
      },
    });

    const topics = getTopicsInActiveNarrow(state);

    expect(topics).toEqual(['hi', 'wow']);
  });
});
