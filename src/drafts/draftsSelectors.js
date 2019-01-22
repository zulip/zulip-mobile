/* @flow strict-local */
import { createSelector } from 'reselect';

import { getDrafts, getShareData } from '../directSelectors';
import type { Narrow, Selector, ShareDataType } from '../types';

export const getDraftForActiveNarrow = (narrow: Narrow): Selector<string> =>
  createSelector(getDrafts, drafts => drafts[JSON.stringify(narrow)] || '');

export const getDefaultTextForComposeBox = (narrow: Narrow): Selector<string> =>
  createSelector(
    getShareData,
    getDraftForActiveNarrow(narrow),
    (shareData: ?ShareDataType, draft: string) => {
      if (shareData && shareData.type === 'text') {
        return shareData.data;
      }
      return draft;
    },
  );
