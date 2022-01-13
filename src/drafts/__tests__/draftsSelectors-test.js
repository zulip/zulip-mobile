/* @flow strict-local */

import { getDraftForNarrow } from '../draftsSelectors';
import { topicNarrow, keyFromNarrow } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getDraftForNarrow', () => {
  test('return content of draft if exists', () => {
    const narrow = topicNarrow(eg.stream.stream_id, 'topic');
    const state = eg.reduxState({
      drafts: {
        [keyFromNarrow(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, narrow);

    expect(draft).toEqual('content');
  });

  test('return empty string if not exists', () => {
    const narrow = topicNarrow(eg.stream.stream_id, 'topic');
    const state = eg.reduxState({
      drafts: {
        [keyFromNarrow(narrow)]: 'content',
      },
    });

    const draft = getDraftForNarrow(state, topicNarrow(eg.stream.stream_id, 'topic1'));

    expect(draft).toEqual('');
  });
});
