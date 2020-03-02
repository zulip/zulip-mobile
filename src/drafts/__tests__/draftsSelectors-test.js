import deepFreeze from 'deep-freeze';

import { getDraftForNarrow } from '../draftsSelectors';
import { topicNarrow } from '../../utils/narrow';

describe('getDraftForNarrow', () => {
  test('return content of draft if exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [JSON.stringify(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, narrow);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const narrow = topicNarrow('stream', 'topic');
    const state = deepFreeze({
      drafts: {
        [JSON.stringify(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, topicNarrow('stream', 'topic1'));

    expect(draft).toEqual('');
  });
});
