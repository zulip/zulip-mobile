import deepFreeze from 'deep-freeze';

import { NULL_OBJECT } from '../../nullObjects';
import draftsReducers from '../draftsReducers';
import { DRAFT_ADD, DRAFT_REMOVE } from '../../actionConstants';
import { topicNarrow } from '../../utils/narrow';

describe('draftsReducers', () => {
  const getNarrowString = (narrow: Narrow) => JSON.stringify(narrow);

  describe(DRAFT_ADD, () => {
    test('add a new drafts to drafts', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: DRAFT_ADD,
        content: 'Hello',
        narrow: getNarrowString(topicNarrow('denmark', 'denmark2')),
      });

      const expectedState = {
        [getNarrowString(topicNarrow('denmark', 'denmark2'))]: 'Hello',
      };

      const actualState = draftsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('add same draft to drafts', () => {
      const initialState = deepFreeze({
        [getNarrowString(topicNarrow('denmark', 'denmark2'))]: 'Hello',
      });

      const action = deepFreeze({
        type: DRAFT_ADD,
        content: 'Hello',
        narrow: getNarrowString(topicNarrow('denmark', 'denmark2')),
      });

      const actualState = draftsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });

  describe(DRAFT_REMOVE, () => {
    test('remove draft on DRAFT_REMOVE', () => {
      const initialState = deepFreeze({
        [getNarrowString(topicNarrow('denmark', 'denmark2'))]: 'Hello',
      });

      const action = deepFreeze({
        type: DRAFT_REMOVE,
        content: 'Hello',
        narrow: getNarrowString(topicNarrow('denmark', 'denmark2')),
      });

      const expectedState = {};

      const actualState = draftsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('remove some other draft on DRAFT_REMOVE', () => {
      const initialState = deepFreeze({
        [getNarrowString(topicNarrow('denmark', 'denmark2'))]: 'Hello',
      });

      const action = deepFreeze({
        type: DRAFT_REMOVE,
        content: 'Hello',
        narrow: getNarrowString(topicNarrow('someOther', 'denmark2')),
      });

      const actualState = draftsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });
});
