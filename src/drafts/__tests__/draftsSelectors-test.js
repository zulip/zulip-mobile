import deepFreeze from 'deep-freeze';

import { getDraftForNarrow } from '../draftsSelectors';
import { topicNarrow, keyFromNarrow } from '../../utils/narrow';

describe('getDraftForNarrow', () => {
  test('return content of draft if exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [keyFromNarrow(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, narrow);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [keyFromNarrow(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, topicNarrow('stream', 'topic1'));

    expect(draft).toEqual('');
  });
});
