import deepFreeze from 'deep-freeze';

import { getDraftForActiveNarrow } from '../draftsSelectors';
import { topicNarrow } from '../../utils/narrow';

describe('getDraftForActiveNarrow', () => {
  test('return content of draft if exists', () => {
    const state = deepFreeze({
      chat: {
        narrow: topicNarrow('stream', 'topic'),
      },
      drafts: {
        [JSON.stringify(topicNarrow('stream', 'topic'))]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(state);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const state = deepFreeze({
      chat: {
        narrow: topicNarrow('stream', 'topic1'),
      },
      drafts: {
        [JSON.stringify(topicNarrow('stream', 'topic'))]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(state);

    expect(draft).toEqual('');
  });
});
