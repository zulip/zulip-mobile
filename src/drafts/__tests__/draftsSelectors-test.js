import deepFreeze from 'deep-freeze';

import { getDraftForActiveNarrow } from '../draftsSelectors';
import { topicNarrow } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';

describe('getDraftForActiveNarrow', () => {
  test('return content of draft if exists', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(topicNarrow('stream', 'topic')),
      drafts: {
        [JSON.stringify(topicNarrow('stream', 'topic'))]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(state);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(topicNarrow('stream', 'topic1')),
      drafts: {
        [JSON.stringify(topicNarrow('stream', 'topic'))]: 'content',
      },
    });

    const draft = getDraftForActiveNarrow(state);

    expect(draft).toEqual('');
  });
});
