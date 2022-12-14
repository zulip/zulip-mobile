/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import { NULL_OBJECT } from '../../nullObjects';
import draftsReducer from '../draftsReducer';
import { DRAFT_UPDATE } from '../../actionConstants';
import { topicNarrow, keyFromNarrow } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('draftsReducer', () => {
  const testNarrow = topicNarrow(eg.stream.stream_id, 'denmark2');
  const testNarrowStr = keyFromNarrow(testNarrow);

  describe('DRAFT_UPDATE', () => {
    test('add a new draft key drafts', () => {
      const prevState = NULL_OBJECT;
      expect(
        draftsReducer(
          prevState,
          deepFreeze({ type: DRAFT_UPDATE, content: 'Hello', narrow: testNarrow }),
        ),
      ).toEqual({ [testNarrowStr]: 'Hello' });
    });

    test('adding the same draft to drafts does not mutate the state', () => {
      const prevState = deepFreeze({ [testNarrowStr]: 'Hello' });
      expect(
        draftsReducer(
          prevState,
          deepFreeze({ type: DRAFT_UPDATE, content: 'Hello', narrow: testNarrow }),
        ),
      ).toBe(prevState);
    });

    test('when content is empty remove draft from state', () => {
      const prevState = deepFreeze({ [testNarrowStr]: 'Hello' });
      expect(
        draftsReducer(prevState, { type: DRAFT_UPDATE, content: '', narrow: testNarrow }),
      ).toEqual({});
    });

    test('remove draft when content is white space', () => {
      const prevState = deepFreeze({ [testNarrowStr]: 'Hello' });
      expect(
        draftsReducer(prevState, { type: DRAFT_UPDATE, content: '   ', narrow: testNarrow }),
      ).toEqual({});
    });

    test('do not mutate state if there is nothing to remove', () => {
      const prevState = NULL_OBJECT;
      expect(
        draftsReducer(
          prevState,
          deepFreeze({ type: DRAFT_UPDATE, content: '', narrow: testNarrow }),
        ),
      ).toBe(prevState);
    });
  });
});
