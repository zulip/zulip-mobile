import deepFreeze from 'deep-freeze';

import { getDraftForActiveNarrow } from '../draftsSelectors';
import { topicNarrow } from '../../utils/narrow';

describe('getDraftForActiveNarrow', () => {
  test('return content of draft if exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [JSON.stringify(narrow)]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(narrow)(state);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [JSON.stringify(narrow)]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(topicNarrow('stream', 'topic1'))(state);

    expect(draft).toEqual('');
  });
});
